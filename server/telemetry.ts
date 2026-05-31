import { execSync } from 'child_process';

export interface ProcessTelemetry {
  pid: number | null;
  cpu: string;
  ram: string;
  uptime: string;
  activeFile: string;
  threads: number;
}

export interface CloudTelemetry {
  latency: string;
  tokens: number;
  phase: string;
  load: number;
  requests: number;
}

export function getProcessTelemetry(pid: number | null): ProcessTelemetry {
  if (!pid) {
    return { pid: null, cpu: '—', ram: '—', uptime: '—', activeFile: '—', threads: 0 };
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
    const threads = 0;

    let activeFile = '—';
    try {
      const lsofOutput = execSync(
        `lsof -p ${pid} -Fn 2>/dev/null | grep '\\.tsx\\|\\.ts\\|\\.jsx\\|\\.js\\|\\.py\\|\\.rs' | head -1 | cut -c2-`,
        { encoding: 'utf-8', timeout: 3000 },
      ).trim();
      if (lsofOutput) {
        const parts2 = lsofOutput.split('/');
        activeFile = parts2[parts2.length - 1] || lsofOutput;
      }
    } catch {
      // lsof may fail
    }

    return { pid, cpu, ram, uptime, activeFile, threads };
  } catch {
    return { pid, cpu: '—', ram: '—', uptime: '—', activeFile: '—', threads: 0 };
  }
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
