import clsx from 'clsx';
import type { Agent, AgentStatus } from '../types/agent';

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

export function MonitorCard({ agent }: { agent: Agent }) {
  const isActive = agent.status === 'working' || agent.status === 'syncing';
  const lastLogs = agent.logs.slice(-3);

  return (
    <div
      className={clsx(
        'flex flex-col bg-white/[0.02] backdrop-blur-md border transition-all duration-300 ease-out overflow-hidden',
        isActive ? ACTIVE_BORDER[agent.status] : 'border-white/[0.08]',
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className={clsx('w-1 h-1', STATUS_DOT[agent.status])} />
          <span className="font-mono text-[11px] text-neutral-300 tracking-wide">
            {agent.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {agent.backend && (
            <span className="font-mono text-[9px] text-neutral-600">{agent.backend}</span>
          )}
          <span className="font-mono text-[9px] text-neutral-600">
            {STATUS_LABEL[agent.status]}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-black/40 p-2 overflow-hidden">
        {lastLogs.length === 0 ? (
          <div className="font-mono text-[10px] text-neutral-700 leading-relaxed">
            [awaiting output...]
          </div>
        ) : (
          <div className="space-y-0.5">
            {lastLogs.map((log, i) => (
              <div key={i} className="font-mono text-[10px] text-neutral-500 leading-relaxed truncate">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 px-3 py-1.5 border-t border-white/[0.04]">
        {agent.pid && (
          <span className="font-mono text-[9px] text-neutral-700">PID:{agent.pid}</span>
        )}
        {agent.workspaceDir && (
          <span className="font-mono text-[9px] text-neutral-700 truncate">
            {agent.workspaceDir.split('/').pop()}
          </span>
        )}
        {agent.aiActive && (
          <div className="w-1 h-1 bg-[#84a59d] animate-pulse" />
        )}
      </div>
    </div>
  );
}
