import { useCallback, useState } from 'react';
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
  const {
    nodes: storeNodes, edges: storeEdges,
    dispatchTask, disconnectSSE, isStreaming, sseConnected,
  } = useAgentStore();

  const [nodes, , onNodesChange] = useNodesState(storeNodes);
  const [edges, , onEdgesChange] = useEdgesState(storeEdges);
  const [prompt, setPrompt] = useState('');

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 100);
  }, []);

  const handleDispatch = () => {
    if (!prompt.trim()) return;
    dispatchTask(prompt.trim());
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDispatch();
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-pixel-bg">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="glass-panel px-2 py-1 font-pixel text-[9px] text-pixel-muted">
          STAGE MAP
        </div>
        {sseConnected && (
          <span className="glass-panel px-2 py-1 font-pixel text-[9px] text-pixel-online">
            LIVE
          </span>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-10">
        <div className="glass-panel p-2 flex items-center gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入任务描述，Coordinator 将分析并分配给各 Agent..."
            disabled={isStreaming}
            className="flex-1 bg-transparent font-mono text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
          />
          <button
            onClick={isStreaming ? disconnectSSE : handleDispatch}
            disabled={!isStreaming && !prompt.trim()}
            className={clsx(
              'pixel-button font-pixel text-[9px] px-3 py-1',
              isStreaming && 'border-[#b56576]/30',
            )}
          >
            {isStreaming ? 'STOP' : 'DISPATCH'}
          </button>
        </div>
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
