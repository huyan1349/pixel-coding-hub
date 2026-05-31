import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNodeData } from '../../types/agent';
import { PixelAvatar } from '../PixelAvatar';
import clsx from 'clsx';

const statusColor: Record<string, string> = {
  todo: 'bg-neutral-600',
  running: 'bg-[#c2b280] animate-pulse-soft',
  done: 'bg-[#84a59d]',
  error: 'bg-[#b56576]',
};

type AgentNodeType = NodeProps & { data: FlowNodeData };

export function AgentNode({ data }: AgentNodeType) {
  return (
    <div
      className="min-w-[190px] transition-all duration-300 ease-out hover:-translate-y-0.5"
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
      <Handle
        type="target"
        position={Position.Top}
        className="!w-1.5 !h-1.5 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-full !border !border-white/10"
      />
      <div className="flex items-center gap-3">
        <PixelAvatar kind={(data.agentId as 'codex' | 'trae' | 'claude-code-cli' | 'custom') ?? 'custom'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={clsx('w-1.5 h-1.5 rounded-full', statusColor[data.status as string] ?? 'bg-neutral-600')} />
            <span className="telemetry-label" style={{ fontSize: '9px' }}>AGENT</span>
          </div>
          <div className="text-[12px] text-neutral-200 mt-0.5 truncate" style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 400 }}>
            {data.label}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-1.5 !h-1.5 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-full !border !border-white/10"
      />
    </div>
  );
}
