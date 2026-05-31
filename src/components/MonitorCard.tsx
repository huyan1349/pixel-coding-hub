import clsx from 'clsx';
import { useState, useEffect, useRef } from 'react';
import type { Agent, AgentStatus, ProcessTelemetry, CloudTelemetry, ClaudeCodeTelemetry, TraeTelemetry } from '../types/agent';

const STATUS_CONFIG: Record<AgentStatus, { dot: string; badge: string; label: string; badgeBg: string }> = {
  unconfigured: { dot: 'bg-neutral-600', badge: 'text-neutral-500', label: 'NO KEY', badgeBg: 'bg-neutral-800/50' },
  offline: { dot: 'bg-neutral-600', badge: 'text-neutral-500', label: 'OFFLINE', badgeBg: 'bg-neutral-800/50' },
  connecting: { dot: 'bg-neutral-400 animate-pulse-soft', badge: 'text-neutral-400', label: 'CONNECTING', badgeBg: 'bg-neutral-700/50' },
  online: { dot: 'bg-[#84a59d]', badge: 'text-[#84a59d]', label: 'ONLINE', badgeBg: 'bg-[#84a59d]/10' },
  working: { dot: 'bg-[#c2b280] animate-pulse-soft', badge: 'text-[#c2b280]', label: 'WORKING', badgeBg: 'bg-[#c2b280]/15' },
  waiting: { dot: 'bg-neutral-400', badge: 'text-neutral-400', label: 'WAITING', badgeBg: 'bg-neutral-700/50' },
  error: { dot: 'bg-[#b56576]', badge: 'text-[#b56576]', label: 'ERROR', badgeBg: 'bg-[#b56576]/15' },
  syncing: { dot: 'bg-[#84a59d] animate-pulse-soft', badge: 'text-[#84a59d]', label: 'SYNCING', badgeBg: 'bg-[#84a59d]/10' },
};

function ModernProgressBar({ value, max = 100, color = '#84a59d' }: { value: number; max?: number; color?: string }) {
  const ratio = Math.min(value / max, 1);
  return (
    <div className="w-full h-1 rounded-full bg-white/[0.04] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${ratio * 100}%`,
          background: `linear-gradient(90deg, ${color}40, ${color}80)`,
          boxShadow: ratio > 0.7 ? `0 0 6px ${color}30` : 'none',
        }}
      />
    </div>
  );
}

function TelemetryRow({ label, value, highlight, mono = true }: { label: string; value: string | number; highlight?: boolean; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="telemetry-label">{label}</span>
      <span className={clsx(highlight ? 'telemetry-value-highlight' : mono ? 'telemetry-value' : 'telemetry-value')}>
        {value}
      </span>
    </div>
  );
}

function SessionStatusBadge({ status }: { status: 'busy' | 'idle' | 'none' }) {
  const config = {
    busy: { label: 'BUSY', color: 'text-[#c2b280]', bg: 'bg-[#c2b280]/15' },
    idle: { label: 'IDLE', color: 'text-[#84a59d]', bg: 'bg-[#84a59d]/10' },
    none: { label: 'NONE', color: 'text-neutral-500', bg: 'bg-neutral-800/50' },
  };
  const c = config[status];
  return (
    <span className={clsx('aero-badge', c.color, c.bg)}>
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: status === 'busy' ? '#c2b280' : status === 'idle' ? '#84a59d' : '#525252' }} />
      {c.label}
    </span>
  );
}

function ClaudeCodeTelemetryGrid({ tele }: { tele: ClaudeCodeTelemetry }) {
  return (
    <div className="space-y-2 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="telemetry-label">Session</span>
        <SessionStatusBadge status={tele.sessionStatus} />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
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
        <>
          <hr className="aero-divider-dashed" />
          <div className="flex items-start gap-2">
            <span className="telemetry-label shrink-0 mt-0.5">Task</span>
            <span className="telemetry-value-highlight break-all leading-relaxed">
              {tele.currentTask}
            </span>
          </div>
        </>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="telemetry-label">Load</span>
          <span className="telemetry-value">{tele.cpu !== '—' ? parseFloat(tele.cpu).toFixed(0) : 0}%</span>
        </div>
        <ModernProgressBar value={tele.cpu !== '—' ? parseFloat(tele.cpu) : 0} color="#c2b280" />
      </div>
    </div>
  );
}

function TraeTelemetryGrid({ tele }: { tele: TraeTelemetry }) {
  return (
    <div className="space-y-2 px-4 py-3">
      <div className="flex items-center justify-between">
        <span className="telemetry-label">AI Agent</span>
        <span className={clsx(
          'aero-badge',
          tele.aiAgentActive ? 'text-[#c2b280] bg-[#c2b280]/15' : 'text-neutral-500 bg-neutral-800/50'
        )}>
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: tele.aiAgentActive ? '#c2b280' : '#525252' }} />
          {tele.aiAgentActive ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
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
        <>
          <hr className="aero-divider" />
          <div className="space-y-0.5">
            {tele.subProcesses.slice(0, 4).map((sp) => (
              <div key={sp.pid} className="flex items-center justify-between">
                <span className="telemetry-label">{sp.role}</span>
                <span className="font-['JetBrains_Mono'] text-[10px] text-neutral-600">{sp.cpu} / {sp.ram}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {tele.recentActivity.length > 0 && (
        <>
          <hr className="aero-divider-dashed" />
          <div className="space-y-0.5">
            <span className="telemetry-label">Activity</span>
            <div className="mt-1 space-y-px">
              {tele.recentActivity.slice(-4).map((act, i) => (
                <div key={i} className="font-['JetBrains_Mono'] text-[10px] text-neutral-600 truncate leading-relaxed">
                  {act}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="telemetry-label">Load</span>
          <span className="telemetry-value">{tele.totalCpu !== '—' ? parseFloat(tele.totalCpu).toFixed(0) : 0}%</span>
        </div>
        <ModernProgressBar value={tele.totalCpu !== '—' ? parseFloat(tele.totalCpu) : 0} color="#84a59d" />
      </div>
    </div>
  );
}

function ProcessTelemetryGrid({ tele }: { tele: ProcessTelemetry }) {
  return (
    <div className="space-y-2 px-4 py-3">
      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
        <TelemetryRow label="PID" value={tele.pid ?? '—'} />
        <TelemetryRow label="CPU" value={tele.totalCpu} highlight={tele.totalCpu !== '—' && parseFloat(tele.totalCpu) > 50} />
        <TelemetryRow label="RAM" value={tele.totalRam} />
        <TelemetryRow label="Uptime" value={tele.uptime} />
        <TelemetryRow label="Procs" value={tele.processCount || '—'} highlight={tele.processCount > 1} />
        <TelemetryRow label="File" value={tele.activeFile} />
      </div>
      {tele.subProcesses.length > 0 && (
        <>
          <hr className="aero-divider" />
          {tele.subProcesses.slice(0, 3).map((sp) => (
            <div key={sp.pid} className="flex items-center justify-between">
              <span className="telemetry-label">{sp.role}</span>
              <span className="font-['JetBrains_Mono'] text-[10px] text-neutral-600">{sp.cpu} / {sp.ram}</span>
            </div>
          ))}
        </>
      )}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="telemetry-label">Load</span>
          <span className="telemetry-value">{tele.totalCpu !== '—' ? parseFloat(tele.totalCpu).toFixed(0) : 0}%</span>
        </div>
        <ModernProgressBar value={tele.totalCpu !== '—' ? parseFloat(tele.totalCpu) : 0} />
      </div>
    </div>
  );
}

function CloudTelemetryGrid({ tele }: { tele: CloudTelemetry }) {
  return (
    <div className="space-y-2 px-4 py-3">
      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
        <TelemetryRow label="Latency" value={tele.latency} highlight={tele.latency !== '—' && parseInt(tele.latency) > 2000} />
        <TelemetryRow label="Tokens" value={tele.tokens || '—'} highlight={tele.tokens > 0} />
        <TelemetryRow label="Phase" value={tele.phase} />
        <TelemetryRow label="Reqs" value={tele.requests || '—'} />
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="telemetry-label">Load</span>
          <span className="telemetry-value">{tele.load}%</span>
        </div>
        <ModernProgressBar value={tele.load} color="#789ca4" />
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
      }, 10);
    }

    return () => {
      if (animRef.current) clearTimeout(animRef.current);
    };
  }, [currentLogIndex, charIndex, logs]);

  const prevLog = logs.length >= 2 ? logs[logs.length - 2] : null;

  return (
    <div className="px-4 py-2 space-y-0.5">
      {prevLog && (
        <div className="font-['JetBrains_Mono'] text-[10px] text-neutral-700 truncate leading-relaxed">{prevLog}</div>
      )}
      <div className="font-['JetBrains_Mono'] text-[11px] text-neutral-500 truncate leading-relaxed">
        {displayText || '[awaiting...]'}
        {charIndex < (logs[currentLogIndex]?.length || 0) && (
          <span className="animate-pulse-soft text-[#84a59d]">▎</span>
        )}
      </div>
    </div>
  );
}

export function MonitorCard({ agent }: { agent: Agent }) {
  const isActive = agent.status === 'working' || agent.status === 'syncing';
  const statusCfg = STATUS_CONFIG[agent.status];

  return (
    <div
      className={clsx(
        'flex flex-col rounded-2xl transition-all duration-300 ease-out overflow-hidden',
        isActive ? 'animate-glow-subtle' : '',
      )}
      style={{
        background: 'rgba(255, 255, 255, 0.025)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: `1px solid ${isActive ? (agent.status === 'working' ? 'rgba(194,178,128,0.15)' : 'rgba(132,165,157,0.15)') : 'rgba(255,255,255,0.05)'}`,
        borderTopColor: isActive ? (agent.status === 'working' ? 'rgba(194,178,128,0.25)' : 'rgba(132,165,157,0.25)') : 'rgba(255,255,255,0.08)',
        boxShadow: `inset 0 1px 0 ${isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}, 0 4px 16px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-2.5">
          <span className="text-[13px] font-medium text-neutral-200 tracking-wide" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
            {agent.name}
          </span>
          <span className={clsx('aero-badge', statusCfg.badge, statusCfg.badgeBg)}>
            {statusCfg.label}
          </span>
        </div>
        <div className={clsx('w-1.5 h-1.5 rounded-full', statusCfg.dot)} />
      </div>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        {agent.telemetryType === 'claude-code' && agent.telemetry ? (
          <ClaudeCodeTelemetryGrid tele={agent.telemetry as ClaudeCodeTelemetry} />
        ) : agent.telemetryType === 'trae' && agent.telemetry ? (
          <TraeTelemetryGrid tele={agent.telemetry as TraeTelemetry} />
        ) : agent.telemetryType === 'cloud' && agent.telemetry ? (
          <CloudTelemetryGrid tele={agent.telemetry as CloudTelemetry} />
        ) : agent.telemetry ? (
          <ProcessTelemetryGrid tele={agent.telemetry as ProcessTelemetry} />
        ) : (
          <div className="px-4 py-3 telemetry-label">[no telemetry]</div>
        )}
      </div>

      <div style={{ background: 'rgba(0,0,0,0.2)' }}>
        <TypewriterLog logs={agent.logs} />
      </div>
    </div>
  );
}
