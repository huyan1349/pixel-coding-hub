import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNodeData, AgentStatus } from '../../types/agent';
import { useAgentStore } from '../../store/useAgentStore';
import { usePreferences } from '../../store/usePreferences';
import clsx from 'clsx';

const STATUS_COLORS: Record<string, string> = {
  unconfigured: '#525252', offline: '#525252', connecting: '#a3a3a3',
  online: '#84a59d', working: '#c2b280', waiting: '#737373',
  error: '#b56576', syncing: '#84a59d',
};

function MiniRing({ value, color = '#84a59d', size = 36, isLight }: { value: number; color?: string; size?: number; isLight: boolean }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / 100, 1);
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.03)'} strokeWidth={2.5} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={2.5} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dashoffset 0.6s ease-out' }} />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={500}>
        {Math.round(pct * 100)}
      </text>
    </svg>
  );
}

type AgentNodeType = NodeProps & { data: FlowNodeData };

export function AgentNode({ data }: AgentNodeType) {
  const { theme } = usePreferences();
  const isLight = theme === 'light';
  const agentId = (data.agentId as string) || '';
  const agent = useAgentStore((s) => s.agents.find((a) => a.id === agentId));
  const status: AgentStatus = agent?.status || 'offline';
  const color = STATUS_COLORS[status] || '#525252';
  const isWorking = status === 'working';

  const tele = agent?.telemetry as Record<string, unknown> | undefined;
  const cpuVal = tele ? parseFloat(String(tele.cpu || tele.totalCpu || '0')) : 0;
  const ramStr = tele ? String(tele.ram || tele.totalRam || '—') : '—';

  return (
    <div
      className="min-w-[220px] transition-all duration-400 ease-out hover:-translate-y-1"
      style={{
        background: isWorking
          ? (isLight ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.04)')
          : (isLight ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.025)'),
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${isWorking ? color + '25' : (isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.05)')}`,
        borderTopColor: `${isWorking ? color + '40' : (isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)')}`,
        borderRadius: '16px',
        boxShadow: isLight
          ? 'inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 16px rgba(0,0,0,0.06)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.3)',
        padding: '12px 16px',
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.4s ease',
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-full !border !border-white/10" />

      <div className="flex items-center gap-3">
        <div className="relative">
          <MiniRing value={cpuVal || 0} color={color} size={38} isLight={isLight} />
          {isWorking && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse-soft" style={{ backgroundColor: color }} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={clsx('text-[13px] font-medium truncate', isLight ? 'text-neutral-800' : 'text-neutral-200')} style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
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
