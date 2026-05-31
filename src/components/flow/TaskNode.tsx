import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNodeData } from '../../types/agent';

const statusColor: Record<string, string> = {
  todo: '#525252',
  running: '#c2b280',
  done: '#84a59d',
  error: '#b56576',
};

type TaskNodeType = NodeProps & { data: FlowNodeData };

export function TaskNode({ data }: TaskNodeType) {
  const color = statusColor[data.status as string] ?? '#525252';
  return (
    <div
      className="min-w-[170px] transition-all duration-300 ease-out hover:-translate-y-0.5"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)',
        padding: '10px 14px',
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-full !border !border-white/10" />
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
        <span className="telemetry-label" style={{ fontSize: '9px' }}>TASK</span>
      </div>
      <div className="text-[12px] text-neutral-200 leading-relaxed" style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 400 }}>{data.label}</div>
      {data.description && <div className="telemetry-value text-[10px] text-neutral-500 mt-1">{data.description as string}</div>}
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-full !border !border-white/10" />
    </div>
  );
}
