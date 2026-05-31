import type { AgentStatus } from '../types/agent';
import clsx from 'clsx';

const colorMap: Record<AgentStatus, string> = {
  unconfigured: 'bg-neutral-600',
  offline: 'bg-neutral-700',
  connecting: 'bg-[#c2b280] animate-pulse-soft',
  online: 'bg-[#84a59d]',
  working: 'bg-[#c2b280] animate-pulse-soft',
  waiting: 'bg-neutral-400',
  error: 'bg-[#b56576]',
  syncing: 'bg-[#84a59d] animate-pulse-soft',
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-1.5 h-1.5 rounded-full', colorMap[status])} />
      <span className="telemetry-label" style={{ fontSize: '9px' }}>{status}</span>
    </div>
  );
}
