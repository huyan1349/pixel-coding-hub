import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNodeData, AgentStatus } from '../../types/agent';
import { useAgentStore } from '../../store/useAgentStore';

const STATUS_COLORS: Record<string, string> = {
  unconfigured: '#525252',
  offline: '#525252',
  connecting: '#a3a3a3',
  online: '#84a59d',
  working: '#c2b280',
  waiting: '#737373',
  error: '#b56576',
  syncing: '#84a59d',
};

function MiniRing({ value, max = 100, color = '#84a59d', size = 32 }: { value: number; max?: number; color?: string; size?: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={2.5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.5s ease-out' }} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={500}>
        {Math.round(pct * 100)}
      </text>
    </svg>
  );
}

type AgentNodeType = NodeProps & { data: FlowNodeData };

export function AgentNode({ data }: AgentNodeType) {
  const agentId = (data.agentId as string) || '';
  const agent = useAgentStore((s) => s.agents.find((a) => a.id === agentId));
  const status: AgentStatus = agent?.status || 'offline';
  const color = STATUS_COLORS[status] || '#525252';
  const isWorking = status === 'working';

  const cpuVal = agent?.telemetry
    ? parseFloat(String((agent.telemetry as unknown as Record<string, unknown>).cpu || (agent.telemetry as unknown as Record<string, unknown>).totalCpu || '0'))
    : 0;
  const ramStr = agent?.telemetry
    ? String((agent.telemetry as unknown as Record<string, unknown>).ram || (agent.telemetry as unknown as Record<string, unknown>).totalRam || '—')
    : '—';

  return (
    <div
      className="min-w-[220px] transition-all duration-300 ease-out hover:-translate-y-0.5"
      style={{
        background: isWorking ? `rgba(255, 255, 255, 0.04)` : 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${isWorking ? color + '30' : 'rgba(255, 255, 255, 0.06)'}`,
        borderTopColor: `${isWorking ? color + '50' : 'rgba(255, 255, 255, 0.1)'}`,
        borderRadius: '16px',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)${isWorking ? `, 0 0 20px ${color}10` : ''}`,
        padding: '12px 16px',
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-full !border !border-white/10" />

      <div className="flex items-center gap-3">
        <div className="relative">
          <MiniRing value={cpuVal || 0} color={color} size={36} />
          {isWorking && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse-soft" style={{ backgroundColor: color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium text-neutral-200 truncate" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
            {data.label}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="telemetry-label" style={{ fontSize: '9px', color }}>{status.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="telemetry-label" style={{ fontSize: '8px' }}>CPU</div>
          <div className="telemetry-value text-[10px]" style={{ color }}>{cpuVal ? `${cpuVal.toFixed(0)}%` : '—'}</div>
        </div>
        <div className="text-center">
          <div className="telemetry-label" style={{ fontSize: '8px' }}>RAM</div>
          <div className="telemetry-value text-[10px]">{ramStr}</div>
        </div>
        <div className="text-center">
          <div className="telemetry-label" style={{ fontSize: '8px' }}>PID</div>
          <div className="telemetry-value text-[10px]">{agent?.pid ?? '—'}</div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-full !border !border-white/10" />
    </div>
  );
}
