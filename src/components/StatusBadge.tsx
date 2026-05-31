import type { AgentStatus } from '../types/agent';
import clsx from 'clsx';

const colorMap: Record<AgentStatus, string> = {
  unconfigured: 'bg-white/10',
  offline: 'bg-white/5',
  connecting: 'bg-pixel-waiting animate-pulse',
  online: 'bg-pixel-online',
  working: 'bg-pixel-working animate-pulse',
  waiting: 'bg-pixel-waiting',
  error: 'bg-pixel-error',
  syncing: 'bg-pixel-online animate-pulse',
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-1.5 h-1.5 block rounded-full', colorMap[status])} />
      <span className="text-[9px] font-pixel uppercase text-pixel-muted">{status}</span>
    </div>
  );
}
