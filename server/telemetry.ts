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
  workingDir: string | null;
  model: string;
  totalCost: string;
  sessionCount: number;
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
    const historyPath = path.resolve(process.env.HOME || '/Users/huyan', '.claude/history.jsonl');
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

  return {
    ...baseTele,
    totalCpu: baseTele.cpu,
    totalRam: baseTele.ram,
    processCount: claudePid ? 1 : 0,
    subProcesses: [],
    activeSession: !!claudePid,
    workingDir,
    model: process.env.ANTHROPIC_MODEL || 'deepseek-v4-pro',
    totalCost,
    sessionCount,
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
