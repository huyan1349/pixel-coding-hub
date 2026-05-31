import { useAgentStore } from '../store/useAgentStore';
import type { Agent, AgentStatus, ClaudeCodeTelemetry, TraeTelemetry } from '../types/agent';
import clsx from 'clsx';

const STATUS_COLORS: Record<AgentStatus, string> = {
  unconfigured: '#525252', offline: '#525252', connecting: '#a3a3a3',
  online: '#84a59d', working: '#c2b280', waiting: '#737373',
  error: '#b56576', syncing: '#84a59d',
};

function RingChart({ value, max = 100, color = '#84a59d', size = 64, label }: { value: number; max?: number; color?: string; size?: number; label?: string }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.6s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="telemetry-value-highlight text-[14px]">{Math.round(pct * 100)}%</span>
        {label && <span className="telemetry-label" style={{ fontSize: '7px' }}>{label}</span>}
      </div>
    </div>
  );
}

function AgentDetailCard({ agent }: { agent: Agent }) {
  const color = STATUS_COLORS[agent.status];
  const isWorking = agent.status === 'working';
  const tele = agent.telemetry as Record<string, unknown> | undefined;

  const cpuVal = tele ? parseFloat(String(tele.cpu || tele.totalCpu || '0')) : 0;
  const ramStr = tele ? String(tele.ram || tele.totalRam || '—') : '—';
  const uptime = tele ? String(tele.uptime || '—') : '—';
  const pid = tele ? String(tele.pid ?? '—') : '—';

  const isClaude = agent.telemetryType === 'claude-code';
  const isTrae = agent.telemetryType === 'trae';
  const claudeTele = isClaude ? (agent.telemetry as ClaudeCodeTelemetry) : null;
  const traeTele = isTrae ? (agent.telemetry as TraeTelemetry) : null;

  return (
    <div
      className="aero-card p-5"
      style={{
        borderColor: isWorking ? color + '25' : undefined,
        borderTopColor: isWorking ? color + '40' : undefined,
      }}
    >
      <div className="flex items-start gap-4 mb-4">
        <RingChart value={cpuVal || 0} color={color} size={64} label="CPU" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-[15px] font-medium text-neutral-200" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>{agent.name}</span>
            <span className={clsx('aero-badge', isWorking ? `text-[${color}]` : 'text-neutral-500', isWorking ? `bg-[${color}]/15` : 'bg-neutral-800/50')} style={isWorking ? { color, backgroundColor: color + '18' } : {}}>
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: isWorking ? color : '#525252' }} />
              {agent.status.toUpperCase()}
            </span>
          </div>
          {agent.backend && <div className="telemetry-label mb-1">{agent.backend}</div>}
          {agent.model && <div className="telemetry-value text-[10px] text-neutral-500">{agent.model}</div>}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-3">
        <div className="glass-panel-inset p-2.5 text-center">
          <div className="telemetry-label mb-1">PID</div>
          <div className="telemetry-value">{pid}</div>
        </div>
        <div className="glass-panel-inset p-2.5 text-center">
          <div className="telemetry-label mb-1">CPU</div>
          <div className="telemetry-value-highlight">{cpuVal ? `${cpuVal.toFixed(1)}%` : '—'}</div>
        </div>
        <div className="glass-panel-inset p-2.5 text-center">
          <div className="telemetry-label mb-1">RAM</div>
          <div className="telemetry-value">{ramStr}</div>
        </div>
        <div className="glass-panel-inset p-2.5 text-center">
          <div className="telemetry-label mb-1">Uptime</div>
          <div className="telemetry-value">{uptime}</div>
        </div>
      </div>

      {isClaude && claudeTele && (
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="glass-panel-inset p-2.5 text-center">
            <div className="telemetry-label mb-1">Work Time</div>
            <div className="telemetry-value-highlight">{claudeTele.continuousWorkTime}</div>
          </div>
          <div className="glass-panel-inset p-2.5 text-center">
            <div className="telemetry-label mb-1">Sessions</div>
            <div className="telemetry-value">{claudeTele.sessionCount || '—'}</div>
          </div>
          <div className="glass-panel-inset p-2.5 text-center">
            <div className="telemetry-label mb-1">Cost</div>
            <div className="telemetry-value">{claudeTele.totalCost}</div>
          </div>
          <div className="glass-panel-inset p-2.5 text-center">
            <div className="telemetry-label mb-1">Last Act</div>
            <div className="telemetry-value">{claudeTele.lastActivity}</div>
          </div>
        </div>
      )}

      {isTrae && traeTele && (
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div className="glass-panel-inset p-2.5 text-center">
            <div className="telemetry-label mb-1">Procs</div>
            <div className="telemetry-value">{traeTele.processCount || '—'}</div>
          </div>
          <div className="glass-panel-inset p-2.5 text-center">
            <div className="telemetry-label mb-1">Project</div>
            <div className="telemetry-value-highlight">{traeTele.currentProject}</div>
          </div>
          <div className="glass-panel-inset p-2.5 text-center">
            <div className="telemetry-label mb-1">API Calls</div>
            <div className="telemetry-value">{traeTele.apiCallCount || '—'}</div>
          </div>
          <div className="glass-panel-inset p-2.5 text-center">
            <div className="telemetry-label mb-1">Last API</div>
            <div className="telemetry-value">{traeTele.lastApiCall}</div>
          </div>
        </div>
      )}

      {isClaude && claudeTele?.currentTask && claudeTele.currentTask !== '—' && (
        <div className="glass-panel-inset p-3 mb-3">
          <div className="telemetry-label mb-1">Current Task</div>
          <div className="telemetry-value-highlight text-[12px] break-all leading-relaxed">{claudeTele.currentTask}</div>
        </div>
      )}

      {isTrae && traeTele?.recentActivity && traeTele.recentActivity.length > 0 && (
        <div className="glass-panel-inset p-3 mb-3">
          <div className="telemetry-label mb-1">Recent Activity</div>
          <div className="space-y-0.5">
            {traeTele.recentActivity.slice(-3).map((act, i) => (
              <div key={i} className="telemetry-value text-[10px] text-neutral-500 truncate">{act}</div>
            ))}
          </div>
        </div>
      )}

      {agent.logs.length > 0 && (
        <div className="glass-panel-inset p-3">
          <div className="telemetry-label mb-1">Logs</div>
          <div className="space-y-0.5 max-h-20 overflow-y-auto">
            {agent.logs.slice(-5).map((log, i) => (
              <div key={i} className="telemetry-value text-[10px] text-neutral-600 truncate">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardView() {
  const { agents } = useAgentStore();
  const activeAgents = agents.filter(a => a.status !== 'offline' && a.status !== 'unconfigured');
  const workingAgents = agents.filter(a => a.status === 'working');

  return (
    <div className="w-full h-full overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#84a59d] animate-pulse-soft" />
          <span className="text-[14px] font-medium text-neutral-300" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="telemetry-value text-[10px] text-neutral-600">{activeAgents.length}/{agents.length} ACTIVE</span>
          {workingAgents.length > 0 && (
            <span className="aero-badge text-[#c2b280] bg-[#c2b280]/15">
              <span className="w-1 h-1 rounded-full bg-[#c2b280] animate-pulse-soft" />
              {workingAgents.length} WORKING
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {agents.map((agent) => (
          <AgentDetailCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
