import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import type { Agent, AgentStatus, ProcessTelemetry, CloudTelemetry } from '../types/agent';

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

function ProcessTelemetryGrid({ tele }: { tele: ProcessTelemetry }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-3 py-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">PID</span>
        <span className="font-mono text-[10px] text-neutral-300">{tele.pid ?? '—'}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">CPU</span>
        <span className={clsx('font-mono text-[10px]', tele.cpu !== '—' && parseFloat(tele.cpu) > 50 ? 'text-[#b56576]' : 'text-neutral-300')}>
          {tele.cpu}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">RAM</span>
        <span className="font-mono text-[10px] text-neutral-300">{tele.ram}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">Threads</span>
        <span className="font-mono text-[10px] text-neutral-300">{tele.threads || '—'}</span>
      </div>
      <div className="col-span-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">File</span>
        <span className="font-mono text-[10px] text-neutral-300 truncate max-w-[120px]">{tele.activeFile}</span>
      </div>
      <div className="col-span-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">Load</span>
        <ProgressBar value={tele.cpu !== '—' ? parseFloat(tele.cpu) : 0} />
      </div>
    </div>
  );
}

function CloudTelemetryGrid({ tele }: { tele: CloudTelemetry }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 px-3 py-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">Latency</span>
        <span className={clsx('font-mono text-[10px]', tele.latency !== '—' && parseInt(tele.latency) > 2000 ? 'text-[#b56576]' : 'text-neutral-300')}>
          {tele.latency}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">Tokens</span>
        <span className={clsx('font-mono text-[10px]', tele.tokens > 0 ? 'text-[#c2b280]' : 'text-neutral-300')}>
          {tele.tokens || '—'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">Phase</span>
        <span className="font-mono text-[10px] text-neutral-300">{tele.phase}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-neutral-600">Reqs</span>
        <span className="font-mono text-[10px] text-neutral-300">{tele.requests || '—'}</span>
      </div>
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
        {agent.telemetryType === 'cloud' && agent.telemetry ? (
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
