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
        'aero-card p-3 mb-2 cursor-pointer',
        isSelected ? 'bg-white/[0.05]' : '',
      )}
    >
      <div className="flex items-center gap-3">
        <PixelAvatar kind={agent.kind} />
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-medium text-neutral-200 truncate" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>{agent.name}</h3>
          <div className="flex items-center gap-2">
            <StatusBadge status={agent.status} />
            {agent.backend && (
              <span className="telemetry-value text-[9px] text-neutral-600">{agent.backend}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {agent.status === 'working' && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c2b280] animate-pulse-soft" />
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {agent.capabilities.map((cap) => (
          <span key={cap} className="telemetry-label bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded-md" style={{ fontSize: '9px' }}>
            {cap}
          </span>
        ))}
      </div>
      {agent.workspaceDir && (
        <div className="mt-1.5 telemetry-value text-[9px] text-neutral-600 truncate">
          📂 {agent.workspaceDir}
        </div>
      )}
    </div>
  );
}
