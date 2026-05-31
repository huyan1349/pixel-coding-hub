import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import type { Agent, AgentStatus, ProcessTelemetry, CloudTelemetry, ClaudeCodeTelemetry, TraeTelemetry } from '../types/agent';

const STATUS_DOT: Record<AgentStatus, string> = {
  unconfigured: 'bg-neutral-700',
  offline: 'bg-neutral-700',
  connecting: 'bg-neutral-500 animate-pulse',
  online: 'bg-[#84a59d]',
  working: 'bg-[#c2b280] animate-pulse',
  waiting: 'bg-neutral-500',
  error: 'bg-[#b56576]',
  syncing: 'bg-[#84a59d] animate-pulse',
};

const STATUS_BADGE: Record<AgentStatus, string> = {
  unconfigured: 'text-neutral-600',
  offline: 'text-neutral-600',
  connecting: 'text-neutral-500',
  online: 'text-[#84a59d]',
  working: 'text-[#c2b280]',
  waiting: 'text-neutral-500',
  error: 'text-[#b56576]',
  syncing: 'text-[#84a59d]',
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  unconfigured: 'NO KEY',
  offline: 'OFFLINE',
  connecting: 'CONNECTING',
  online: 'IDLE',
  working: 'WORKING',
  waiting: 'WAITING',
  error: 'ERROR',
  syncing: 'SYNCING',
};

const ACTIVE_BORDER: Record<AgentStatus, string> = {
  working: 'border-[#c2b280]/30',
  syncing: 'border-[#84a59d]/30',
  error: 'border-[#b56576]/30',
  online: '',
  offline: '',
  unconfigured: '',
  connecting: '',
  waiting: '',
};

function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const ratio = Math.min(value / max, 1);
  const filled = Math.round(ratio * 8);
  const bar = '█'.repeat(filled) + '░'.repeat(8 - filled);
  const highlight = ratio > 0.7;

  return (
    <span className={clsx('font-mono text-[10px]', highlight ? 'text-[#c2b280]' : 'text-neutral-500')}>
      {bar}
    </span>
  );
}

function TelemetryRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-[10px] text-neutral-600">{label}</span>
      <span className={clsx('font-mono text-[10px]', highlight ? 'text-[#c2b280]' : 'text-neutral-300')}>
        {value}
      </span>
    </div>
  );
}

function SessionStatusBadge({ status }: { status: 'busy' | 'idle' | 'none' }) {
  const config = {
    busy: { label: 'BUSY', color: 'text-[#c2b280] bg-[#c2b280]/10' },
    idle: { label: 'IDLE', color: 'text-[#84a59d] bg-[#84a59d]/10' },
    none: { label: 'NONE', color: 'text-neutral-600 bg-neutral-800' },
  };
  const c = config[status];
  return (
    <span className={clsx('font-mono text-[8px] px-1 py-px rounded-sm', c.color)}>
      {c.label}
    </span>
  );
}

function ClaudeCodeTelemetryGrid({ tele }: { tele: ClaudeCodeTelemetry }) {
  return (
    <div className="space-y-1 px-3 py-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-mono text-[9px] text-neutral-500">SESSION</span>
        <SessionStatusBadge status={tele.sessionStatus} />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <TelemetryRow label="PID" value={tele.pid ?? '—'} />
        <TelemetryRow label="CPU" value={tele.cpu} highlight={tele.cpu !== '—' && parseFloat(tele.cpu) > 50} />
        <TelemetryRow label="RAM" value={tele.ram} />
        <TelemetryRow label="Uptime" value={tele.uptime} />
        <TelemetryRow label="Work Time" value={tele.continuousWorkTime} highlight={tele.continuousWorkTime !== '—'} />
        <TelemetryRow label="Version" value={tele.version} />
        <TelemetryRow label="Model" value={tele.model} highlight />
        <TelemetryRow label="Cost" value={tele.totalCost} highlight={tele.totalCost !== '$0.00'} />
        <TelemetryRow label="Sessions" value={tele.sessionCount || '—'} />
        <TelemetryRow label="SubProcs" value={tele.subProcessCount || '—'} />
        <TelemetryRow label="Dir" value={tele.workingDir ? tele.workingDir.split('/').pop() || '—' : '—'} />
        <TelemetryRow label="Last Act" value={tele.lastActivity} />
      </div>

      {tele.currentTask && tele.currentTask !== '—' && (
        <div className="mt-1 pt-1 border-t border-white/[0.04]">
          <div className="flex items-start gap-1">
            <span className="font-mono text-[9px] text-neutral-600 shrink-0">TASK</span>
            <span className="font-mono text-[10px] text-[#c2b280] break-all leading-tight">
              {tele.currentTask}
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <span className="font-mono text-[10px] text-neutral-600">Load</span>
        <ProgressBar value={tele.cpu !== '—' ? parseFloat(tele.cpu) : 0} />
      </div>
    </div>
  );
}

function TraeTelemetryGrid({ tele }: { tele: TraeTelemetry }) {
  return (
    <div className="space-y-1 px-3 py-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="font-mono text-[9px] text-neutral-500">AI AGENT</span>
        <span className={clsx(
          'font-mono text-[8px] px-1 py-px rounded-sm',
          tele.aiAgentActive ? 'text-[#c2b280] bg-[#c2b280]/10' : 'text-neutral-600 bg-neutral-800'
        )}>
          {tele.aiAgentActive ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
        <TelemetryRow label="PID" value={tele.pid ?? '—'} />
        <TelemetryRow label="CPU" value={tele.totalCpu} highlight={tele.totalCpu !== '—' && parseFloat(tele.totalCpu) > 50} />
        <TelemetryRow label="RAM" value={tele.totalRam} />
        <TelemetryRow label="Uptime" value={tele.uptime} />
        <TelemetryRow label="Procs" value={tele.processCount || '—'} highlight={tele.processCount > 1} />
        <TelemetryRow label="Project" value={tele.currentProject} highlight={tele.currentProject !== '—'} />
        <TelemetryRow label="API Calls" value={tele.apiCallCount || '—'} />
        <TelemetryRow label="Last API" value={tele.lastApiCall} />
        <TelemetryRow label="Sandbox" value={tele.sandboxSessions || '—'} />
      </div>

      {tele.subProcesses.length > 0 && (
        <div className="pt-1 border-t border-white/[0.04]">
          {tele.subProcesses.slice(0, 4).map((sp) => (
            <div key={sp.pid} className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-neutral-700">{sp.role}</span>
              <span className="font-mono text-[9px] text-neutral-600">{sp.cpu} / {sp.ram}</span>
            </div>
          ))}
        </div>
      )}

      {tele.recentActivity.length > 0 && (
        <div className="pt-1 border-t border-white/[0.04]">
          <span className="font-mono text-[9px] text-neutral-600">ACTIVITY</span>
          <div className="mt-0.5 space-y-px">
            {tele.recentActivity.slice(-4).map((act, i) => (
              <div key={i} className="font-mono text-[9px] text-neutral-500 truncate">
                {act}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-0.5">
        <span className="font-mono text-[10px] text-neutral-600">Load</span>
        <ProgressBar value={tele.totalCpu !== '—' ? parseFloat(tele.totalCpu) : 0} />
      </div>
    </div>
  );
}

function ProcessTelemetryGrid({ tele }: { tele: ProcessTelemetry }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-3 py-1.5">
      <TelemetryRow label="PID" value={tele.pid ?? '—'} />
      <TelemetryRow label="CPU" value={tele.totalCpu} highlight={tele.totalCpu !== '—' && parseFloat(tele.totalCpu) > 50} />
      <TelemetryRow label="RAM" value={tele.totalRam} />
      <TelemetryRow label="Uptime" value={tele.uptime} />
      <TelemetryRow label="Procs" value={tele.processCount || '—'} highlight={tele.processCount > 1} />
      <TelemetryRow label="File" value={tele.activeFile} />
      {tele.subProcesses.length > 0 && (
        <div className="col-span-2 mt-0.5 pt-0.5 border-t border-white/[0.04]">
          {tele.subProcesses.slice(0, 3).map((sp) => (
            <div key={sp.pid} className="flex items-center justify-between">
              <span className="font-mono text-[9px] text-neutral-700">{sp.role}</span>
              <span className="font-mono text-[9px] text-neutral-600">{sp.cpu} / {sp.ram}</span>
            </div>
          ))}
        </div>
      )}
      <div className="col-span-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">Load</span>
        <ProgressBar value={tele.totalCpu !== '—' ? parseFloat(tele.totalCpu) : 0} />
      </div>
    </div>
  );
}

function CloudTelemetryGrid({ tele }: { tele: CloudTelemetry }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-3 py-1.5">
      <TelemetryRow label="Latency" value={tele.latency} highlight={tele.latency !== '—' && parseInt(tele.latency) > 2000} />
      <TelemetryRow label="Tokens" value={tele.tokens || '—'} highlight={tele.tokens > 0} />
      <TelemetryRow label="Phase" value={tele.phase} />
      <TelemetryRow label="Reqs" value={tele.requests || '—'} />
      <div className="col-span-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">Load</span>
        <ProgressBar value={tele.load} />
      </div>
    </div>
  );
}

function TypewriterLog({ logs }: { logs: string[] }) {
  const [displayText, setDisplayText] = useState('');
  const [currentLogIndex, setCurrentLogIndex] = useState(-1);
  const [charIndex, setCharIndex] = useState(0);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (logs.length === 0) {
      setDisplayText('');
      setCurrentLogIndex(-1);
      setCharIndex(0);
      return;
    }

    const latestIndex = logs.length - 1;
    if (latestIndex !== currentLogIndex) {
      setCurrentLogIndex(latestIndex);
      setCharIndex(0);
      setDisplayText('');
    }
  }, [logs.length]);

  useEffect(() => {
    if (currentLogIndex < 0 || currentLogIndex >= logs.length) return;

    const target = logs[currentLogIndex];
    if (charIndex < target.length) {
      animRef.current = setTimeout(() => {
        setDisplayText(target.slice(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, 12);
    }

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [currentLogIndex, charIndex, logs]);

  const prevLog = logs.length >= 2 ? logs[logs.length - 2] : null;

  return (
    <div className="px-3 py-1.5 space-y-0.5">
      {prevLog && (
        <div className="font-mono text-[10px] text-neutral-700 truncate">{prevLog}</div>
      )}
      <div className="font-mono text-[10px] text-neutral-500 truncate">
        {displayText || '[awaiting...]'}
        {charIndex < (logs[currentLogIndex]?.length || 0) && (
          <span className="animate-pulse">▎</span>
        )}
      </div>
    </div>
  );
}

export function MonitorCard({ agent }: { agent: Agent }) {
  const isActive = agent.status === 'working' || agent.status === 'syncing';

  return (
    <div
      className={clsx(
        'flex flex-col bg-white/[0.02] backdrop-blur-md border transition-all duration-300 ease-out overflow-hidden',
        isActive ? ACTIVE_BORDER[agent.status] : 'border-white/[0.10]',
      )}
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-neutral-300 tracking-wide">
            {agent.name}
          </span>
          <span className={clsx('font-mono text-[9px] tracking-wider', STATUS_BADGE[agent.status])}>
            [{STATUS_LABEL[agent.status]}]
          </span>
        </div>
        <div className={clsx('w-1 h-1', STATUS_DOT[agent.status])} />
      </div>

      <div className="border-b border-white/[0.04]">
        {agent.telemetryType === 'claude-code' && agent.telemetry ? (
          <ClaudeCodeTelemetryGrid tele={agent.telemetry as ClaudeCodeTelemetry} />
        ) : agent.telemetryType === 'trae' && agent.telemetry ? (
          <TraeTelemetryGrid tele={agent.telemetry as TraeTelemetry} />
        ) : agent.telemetryType === 'cloud' && agent.telemetry ? (
          <CloudTelemetryGrid tele={agent.telemetry as CloudTelemetry} />
        ) : agent.telemetry ? (
          <ProcessTelemetryGrid tele={agent.telemetry as ProcessTelemetry} />
        ) : (
          <div className="px-3 py-1.5 font-mono text-[10px] text-neutral-700">[no telemetry]</div>
        )}
      </div>

      <div className="bg-black/40">
        <TypewriterLog logs={agent.logs} />
      </div>
    </div>
  );
}
