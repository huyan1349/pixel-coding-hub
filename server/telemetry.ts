import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export interface ProcessTelemetry {
  pid: number | null;
  cpu: string;
  ram: string;
  uptime: string;
  activeFile: string;
  threads: number;
  totalCpu: string;
  totalRam: string;
  processCount: number;
  subProcesses: Array<{ pid: number; role: string; cpu: string; ram: string }>;
}

export interface CloudTelemetry {
  latency: string;
  tokens: number;
  phase: string;
  load: number;
  requests: number;
}

export interface ClaudeCodeTelemetry extends ProcessTelemetry {
  activeSession: boolean;
  sessionStatus: 'busy' | 'idle' | 'none';
  workingDir: string | null;
  model: string;
  totalCost: string;
  sessionCount: number;
  continuousWorkTime: string;
  currentTask: string;
  lastActivity: string;
  subProcessCount: number;
  version: string;
  sessionId: string | null;
}

export interface TraeTelemetry extends ProcessTelemetry {
  aiAgentActive: boolean;
  currentProject: string;
  recentActivity: string[];
  apiCallCount: number;
  lastApiCall: string;
  sandboxSessions: number;
}

// ── Cache Layer ──────────────────────────────────────────
const CACHE_TTL = 8_000; // 8 seconds

interface CacheEntry<T> {
  data: T;
  ts: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T): T {
  cache.set(key, { data, ts: Date.now() });
  return data;
}

// ── Async shell helper ──────────────────────────────────
function execAsync(cmd: string, timeout = 3000): Promise<string> {
  return new Promise((resolve) => {
    exec(cmd, { encoding: 'utf-8', timeout }, (err, stdout) => {
      resolve(err ? '' : (stdout || '').trim());
    });
  });
}

// ── Async telemetry functions ───────────────────────────

export async function getProcessTelemetry(pid: number | null): Promise<ProcessTelemetry> {
  const empty: ProcessTelemetry = { pid: null, cpu: '—', ram: '—', uptime: '—', activeFile: '—', threads: 0, totalCpu: '—', totalRam: '—', processCount: 0, subProcesses: [] };
  if (!pid) return empty;

  const cacheKey = `proc:${pid}`;
  const cached = getCached<ProcessTelemetry>(cacheKey);
  if (cached) return cached;

  try {
    const psOutput = await execAsync(`ps -p ${pid} -o '%cpu=,rss=,etime=' 2>/dev/null`, 3000);
    if (!psOutput) return { ...empty, pid };

    const parts = psOutput.split(/\s+/).filter(Boolean);
    const cpu = parts[0] ? `${parseFloat(parts[0]).toFixed(1)}%` : '—';
    const ramBytes = parts[1] ? parseInt(parts[1], 10) * 1024 : 0;
    const ram = ramBytes > 0 ? formatBytes(ramBytes) : '—';
    const uptime = parts[2] || '—';

    let activeFile = '—';
    const lsofOutput = await execAsync(
      `lsof -p ${pid} -Fn 2>/dev/null | grep -E '\\.(tsx?|jsx?|py|rs|css|html)$' | head -1 | cut -c2-`,
      3000,
    );
    if (lsofOutput) {
      const segs = lsofOutput.split('/');
      activeFile = segs[segs.length - 1] || lsofOutput;
    }

    const result: ProcessTelemetry = { pid, cpu, ram, uptime, activeFile, threads: 0, totalCpu: cpu, totalRam: ram, processCount: 1, subProcesses: [] };
    return setCache(cacheKey, result);
  } catch {
    return { ...empty, pid };
  }
}

export async function getMultiProcessTelemetry(mainPid: number, processName: string): Promise<ProcessTelemetry> {
  const cacheKey = `multi:${mainPid}:${processName}`;
  const cached = getCached<ProcessTelemetry>(cacheKey);
  if (cached) return cached;

  const mainTele = await getProcessTelemetry(mainPid);

  try {
    const allPsOutput = await execAsync(`ps aux | grep "${processName}" | grep -v grep`, 5000);

    if (!allPsOutput) {
      const result = { ...mainTele, totalCpu: '—', totalRam: '—', processCount: 0, subProcesses: [] };
      return setCache(cacheKey, result);
    }

    const lines = allPsOutput.split('\n');
    let totalCpuVal = 0;
    let totalRamVal = 0;
    const subProcesses: Array<{ pid: number; role: string; cpu: string; ram: string }> = [];

    for (const line of lines) {
      const parts = line.split(/\s+/).filter(Boolean);
      if (parts.length < 6) continue;

      const pPid = parseInt(parts[1], 10);
      const pCpu = parseFloat(parts[2]);
      const pRamKb = parseInt(parts[5], 10);

      totalCpuVal += pCpu;
      totalRamVal += pRamKb * 1024;

      let role = 'helper';
      if (line.includes('Renderer')) role = 'renderer';
      else if (line.includes('GPU')) role = 'gpu';
      else if (line.includes('Plugin')) role = 'plugin';
      else if (line.includes('Electron') && !line.includes('Helper')) role = 'main';
      else if (line.includes('sandbox') && line.includes('exec')) role = 'sandbox';
      else if (line.includes('crash-reporter-process-type=ai')) role = 'ai-agent';
      else if (line.includes('fileWatcher')) role = 'file-watcher';
      else if (line.includes('shared-process')) role = 'shared';

      if (pPid !== mainPid) {
        subProcesses.push({
          pid: pPid,
          role,
          cpu: `${pCpu.toFixed(1)}%`,
          ram: formatBytes(pRamKb * 1024),
        });
      }
    }

    const result: ProcessTelemetry = {
      ...mainTele,
      totalCpu: `${totalCpuVal.toFixed(1)}%`,
      totalRam: formatBytes(totalRamVal),
      processCount: lines.length,
      subProcesses: subProcesses.slice(0, 6),
    };
    return setCache(cacheKey, result);
  } catch {
    return { ...mainTele, totalCpu: mainTele.cpu, totalRam: mainTele.ram, processCount: 1, subProcesses: [] };
  }
}

export async function getClaudeCodeTelemetry(): Promise<ClaudeCodeTelemetry> {
  const cacheKey = 'claude-code';
  const cached = getCached<ClaudeCodeTelemetry>(cacheKey);
  if (cached) return cached;

  const homeDir = process.env.HOME || '/Users/huyan';
  let claudePid: number | null = null;
  let workingDir: string | null = null;

  const pgrepOutput = await execAsync(`pgrep -x Claude 2>/dev/null`, 3000);
  if (pgrepOutput) {
    claudePid = parseInt(pgrepOutput.split('\n')[0], 10);
  }

  if (claudePid) {
    const cwdOutput = await execAsync(
      `lsof -p ${claudePid} -Fn 2>/dev/null | grep '^n/' | grep -v '/\\.claude' | grep -v '/Library' | grep -v '/System' | tail -1 | cut -c2-`,
      3000,
    );
    if (cwdOutput) {
      const segs = cwdOutput.split('/');
      workingDir = segs.slice(0, -1).join('/') || cwdOutput;
    }
  }

  const baseTele = await getProcessTelemetry(claudePid);

  let totalCost = '$0.00';
  let sessionCount = 0;
  try {
    const historyPath = path.resolve(homeDir, '.claude/history.jsonl');
    if (fs.existsSync(historyPath)) {
      const history = fs.readFileSync(historyPath, 'utf-8');
      const lines = history.split('\n').filter(Boolean);
      sessionCount = lines.length;
      let cost = 0;
      for (const line of lines.slice(-20)) {
        try {
          const entry = JSON.parse(line);
          if (entry.cost_usd) cost += entry.cost_usd;
        } catch { /* skip */ }
      }
      totalCost = `$${cost.toFixed(2)}`;
    }
  } catch { /* no history */ }

  let sessionStatus: 'busy' | 'idle' | 'none' = 'none';
  let sessionId: string | null = null;
  let continuousWorkTime = '—';
  let currentTask = '—';
  let lastActivity = '—';
  let version = '—';
  let subProcessCount = 0;

  if (claudePid) {
    try {
      const sessionPath = path.resolve(homeDir, `.claude/sessions/${claudePid}.json`);
      if (fs.existsSync(sessionPath)) {
        const sessionData = JSON.parse(fs.readFileSync(sessionPath, 'utf-8'));
        sessionId = sessionData.sessionId || null;
        sessionStatus = sessionData.status === 'busy' ? 'busy' : 'idle';
        version = sessionData.version || '—';

        if (sessionData.startedAt) {
          const startedAt = sessionData.startedAt;
          const updatedAt = sessionData.updatedAt || Date.now();
          const workMs = updatedAt - startedAt;
          continuousWorkTime = formatDuration(workMs);
        }

        if (sessionData.updatedAt) {
          const ago = Date.now() - sessionData.updatedAt;
          lastActivity = formatAgo(ago);
        }
      }
    } catch { /* no session file */ }

    try {
      const historyPath = path.resolve(homeDir, '.claude/history.jsonl');
      if (fs.existsSync(historyPath)) {
        const history = fs.readFileSync(historyPath, 'utf-8');
        const lines = history.split('\n').filter(Boolean);
        if (lines.length > 0) {
          try {
            const lastEntry = JSON.parse(lines[lines.length - 1]);
            if (lastEntry.display) {
              currentTask = lastEntry.display.length > 60
                ? lastEntry.display.slice(0, 57) + '...'
                : lastEntry.display;
            }
            if (lastEntry.timestamp) {
              const ago = Date.now() - lastEntry.timestamp;
              lastActivity = formatAgo(ago);
            }
          } catch { /* skip */ }
        }
      }
    } catch { /* no history */ }

    const subPsOutput = await execAsync(`pgrep -P ${claudePid} 2>/dev/null | wc -l`, 3000);
    subProcessCount = parseInt(subPsOutput, 10) || 0;

    const shellSnapshots = await execAsync(`ls /tmp/claude-*-cwd 2>/dev/null | wc -l`, 3000);
    subProcessCount += parseInt(shellSnapshots, 10) || 0;
  }

  const result: ClaudeCodeTelemetry = {
    ...baseTele,
    totalCpu: baseTele.cpu,
    totalRam: baseTele.ram,
    processCount: claudePid ? 1 : 0,
    subProcesses: [],
    activeSession: !!claudePid,
    sessionStatus,
    workingDir,
    model: process.env.ANTHROPIC_MODEL || 'deepseek-v4-pro',
    totalCost,
    sessionCount,
    continuousWorkTime,
    currentTask,
    lastActivity,
    subProcessCount,
    version,
    sessionId,
  };
  return setCache(cacheKey, result);
}

export async function getTraeTelemetry(mainPid: number): Promise<TraeTelemetry> {
  const cacheKey = `trae:${mainPid}`;
  const cached = getCached<TraeTelemetry>(cacheKey);
  if (cached) return cached;

  const homeDir = process.env.HOME || '/Users/huyan';
  const baseTele = await getMultiProcessTelemetry(mainPid, 'TRAE SOLO CN');
  const traeDataDir = path.resolve(homeDir, 'Library/Application Support/TRAE SOLO CN 2');

  let aiAgentActive = false;
  let currentProject = '—';
  const recentActivity: string[] = [];
  let apiCallCount = 0;
  let lastApiCall = '—';
  let sandboxSessions = 0;

  try {
    const workspaceJsonPath = path.resolve(traeDataDir, 'Workspaces');
    if (fs.existsSync(workspaceJsonPath)) {
      const workspaces = fs.readdirSync(workspaceJsonPath);
      for (const ws of workspaces) {
        const wsJsonPath = path.resolve(workspaceJsonPath, ws, 'workspace.json');
        if (fs.existsSync(wsJsonPath)) {
          try {
            const wsData = JSON.parse(fs.readFileSync(wsJsonPath, 'utf-8'));
            if (wsData.folders && wsData.folders.length > 0) {
              const folderPath = wsData.folders[0].path;
              currentProject = folderPath.replace(/^\.\/|\.\.\/+/g, '').split('/').pop() || folderPath;
            }
          } catch { /* skip */ }
        }
      }
    }
  } catch { /* no workspace */ }

  try {
    const aiAgentDir = path.resolve(traeDataDir, 'ModularData/ai-agent');
    if (fs.existsSync(aiAgentDir)) {
      const sandboxDir = path.resolve(aiAgentDir, 'sandbox');
      if (fs.existsSync(sandboxDir)) {
        const sandboxFiles = fs.readdirSync(sandboxDir).filter(f => f.endsWith('.json') && !f.includes('hooks'));
        sandboxSessions = sandboxFiles.length;

        const latestSandbox = sandboxFiles
          .map(f => ({ name: f, mtime: fs.statSync(path.resolve(sandboxDir, f)).mtime.getTime() }))
          .sort((a, b) => b.mtime - a.mtime)[0];

        if (latestSandbox) {
          const ago = Date.now() - latestSandbox.mtime;
          recentActivity.push(`sandbox updated ${formatAgo(ago)}`);
        }
      }

      const dbPath = path.resolve(aiAgentDir, 'database.db');
      if (fs.existsSync(dbPath)) {
        const stat = fs.statSync(dbPath);
        const ago = Date.now() - stat.mtime.getTime();
        recentActivity.push(`AI DB modified ${formatAgo(ago)}`);

        if (ago < 60000) {
          aiAgentActive = true;
        }
      }
    }
  } catch { /* no ai-agent data */ }

  try {
    const ckgLogDir = path.resolve(traeDataDir, 'ModularData/ckg_server');
    if (fs.existsSync(ckgLogDir)) {
      const logFiles = fs.readdirSync(ckgLogDir)
        .filter(f => f.startsWith('codekg.log.'))
        .sort()
        .reverse();

      if (logFiles.length > 0) {
        const latestLog = path.resolve(ckgLogDir, logFiles[0]);
        const logContent = fs.readFileSync(latestLog, 'utf-8');
        const logLines = logContent.split('\n').filter(Boolean);

        const apiLines = logLines.filter(l => l.includes('ahanet OnComplete'));
        apiCallCount = apiLines.length;

        const lastApiLine = apiLines[apiLines.length - 1];
        if (lastApiLine) {
          const timeMatch = lastApiLine.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
          if (timeMatch) {
            const apiTime = new Date(timeMatch[1]).getTime();
            lastApiCall = formatAgo(Date.now() - apiTime);
          }
        }

        const recentLines = logLines.slice(-10);
        for (const line of recentLines) {
          if (line.includes('RoundTrip')) {
            const urlMatch = line.match(/url=(\S+)/);
            if (urlMatch) {
              const url = urlMatch[1];
              const endpoint = url.split('/').pop() || url;
              recentActivity.push(`API → ${endpoint}`);
            }
          }
        }
      }
    }
  } catch { /* no ckg logs */ }

  try {
    const ahaLogDir = path.resolve(traeDataDir, 'logs/aha_log');
    if (fs.existsSync(ahaLogDir)) {
      const ahaLogs = fs.readdirSync(ahaLogDir)
        .filter(f => f.includes('aha_electron') && f.endsWith('.log'))
        .sort()
        .reverse();

      if (ahaLogs.length > 0) {
        const latestAhaLog = path.resolve(ahaLogDir, ahaLogs[0]);
        const stat = fs.statSync(latestAhaLog);
        const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
        recentActivity.push(`electron log ${sizeMB}MB`);

        // Read last 2KB of log instead of spawning tail+grep
        const fd = fs.openSync(latestAhaLog, 'r');
        const readSize = Math.min(stat.size, 2048);
        const buf = Buffer.alloc(readSize);
        fs.readSync(fd, buf, 0, readSize, stat.size - readSize);
        fs.closeSync(fd);

        const tailContent = buf.toString('utf-8');
        const tailLines = tailContent.split('\n').filter(l =>
          (l.includes('ai') || l.includes('agent')) && l.trim(),
        ).slice(-3);

        for (const line of tailLines) {
          const cleanLine = line.replace(/^.*?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^ ]* /, '').trim();
          if (cleanLine) {
            recentActivity.push(cleanLine.slice(0, 80));
          }
        }
      }
    }
  } catch { /* no aha logs */ }

  const result: TraeTelemetry = {
    ...baseTele,
    aiAgentActive,
    currentProject,
    recentActivity: recentActivity.slice(-8),
    apiCallCount,
    lastApiCall,
    sandboxSessions,
  };
  return setCache(cacheKey, result);
}

export function getCloudTelemetry(
  lastRequestTime: number | null,
  tokenCount: number,
  phase: string,
): CloudTelemetry {
  let latency = '—';
  if (lastRequestTime) {
    const ms = Date.now() - lastRequestTime;
    latency = ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  }

  const load = Math.min(100, Math.floor(tokenCount / 20));
  const requests = tokenCount > 0 ? Math.ceil(tokenCount / 500) : 0;

  return { latency, tokens: tokenCount, phase, load, requests };
}

// ── Helpers ─────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms < 0) return '—';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function formatAgo(ms: number): string {
  if (ms < 60000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ago`;
  return `${Math.floor(ms / 3600000)}h ago`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(0)}MB`;
}

export function getSystemMemory(): { used: string; total: string; percent: number } {
  const mem = process.memoryUsage();
  const used = formatBytes(mem.heapUsed);
  const total = formatBytes(mem.rss);
  const percent = Math.floor((mem.heapUsed / mem.rss) * 100);
  return { used, total, percent };
}
