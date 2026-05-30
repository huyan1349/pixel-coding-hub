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
        'pixel-panel p-3 mb-2 cursor-pointer transition-all',
        isSelected ? 'border-pixel-accent bg-pixel-dark translate-x-1' : 'hover:border-pixel-info',
      )}
    >
      <div className="flex items-center gap-3">
        <PixelAvatar kind={agent.kind} />
        <div className="flex-1 min-w-0">
          <h3 className="font-mono text-sm font-bold text-pixel-text truncate">{agent.name}</h3>
          <StatusBadge status={agent.status} />
        </div>
        <div>
          {agent.status === 'unconfigured' || agent.status === 'offline' ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                triggerConnectionMock(agent.id);
              }}
              className="pixel-button text-[10px] font-pixel px-2 py-1"
            >
              CONN
            </button>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {agent.capabilities.map((cap) => (
          <span key={cap} className="text-[9px] font-mono bg-pixel-dark border border-pixel-muted px-1 text-pixel-muted">
            {cap}
          </span>
        ))}
      </div>
    </div>
  );
}
