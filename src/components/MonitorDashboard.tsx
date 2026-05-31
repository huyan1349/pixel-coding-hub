import { useAgentStore } from '../store/useAgentStore';
import { MonitorCard } from './MonitorCard';

const MONITOR_AGENTS = ['claude', 'codex', 'trae', 'cursor'];

export function MonitorDashboard() {
  const { agents } = useAgentStore();

  const monitorAgents = MONITOR_AGENTS.map((id) =>
    agents.find((a) => a.id === id),
  ).filter(Boolean);

  const activeCount = monitorAgents.filter(
    (a) => a && a.status !== 'offline' && a.status !== 'unconfigured',
  ).length;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#84a59d] animate-pulse-soft" />
          <span className="telemetry-label" style={{ fontSize: '12px', color: '#737373' }}>
            TELEMETRY
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-['JetBrains_Mono'] text-[10px] text-neutral-600">
            {activeCount}/{monitorAgents.length} ACTIVE
          </span>
          <div className="w-1 h-1 rounded-full bg-[#c2b280] animate-pulse-soft" />
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 grid-rows-4 gap-2 overflow-hidden px-1 pb-1">
        {monitorAgents.map((agent) =>
          agent ? <MonitorCard key={agent.id} agent={agent} /> : null,
        )}
      </div>
    </div>
  );
}
