import type { AgentStatus } from '../types/agent';
import clsx from 'clsx';

const colorMap: Record<AgentStatus, string> = {
  unconfigured: 'bg-neutral-600',
  offline: 'bg-neutral-500',
  connecting: 'bg-pixel-waiting animate-pulse',
  online: 'bg-pixel-online shadow-[0_0_8px_#57d68d]',
  working: 'bg-pixel-working animate-ping duration-1000',
  waiting: 'bg-pixel-waiting shadow-[0_0_6px_#ffd166]',
  error: 'bg-pixel-error shadow-[0_0_8px_#ef476f]',
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-3 h-3 block border border-black', colorMap[status])} />
      <span className="text-[10px] font-mono uppercase text-pixel-muted">{status}</span>
    </div>
  );
}
