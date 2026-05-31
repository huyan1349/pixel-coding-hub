import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';

interface TraeStatus {
  running: boolean;
  pid: number | null;
  workspaceDir: string | null;
  recentFiles: string[];
  aiActive: boolean;
}

const TRAE_PROCESS_NAME = 'TRAE SOLO CN';
const TRAE_DATA_DIR = path.resolve(
  process.env.HOME || '/Users/huyan',
  'Library/Application Support/TRAE SOLO CN 2',
);

let fileWatcher: ReturnType<typeof chokidar.watch> | null = null;
let recentChanges: Array<{ file: string; timestamp: number; event: string }> = [];

export function detectTraeStatus(): Promise<TraeStatus> {
  return new Promise((resolve) => {
    exec('ps aux', (error, stdout) => {
      if (error) {
        resolve({ running: false, pid: null, workspaceDir: null, recentFiles: [], aiActive: false });
        return;
      }

      const lines = stdout.split('\n');
      const traeMainProc = lines.find(
        (l) => l.includes(TRAE_PROCESS_NAME) && l.includes('Electron') && !l.includes('Helper'),
      );

      if (!traeMainProc) {
        resolve({ running: false, pid: null, workspaceDir: null, recentFiles: [], aiActive: false });
        return;
      }

      const pidMatch = traeMainProc.match(/^\S+\s+(\d+)/);
      const pid = pidMatch ? parseInt(pidMatch[1], 10) : null;

      const aiProc = lines.find(
        (l) => l.includes(TRAE_PROCESS_NAME) && l.includes('crash-reporter-process-type=ai'),
      );

      const sandboxProc = lines.find(
        (l) => l.includes('trae-sandbox') && l.includes('exec'),
      );

      let workspaceDir: string | null = null;
      if (sandboxProc) {
        const cmdMatch = sandboxProc.match(/--command-line\s+(.+)$/);
        if (cmdMatch) {
          const cdMatch = cmdMatch[1].match(/cd\s+(\S+)/);
          if (cdMatch) workspaceDir = cdMatch[1];
        }
      }

      const recentFiles = recentChanges
        .slice(-10)
        .map((c) => c.file);

      resolve({
        running: true,
        pid,
        workspaceDir,
        recentFiles,
        aiActive: !!aiProc,
      });
    });
  });
}

export function startFileWatcher(
  watchDir: string,
  onChange: (file: string, event: string) => void,
): void {
  if (fileWatcher) {
    fileWatcher.close();
  }

  recentChanges = [];

  fileWatcher = chokidar.watch(watchDir, {
    ignored: [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/.cache/**',
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  });

  fileWatcher.on('all', (event, filePath) => {
    const entry = { file: filePath, timestamp: Date.now(), event };
    recentChanges.push(entry);
    if (recentChanges.length > 50) recentChanges = recentChanges.slice(-50);
    onChange(filePath, event);
  });
}

export function stopFileWatcher(): void {
  if (fileWatcher) {
    fileWatcher.close();
    fileWatcher = null;
  }
  recentChanges = [];
}

export function getRecentChanges(): Array<{ file: string; timestamp: number; event: string }> {
  return recentChanges.slice(-20);
}

export function readTraeAIConversations(): Array<{ role: string; content: string }> {
  const modularDir = path.join(TRAE_DATA_DIR, 'ModularData');
  if (!fs.existsSync(modularDir)) return [];

  try {
    const aiAgentDir = path.join(modularDir, 'ai-agent');
    if (!fs.existsSync(aiAgentDir)) return [];

    const sessions = fs.readdirSync(aiAgentDir).filter((d) =>
      fs.statSync(path.join(aiAgentDir, d)).isDirectory(),
    );

    const conversations: Array<{ role: string; content: string }> = [];

    for (const session of sessions.slice(-3)) {
      const sessionDir = path.join(aiAgentDir, session);
      const files = fs.readdirSync(sessionDir);
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const content = fs.readFileSync(path.join(sessionDir, file), 'utf-8');
            const data = JSON.parse(content);
            if (data.messages && Array.isArray(data.messages)) {
              for (const msg of data.messages) {
                conversations.push({
                  role: msg.role || 'unknown',
                  content: typeof msg.content === 'string'
                    ? msg.content.slice(0, 500)
                    : JSON.stringify(msg.content).slice(0, 500),
                });
              }
            }
          } catch {
            // skip malformed
          }
        }
      }
    }

    return conversations.slice(-20);
  } catch {
    return [];
  }
}

export function readWorkspaceFile(relativePath: string): string | null {
  try {
    const fullPath = path.resolve(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, 'utf-8');
  } catch {
    return null;
  }
}

export function cleanupTraeBridge(): void {
  stopFileWatcher();
}
