import { useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import clsx from 'clsx';
import { useAgentStore } from '../store/useAgentStore';
import { TaskNode } from './flow/TaskNode';
import { AgentNode } from './flow/AgentNode';
import { InputNode } from './flow/InputNode';
import { FlowEdge } from './flow/FlowEdge';

const nodeTypes = {
  taskNode: TaskNode,
  agentNode: AgentNode,
  inputNode: InputNode,
};

const edgeTypes = {
  flowEdge: FlowEdge,
};

export function MainStage() {
  const { nodes: storeNodes, edges: storeEdges, connectSSE, disconnectSSE, isStreaming, sseConnected } = useAgentStore();

  const [nodes, , onNodesChange] = useNodesState(storeNodes);
  const [edges, , onEdgesChange] = useEdgesState(storeEdges);

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 100);
  }, []);

  const handleToggle = () => {
    if (isStreaming || sseConnected) {
      disconnectSSE();
    } else {
      connectSSE();
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-pixel-bg">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="glass-panel px-2 py-1 font-pixel text-[9px] text-pixel-muted">
          STAGE MAP
        </div>
        <button
          onClick={handleToggle}
          className={clsx(
            'pixel-button font-pixel text-[9px] px-3 py-1',
            isStreaming && 'border-pixel-online/30',
          )}
        >
          {isStreaming ? 'DISCONNECT' : 'CONNECT SSE'}
        </button>
        {sseConnected && (
          <span className="glass-panel px-2 py-1 font-pixel text-[9px] text-pixel-online">
            LIVE
          </span>
        )}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ backgroundColor: '#0a0a0a' }}
        defaultEdgeOptions={{
          type: 'flowEdge',
          style: { stroke: '#262626', strokeWidth: 1 },
        }}
      >
        <Controls
          className="!bg-white/[0.02] !border-white/[0.08] !backdrop-blur-md !rounded"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-white/[0.02] !border-white/[0.08] !backdrop-blur-md !rounded"
          nodeColor="#262626"
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
