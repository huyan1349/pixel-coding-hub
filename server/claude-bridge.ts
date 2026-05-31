import { spawn, execSync, type ChildProcess } from 'child_process';

interface ClaudeBridgeResult {
  output: string;
  success: boolean;
}

const activeProcesses = new Set<ChildProcess>();

export function spawnClaude(
  prompt: string,
  onChunk: (text: string) => void,
): Promise<ClaudeBridgeResult> {
  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL || '',
      ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || '',
      CLAUDE_CODE_SUBAGENT_MODEL: process.env.CLAUDE_CODE_SUBAGENT_MODEL || '',
    };

    const args = ['-p', prompt, '--output-format', 'stream-json', '--verbose'];

    const proc = spawn('claude', args, {
      env,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    activeProcesses.add(proc);

    let output = '';

    proc.stdout.on('data', (data: Buffer) => {
      const text = data.toString();
      output += text;
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.type === 'assistant' && parsed.message?.content) {
            const content = parsed.message.content;
            if (Array.isArray(content)) {
              for (const block of content) {
                if (block.type === 'text' && block.text) {
                  onChunk(block.text);
                }
              }
            }
          } else if (parsed.type === 'result') {
            onChunk('[COMPLETE]');
          }
        } catch {
          onChunk(text.trim());
        }
      }
    });

    proc.stderr.on('data', (data: Buffer) => {
      const text = data.toString().trim();
      if (text && !text.includes('Warning') && !text.includes('Deprecation')) {
        onChunk(`[stderr] ${text}`);
      }
    });

    proc.on('close', (code) => {
      activeProcesses.delete(proc);
      resolve({ output, success: code === 0 });
    });

    proc.on('error', (err) => {
      activeProcesses.delete(proc);
      reject(err);
    });

    setTimeout(() => {
      if (activeProcesses.has(proc)) {
        proc.kill('SIGTERM');
        activeProcesses.delete(proc);
        resolve({ output: output || '[TIMEOUT]', success: false });
      }
    }, 120000);
  });
}

export function isClaudeInstalled(): boolean {
  try {
    execSync('which claude', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function killAllClaudeProcesses(): void {
  for (const proc of activeProcesses) {
    proc.kill('SIGTERM');
  }
  activeProcesses.clear();
}
