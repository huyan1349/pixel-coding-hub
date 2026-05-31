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
import { usePreferences } from '../store/usePreferences';
import { t } from '../i18n';
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
  const { locale } = usePreferences();

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
    <div className="w-full h-full relative overflow-hidden rounded-2xl" style={{ backgroundColor: '#0c0c0e' }}>
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="glass-panel-inset px-2.5 py-1">
          <span className="telemetry-label" style={{ fontSize: '10px' }}>{t('stageMap', locale)}</span>
        </div>
        {sseConnected && (
          <div className="glass-panel-inset px-2.5 py-1 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#84a59d] animate-pulse-soft" />
            <span className="telemetry-label" style={{ fontSize: '10px', color: '#84a59d' }}>{t('live', locale)}</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 right-3 z-10">
        <div className="glass-panel p-2.5 flex items-center gap-2.5">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('inputPlaceholder', locale)}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-[12px] text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
            style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 300 }}
          />
          <button
            onClick={isStreaming ? disconnectSSE : handleDispatch}
            disabled={!isStreaming && !prompt.trim()}
            className={clsx(
              'pixel-button',
              isStreaming && 'border-[#b56576]/30 text-[#b56576]',
            )}
          >
            {isStreaming ? t('stop', locale) : t('dispatch', locale)}
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
        style={{ backgroundColor: '#0c0c0e' }}
        defaultEdgeOptions={{
          type: 'flowEdge',
          style: { stroke: '#262626', strokeWidth: 1 },
        }}
      >
        <Controls
          className="!bg-white/[0.03] !border-white/[0.06] !backdrop-blur-xl !rounded-xl"
          showInteractive={false}
        />
        <MiniMap
          className="!bg-white/[0.02] !border-white/[0.06] !backdrop-blur-xl !rounded-xl"
          nodeColor="#262626"
          maskColor="rgba(0,0,0,0.7)"
        />
      </ReactFlow>
    </div>
  );
}
