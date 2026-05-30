import type { AgentStatus } from '../types/agent';
import clsx from 'clsx';

const colorMap: Record<AgentStatus, string> = {
  unconfigured: 'bg-white/10',
  offline: 'bg-white/5',
  connecting: 'bg-pixel-waiting animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  online: 'bg-pixel-online shadow-[0_0_12px_rgba(16,185,129,0.4)]',
  working: 'bg-pixel-working animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  waiting: 'bg-pixel-waiting shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  error: 'bg-pixel-error shadow-[0_0_12px_rgba(239,68,68,0.4)]',
};

export function StatusBadge({ status }: { status: AgentStatus }) {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('w-2 h-2 block rounded-sm', colorMap[status])} />
      <span className="text-[10px] font-mono uppercase text-pixel-muted">{status}</span>
    </div>
  );
}
