interface ChatChunk {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string;
  }>;
  error?: { message: string };
}

export async function streamCodex(
  prompt: string,
  apiKey: string,
  onChunk: (text: string) => void,
  baseUrl = 'https://api.openai.com/v1',
): Promise<{ output: string; success: boolean }> {
  const output: string[] = [];

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are Codex, a code generation agent. Output only code, no explanations.' },
          { role: 'user', content: prompt },
        ],
        stream: true,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      onChunk(`[API ERROR ${response.status}] ${errText.slice(0, 200)}`);
      return { output: output.join(''), success: false };
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onChunk('[ERROR] No response body');
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
        if (payload === '[DONE]') {
          onChunk('[CODE GEN COMPLETE]');
          break;
        }

        try {
          const chunk: ChatChunk = JSON.parse(payload);
          if (chunk.error) {
            onChunk(`[API ERROR] ${chunk.error.message}`);
            break;
          }
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            output.push(content);
            onChunk(content);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    return { output: output.join(''), success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    onChunk(`[NETWORK ERROR] ${msg}`);
    return { output: output.join(''), success: false };
  }
}
