import type { Agent } from '../types/agent';
import { PixelAvatar } from './PixelAvatar';
import { StatusBadge } from './StatusBadge';
import { useAgentStore } from '../store/useAgentStore';
import clsx from 'clsx';

export function AgentCard({ agent }: { agent: Agent }) {
  const { selectedAgentId, selectAgent, triggerConnectionMock } = useAgentStore();
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
          <StatusBadge status={agent.status} />
        </div>
        <div>
          {agent.status === 'unconfigured' || agent.status === 'offline' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerConnectionMock(agent.id);
              }}
              className="pixel-button text-[9px] font-pixel px-2 py-1"
            >
              CONN
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {agent.capabilities.map((cap) => (
          <span key={cap} className="text-[9px] font-mono bg-white/[0.02] border border-white/[0.06] px-1.5 py-0.5 rounded-sm text-pixel-muted">
            {cap}
          </span>
        ))}
      </div>
    </div>
  );
}
