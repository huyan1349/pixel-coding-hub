import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNodeData } from '../../types/agent';
import { PixelAvatar } from '../PixelAvatar';
import clsx from 'clsx';

const statusColor: Record<string, string> = {
  todo: 'bg-white/10',
  running: 'bg-pixel-working animate-pulse',
  done: 'bg-pixel-online',
  error: 'bg-pixel-error',
};

type AgentNodeType = NodeProps & { data: FlowNodeData };

export function AgentNode({ data }: AgentNodeType) {
  return (
    <div className="glass-panel px-4 py-3 min-w-[180px] transition-all duration-300 ease-out">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-1 !h-1 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-none !border-none"
      />
      <div className="flex items-center gap-3">
        <PixelAvatar kind={(data.agentId as 'codex' | 'trae' | 'claude-code-cli' | 'custom') ?? 'custom'} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={clsx('w-1 h-1 block', statusColor[data.status as string] ?? 'bg-white/10')} />
            <span className="font-pixel text-[9px] uppercase text-pixel-muted tracking-wider">
              AGENT
            </span>
          </div>
          <div className="font-mono text-xs text-neutral-200 mt-0.5 truncate">
            {data.label}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-1 !h-1 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-none !border-none"
      />
    </div>
  );
}
