interface CoordinatorMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CoordinatorResult {
  output: string;
  success: boolean;
  actions?: CoordinatorAction[];
}

export interface CoordinatorAction {
  agent: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  dependsOn?: string[];
}

interface ChatChunk {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string;
  }>;
  error?: { message: string };
}

const SYSTEM_PROMPT = `You are the Coordinator AI of Pixel Coding Hub — a multi-agent orchestration system.

Your role is to:
1. ANALYZE the user's request and break it into subtasks
2. ASSIGN subtasks to the appropriate agents based on their capabilities
3. REVIEW outputs from all agents and identify issues or improvements
4. SYNTHESIZE final results into a coherent response

Available agents:
- Claude Code (claude): Code review, refactoring, testing, architecture decisions. Uses DeepSeek API.
- Trae Solo CN (trae): IDE-based AI assistant, UI implementation, file editing, workspace management.
- Codex (codex): Code generation, function implementation, API integration.

Output format for task assignments:
[ACTION] agent=<agent_id> task=<description> priority=<high|medium|low>

When reviewing outputs:
[REVIEW] status=<pass|fail|needs_work> comment=<feedback>

When synthesizing:
[SYNTHESIS] <final combined result>

Be concise, actionable, and prioritize correctness over speed.`;

export async function coordinatorAnalyze(
  prompt: string,
  apiKey: string,
  baseUrl: string,
  model: string,
  onChunk: (text: string) => void,
  agentOutputs?: Record<string, string>,
): Promise<CoordinatorResult> {
  const messages: CoordinatorMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  let userContent = prompt;
  if (agentOutputs && Object.keys(agentOutputs).length > 0) {
    userContent += '\n\n--- Agent Outputs ---\n';
    for (const [agent, output] of Object.entries(agentOutputs)) {
      userContent += `\n[${agent}]:\n${output.slice(0, 2000)}\n`;
    }
  }

  messages.push({ role: 'user', content: userContent });

  const output: string[] = [];

  try {
    const apiBase = baseUrl.replace(/\/anthropic$/, '').replace(/\/v1$/, '') + '/v1';
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      onChunk(`[COORDINATOR ERROR ${response.status}] ${errText.slice(0, 200)}`);
      return { output: output.join(''), success: false };
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk('[COORDINATOR ERROR] No response body');
      return { output: output.join(''), success: false };
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') break;

        try {
          const chunk: ChatChunk = JSON.parse(payload);
          if (chunk.error) {
            onChunk(`[COORDINATOR ERROR] ${chunk.error.message}`);
            break;
          }
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            output.push(content);
            onChunk(content);
          }
        } catch {
          // skip malformed
        }
      }
    }

    const fullOutput = output.join('');
    const actions = parseActions(fullOutput);

    return { output: fullOutput, success: true, actions };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    onChunk(`[COORDINATOR ERROR] ${msg}`);
    return { output: output.join(''), success: false };
  }
}

function parseActions(text: string): CoordinatorAction[] {
  const actions: CoordinatorAction[] = [];
  const regex = /\[ACTION\]\s*agent=(\S+)\s+task=(.+?)\s+priority=(high|medium|low)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    actions.push({
      agent: match[1],
      task: match[2].trim(),
      priority: match[3] as 'high' | 'medium' | 'low',
    });
  }

  return actions;
}
