import { motion } from 'framer-motion';
import { useAgentStore } from '../store/useAgentStore';
import type { Agent, AgentStatus, ClaudeCodeTelemetry, TraeTelemetry } from '../types/agent';
import clsx from 'clsx';

const STATUS_COLORS: Record<AgentStatus, string> = {
  unconfigured: '#525252', offline: '#525252', connecting: '#a3a3a3',
  online: '#84a59d', working: '#c2b280', waiting: '#737373',
  error: '#b56576', syncing: '#84a59d',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

function RingChart({ value, max = 100, color = '#84a59d', size = 72, label, sublabel }: { value: number; max?: number; color?: string; size?: number; label?: string; sublabel?: string }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth={3} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={3}
          strokeDasharray={circ} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
        <defs>
          <filter id={`glow-${color.replace('#', '')}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="telemetry-value-highlight text-[16px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {Math.round(pct * 100)}%
        </motion.span>
        {label && <span className="telemetry-label" style={{ fontSize: '7px' }}>{label}</span>}
        {sublabel && <span className="telemetry-value text-[8px] text-neutral-600">{sublabel}</span>}
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight, color }: { label: string; value: string | number; highlight?: boolean; color?: string }) {
  return (
    <div className="glass-panel-inset p-3 text-center relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="telemetry-label mb-1.5">{label}</div>
      <div className={clsx('telemetry-value text-[13px]', highlight && 'telemetry-value-highlight')} style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}

function AgentDetailCard({ agent, index }: { agent: Agent; index: number }) {
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
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }}
      className={clsx('aero-card gradient-border p-5', isWorking && 'animate-breathe')}
      style={{
        borderColor: isWorking ? color + '20' : undefined,
        borderTopColor: isWorking ? color + '35' : undefined,
      }}
    >
      <div className="flex items-start gap-5 mb-4">
        <RingChart
          value={cpuVal || 0}
          color={color}
          size={72}
          label="CPU"
          sublabel={agent.status.toUpperCase()}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-[16px] font-semibold text-neutral-200 tracking-wide" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {agent.name}
            </span>
            <motion.span
              className="aero-badge"
              style={{ color, backgroundColor: color + '18' }}
              animate={isWorking ? { opacity: [1, 0.6, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: isWorking ? color : '#525252' }} />
              {agent.status.toUpperCase()}
            </motion.span>
          </div>
          {agent.backend && <div className="telemetry-label mb-1">{agent.backend}</div>}
          {agent.model && <div className="telemetry-value text-[11px] text-neutral-500">{agent.model}</div>}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 mb-3">
        <StatBox label="PID" value={pid} />
        <StatBox label="CPU" value={cpuVal ? `${cpuVal.toFixed(1)}%` : '—'} highlight color={cpuVal > 50 ? '#c2b280' : undefined} />
        <StatBox label="RAM" value={ramStr} />
        <StatBox label="Uptime" value={uptime} />
      </div>

      {isClaude && claudeTele && (
        <div className="grid grid-cols-4 gap-2.5 mb-3">
          <StatBox label="Work Time" value={claudeTele.continuousWorkTime} highlight />
          <StatBox label="Sessions" value={claudeTele.sessionCount || '—'} />
          <StatBox label="Cost" value={claudeTele.totalCost} />
          <StatBox label="Last Act" value={claudeTele.lastActivity} />
        </div>
      )}

      {isTrae && traeTele && (
        <div className="grid grid-cols-4 gap-2.5 mb-3">
          <StatBox label="Procs" value={traeTele.processCount || '—'} />
          <StatBox label="Project" value={traeTele.currentProject} highlight />
          <StatBox label="API Calls" value={traeTele.apiCallCount || '—'} />
          <StatBox label="Last API" value={traeTele.lastApiCall} />
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
    </motion.div>
  );
}

export function DashboardView() {
  const { agents } = useAgentStore();
  const activeAgents = agents.filter(a => a.status !== 'offline' && a.status !== 'unconfigured');
  const workingAgents = agents.filter(a => a.status === 'working');

  return (
    <motion.div
      className="w-full h-full overflow-y-auto p-2 space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center gap-2.5">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-[#84a59d]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-[15px] font-semibold text-neutral-300 tracking-wide" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
            Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="telemetry-value text-[10px] text-neutral-600">{activeAgents.length}/{agents.length} ACTIVE</span>
          {workingAgents.length > 0 && (
            <motion.span
              className="aero-badge text-[#c2b280] bg-[#c2b280]/15"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="w-1 h-1 rounded-full bg-[#c2b280]" />
              {workingAgents.length} WORKING
            </motion.span>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {agents.map((agent, i) => (
          <AgentDetailCard key={agent.id} agent={agent} index={i} />
        ))}
      </div>
    </motion.div>
  );
}
