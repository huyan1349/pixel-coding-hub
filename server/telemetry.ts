import { execSync } from 'child_process';
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

export function getProcessTelemetry(pid: number | null): ProcessTelemetry {
  if (!pid) {
    return { pid: null, cpu: '—', ram: '—', uptime: '—', activeFile: '—', threads: 0, totalCpu: '—', totalRam: '—', processCount: 0, subProcesses: [] };
  }

  try {
    const psOutput = execSync(
      `ps -p ${pid} -o '%cpu=,rss=,etime=' 2>/dev/null`,
      { encoding: 'utf-8', timeout: 3000 },
    ).trim();

    const parts = psOutput.split(/\s+/).filter(Boolean);
    const cpu = parts[0] ? `${parseFloat(parts[0]).toFixed(1)}%` : '—';
    const ramBytes = parts[1] ? parseInt(parts[1], 10) * 1024 : 0;
    const ram = ramBytes > 0 ? formatBytes(ramBytes) : '—';
    const uptime = parts[2] || '—';

    let activeFile = '—';
    try {
      const lsofOutput = execSync(
        `lsof -p ${pid} -Fn 2>/dev/null | grep -E '\\.(tsx?|jsx?|py|rs|css|html)$' | head -1 | cut -c2-`,
        { encoding: 'utf-8', timeout: 3000 },
      ).trim();
      if (lsofOutput) {
        const segs = lsofOutput.split('/');
        activeFile = segs[segs.length - 1] || lsofOutput;
      }
    } catch { /* lsof may fail */ }

    return { pid, cpu, ram, uptime, activeFile, threads: 0, totalCpu: cpu, totalRam: ram, processCount: 1, subProcesses: [] };
  } catch {
    return { pid, cpu: '—', ram: '—', uptime: '—', activeFile: '—', threads: 0, totalCpu: '—', totalRam: '—', processCount: 0, subProcesses: [] };
  }
}

export function getMultiProcessTelemetry(mainPid: number, processName: string): ProcessTelemetry {
  const mainTele = getProcessTelemetry(mainPid);

  try {
    const allPsOutput = execSync(
      `ps aux | grep "${processName}" | grep -v grep`,
      { encoding: 'utf-8', timeout: 5000 },
    ).trim();

    if (!allPsOutput) {
      return { ...mainTele, totalCpu: '—', totalRam: '—', processCount: 0, subProcesses: [] };
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

    return {
      ...mainTele,
      totalCpu: `${totalCpuVal.toFixed(1)}%`,
      totalRam: formatBytes(totalRamVal),
      processCount: lines.length,
      subProcesses: subProcesses.slice(0, 6),
    };
  } catch {
    return { ...mainTele, totalCpu: mainTele.cpu, totalRam: mainTele.ram, processCount: 1, subProcesses: [] };
  }
}

export function getClaudeCodeTelemetry(): ClaudeCodeTelemetry {
  const homeDir = process.env.HOME || '/Users/huyan';
  let claudePid: number | null = null;
  let workingDir: string | null = null;

  try {
    const pgrepOutput = execSync(
      `pgrep -x Claude 2>/dev/null`,
      { encoding: 'utf-8', timeout: 3000 },
    ).trim();
    if (pgrepOutput) {
      claudePid = parseInt(pgrepOutput.split('\n')[0], 10);
    }
  } catch { /* no claude process */ }

  if (claudePid) {
    try {
      const cwdOutput = execSync(
        `lsof -p ${claudePid} -Fn 2>/dev/null | grep '^n/' | grep -v '/\\.claude' | grep -v '/Library' | grep -v '/System' | tail -1 | cut -c2-`,
        { encoding: 'utf-8', timeout: 3000 },
      ).trim();
      if (cwdOutput) {
        const segs = cwdOutput.split('/');
        workingDir = segs.slice(0, -1).join('/') || cwdOutput;
      }
    } catch { /* no cwd */ }
  }

  const baseTele = claudePid ? getProcessTelemetry(claudePid) : getProcessTelemetry(null);

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
          lastActivity = ago < 60000 ? `${Math.floor(ago / 1000)}s ago` :
                         ago < 3600000 ? `${Math.floor(ago / 60000)}m ago` :
                         `${Math.floor(ago / 3600000)}h ago`;
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
              lastActivity = ago < 60000 ? `${Math.floor(ago / 1000)}s ago` :
                             ago < 3600000 ? `${Math.floor(ago / 60000)}m ago` :
                             `${Math.floor(ago / 3600000)}h ago`;
            }
          } catch { /* skip */ }
        }
      }
    } catch { /* no history */ }

    try {
      const subPsOutput = execSync(
        `pgrep -P ${claudePid} 2>/dev/null | wc -l`,
        { encoding: 'utf-8', timeout: 3000 },
      ).trim();
      subProcessCount = parseInt(subPsOutput, 10) || 0;
    } catch { /* no subs */ }

    try {
      const shellSnapshots = execSync(
        `ls /tmp/claude-*-cwd 2>/dev/null | wc -l`,
        { encoding: 'utf-8', timeout: 3000 },
      ).trim();
      subProcessCount += parseInt(shellSnapshots, 10) || 0;
    } catch { /* no snapshots */ }
  }

  return {
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
}

export function getTraeTelemetry(mainPid: number): TraeTelemetry {
  const homeDir = process.env.HOME || '/Users/huyan';
  const baseTele = getMultiProcessTelemetry(mainPid, 'TRAE SOLO CN');
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
          const timeStr = ago < 60000 ? `${Math.floor(ago / 1000)}s ago` :
                          ago < 3600000 ? `${Math.floor(ago / 60000)}m ago` :
                          `${Math.floor(ago / 3600000)}h ago`;
          recentActivity.push(`sandbox updated ${timeStr}`);
        }
      }

      const dbPath = path.resolve(aiAgentDir, 'database.db');
      if (fs.existsSync(dbPath)) {
        const stat = fs.statSync(dbPath);
        const ago = Date.now() - stat.mtime.getTime();
        const timeStr = ago < 60000 ? `${Math.floor(ago / 1000)}s ago` :
                        ago < 3600000 ? `${Math.floor(ago / 60000)}m ago` :
                        `${Math.floor(ago / 3600000)}h ago`;
        recentActivity.push(`AI DB modified ${timeStr}`);

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
            const ago = Date.now() - apiTime;
            lastApiCall = ago < 60000 ? `${Math.floor(ago / 1000)}s ago` :
                          ago < 3600000 ? `${Math.floor(ago / 60000)}m ago` :
                          `${Math.floor(ago / 3600000)}h ago`;
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

        const tailLines = execSync(
          `tail -50 "${latestAhaLog}" 2>/dev/null | grep -i "ai\\|agent\\|chat\\|conversation" | tail -3`,
          { encoding: 'utf-8', timeout: 3000 },
        ).trim().split('\n').filter(Boolean);

        for (const line of tailLines) {
          if (line.includes('ai') || line.includes('agent')) {
            const cleanLine = line.replace(/^.*?\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[^ ]* /, '').trim();
            if (cleanLine) {
              recentActivity.push(cleanLine.slice(0, 80));
            }
          }
        }
      }
    }
  } catch { /* no aha logs */ }

  return {
    ...baseTele,
    aiAgentActive,
    currentProject,
    recentActivity: recentActivity.slice(-8),
    apiCallCount,
    lastApiCall,
    sandboxSessions,
  };
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
