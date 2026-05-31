import { useAgentStore } from '../store/useAgentStore';
import { MonitorCard } from './MonitorCard';

const MONITOR_AGENTS = ['claude', 'codex', 'trae', 'cursor'];

export function MonitorDashboard() {
  const { agents } = useAgentStore();

  const monitorAgents = MONITOR_AGENTS.map((id) =>
    agents.find((a) => a.id === id),
  ).filter(Boolean);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 bg-[#84a59d]" />
          <span className="font-pixel text-[9px] text-pixel-muted tracking-widest">
            MONITOR MATRIX
          </span>
        </div>
        <span className="font-mono text-[9px] text-neutral-700">
          {monitorAgents.filter((a) => a && a.status !== 'offline' && a.status !== 'unconfigured').length}/{monitorAgents.length} ACTIVE
        </span>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-4 gap-px bg-white/[0.04] overflow-hidden">
        {monitorAgents.map((agent) =>
          agent ? <MonitorCard key={agent.id} agent={agent} /> : null,
        )}
      </div>
    </div>
  );
}
