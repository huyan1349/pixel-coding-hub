import { useAgentStore } from '../store/useAgentStore';

export function LogsView() {
  const { agents, eventLog } = useAgentStore();

  const allLogs = agents.flatMap((a) =>
    a.logs.map((l) => ({ agent: a.name, message: l, kind: a.kind }))
  );
  const sortedLogs = [...allLogs].reverse();

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#789ca4]" />
        <span className="text-[14px] font-medium text-neutral-300" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>Event Logs</span>
        <span className="telemetry-value text-[10px] text-neutral-600">{sortedLogs.length} entries</span>
      </div>

      {eventLog.length > 0 && (
        <div className="glass-panel-inset p-4">
          <div className="telemetry-label mb-2">Dispatch Events</div>
          <div className="space-y-0.5 max-h-40 overflow-y-auto">
            {eventLog.map((e, i) => (
              <div key={i} className="telemetry-value text-[11px] text-neutral-500">{e}</div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {agents.map((agent) => (
          agent.logs.length > 0 && (
            <div key={agent.id} className="glass-panel-inset p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.status === 'working' ? '#c2b280' : agent.status === 'online' ? '#84a59d' : '#525252' }} />
                <span className="text-[12px] font-medium text-neutral-300" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>{agent.name}</span>
                <span className="telemetry-value text-[10px] text-neutral-600">{agent.logs.length} logs</span>
              </div>
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {agent.logs.slice().reverse().map((log, i) => (
                  <div key={i} className="telemetry-value text-[11px] text-neutral-500 leading-relaxed">{log}</div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {sortedLogs.length === 0 && eventLog.length === 0 && (
        <div className="glass-panel-inset p-8 text-center">
          <div className="telemetry-label">No logs yet</div>
          <div className="telemetry-value text-[10px] text-neutral-600 mt-1">Dispatch a task to see activity</div>
        </div>
      )}
    </div>
  );
}
