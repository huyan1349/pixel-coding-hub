import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNodeData } from '../../types/agent';
import clsx from 'clsx';

const statusColor: Record<string, string> = {
  todo: 'bg-white/10',
  running: 'bg-pixel-waiting animate-pulse',
  done: 'bg-pixel-online',
  error: 'bg-pixel-error',
};

type TaskNodeType = NodeProps & { data: FlowNodeData };

export function TaskNode({ data }: TaskNodeType) {
  return (
    <div className="glass-panel px-4 py-3 min-w-[160px] transition-all duration-300 ease-out">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-1 !h-1 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-none !border-none"
      />
      <div className="flex items-center gap-2 mb-1">
        <span className={clsx('w-1 h-1 block', statusColor[data.status as string] ?? 'bg-white/10')} />
        <span className="font-pixel text-[9px] uppercase text-pixel-muted tracking-wider">
          TASK
        </span>
      </div>
      <div className="font-mono text-xs text-neutral-200 leading-relaxed">
        {data.label}
      </div>
      {data.description && (
        <div className="font-mono text-[10px] text-neutral-500 mt-1">
          {data.description as string}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-1 !h-1 !min-w-0 !min-h-0 !bg-neutral-600 !rounded-none !border-none"
      />
    </div>
  );
}
