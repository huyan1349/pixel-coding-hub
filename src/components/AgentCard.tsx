import type { Agent } from '../types/agent';
import { PixelAvatar } from './PixelAvatar';
import { StatusBadge } from './StatusBadge';
import { useAgentStore } from '../store/useAgentStore';
import clsx from 'clsx';

export function AgentCard({ agent }: { agent: Agent }) {
  const { selectedAgentId, selectAgent } = useAgentStore();
  const isSelected = selectedAgentId === agent.id;

  return (
    <div
      onClick={() => selectAgent(agent.id)}
      className={clsx(
        'glass-panel p-3 mb-2 cursor-pointer transition-all duration-300 ease-out',
        isSelected
          ? 'bg-white/[0.04] border-white/[0.12]'
          : 'hover:bg-white/[0.04] hover:border-white/[0.12]',
      )}
    >
      <div className="flex items-center gap-3">
        <PixelAvatar kind={agent.kind} />
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-sm font-medium text-neutral-200 truncate">{agent.name}</h3>
          <div className="flex items-center gap-2">
            <StatusBadge status={agent.status} />
            {agent.backend && (
              <span className="font-mono text-[9px] text-neutral-600">{agent.backend}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {agent.status === 'working' && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#84a59d] animate-pulse" />
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {agent.capabilities.map((cap) => (
          <span key={cap} className="text-[9px] font-mono bg-white/[0.02] border border-white/[0.06] px-1.5 py-0.5 rounded-sm text-pixel-muted">
            {cap}
          </span>
        ))}
      </div>
      {agent.workspaceDir && (
        <div className="mt-1.5 font-mono text-[9px] text-neutral-600 truncate">
          📂 {agent.workspaceDir}
        </div>
      )}
    </div>
  );
}
