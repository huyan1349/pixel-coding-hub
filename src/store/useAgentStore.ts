import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, AgentStatus, SSEEvent, TaskStatus } from '../types/agent';
import type { Node, Edge } from '@xyflow/react';

const initialNodes: Node[] = [
  {
    id: 'input-1',
    type: 'inputNode',
    position: { x: 320, y: 30 },
    data: { label: '需求接收', type: 'input', status: 'todo', description: '接收用户需求描述' },
  },
  {
    id: 'task-arch',
    type: 'taskNode',
    position: { x: 320, y: 150 },
    data: { label: '架构拆解', type: 'task', status: 'todo', description: '分析需求，拆解子任务' },
  },
  {
    id: 'agent-codex',
    type: 'agentNode',
    position: { x: 140, y: 290 },
    data: { label: 'Codex', type: 'agent', status: 'todo', agentId: 'codex' },
  },
  {
    id: 'agent-trae',
    type: 'agentNode',
    position: { x: 500, y: 290 },
    data: { label: 'Trae Solo', type: 'agent', status: 'todo', agentId: 'trae' },
  },
  {
    id: 'task-merge',
    type: 'taskNode',
    position: { x: 320, y: 430 },
    data: { label: '代码合并', type: 'task', status: 'todo', description: '合并 Codex + Trae 产出' },
  },
  {
    id: 'agent-claude',
    type: 'agentNode',
    position: { x: 320, y: 560 },
    data: { label: 'Claude Code', type: 'agent', status: 'todo', agentId: 'claude' },
  },
  {
    id: 'task-done',
    type: 'taskNode',
    position: { x: 320, y: 690 },
    data: { label: '交付完成', type: 'task', status: 'todo', description: '最终交付物就绪' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-input-arch', source: 'input-1', target: 'task-arch', type: 'flowEdge' },
  { id: 'e-arch-codex', source: 'task-arch', target: 'agent-codex', type: 'flowEdge' },
  { id: 'e-arch-trae', source: 'task-arch', target: 'agent-trae', type: 'flowEdge' },
  { id: 'e-codex-merge', source: 'agent-codex', target: 'task-merge', type: 'flowEdge' },
  { id: 'e-trae-merge', source: 'agent-trae', target: 'task-merge', type: 'flowEdge' },
  { id: 'e-merge-claude', source: 'task-merge', target: 'agent-claude', type: 'flowEdge' },
  { id: 'e-claude-done', source: 'agent-claude', target: 'task-done', type: 'flowEdge' },
];

const defaultAgents: Agent[] = [
  { id: 'codex', name: 'Codex', kind: 'codex', status: 'online', capabilities: ['read_files', 'write_code'], avatarSeed: '101010', apiKey: '' },
  { id: 'trae', name: 'Trae Solo', kind: 'trae', status: 'unconfigured', capabilities: ['ui_layout', 'components'], avatarSeed: '010101', apiKey: '' },
  { id: 'claude', name: 'Claude Code', kind: 'claude-code-cli', status: 'working', capabilities: ['review', 'refactor', 'test'], avatarSeed: '111000', apiKey: '' },
];

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  nodes: Node[];
  edges: Edge[];
  eventLog: string[];
  isStreaming: boolean;
  sseConnected: boolean;
  selectAgent: (id: string) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  updateAgentApiKey: (id: string, apiKey: string) => void;
  triggerConnectionMock: (id: string) => void;
  updateNodeStatus: (nodeId: string, status: TaskStatus) => void;
  connectSSE: () => void;
  disconnectSSE: () => void;
  resetFlow: () => void;
  addEventLog: (message: string) => void;
}

let eventSourceRef: EventSource | null = null;

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agents: defaultAgents,
      selectedAgentId: null,
      nodes: initialNodes,
      edges: initialEdges,
      eventLog: [],
      isStreaming: false,
      sseConnected: false,

      selectAgent: (id) => set({ selectedAgentId: id }),

      updateAgentStatus: (id, status) =>
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      updateAgentApiKey: (id, apiKey) =>
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, apiKey } : a)),
        })),

      triggerConnectionMock: (id) => {
        get().updateAgentStatus(id, 'connecting');
        setTimeout(() => {
          get().updateAgentStatus(id, 'online');
        }, 1500);
      },

      updateNodeStatus: (nodeId, status) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, status } } : n,
          ),
          edges: state.edges.map((e) => {
            const sourceNode = state.nodes.find((n) => n.id === e.source);
            if (sourceNode && sourceNode.id === nodeId) {
              const isActive = status === 'running';
              return {
                ...e,
                animated: isActive,
                style: isActive
                  ? { stroke: '#84a59d', strokeWidth: 1.5 }
                  : { stroke: '#262626', strokeWidth: 1 },
              };
            }
            return e;
          }),
        })),

      connectSSE: () => {
        const { isStreaming, sseConnected } = get();
        if (isStreaming || sseConnected) return;

        set({ isStreaming: true, eventLog: [], sseConnected: false });
        get().resetFlow();

        try {
          const es = new EventSource('http://localhost:4001/api/stream');
          eventSourceRef = es;

          es.onopen = () => {
            set({ sseConnected: true });
            get().addEventLog('[SSE] Connected to bridge server');
          };

          es.onmessage = (e) => {
            try {
              const event: SSEEvent = JSON.parse(e.data);
              get().updateNodeStatus(event.nodeId, event.status);

              if (event.nodeId.startsWith('agent-')) {
                const agentId = event.nodeId.replace('agent-', '');
                const agentStatus: AgentStatus =
                  event.status === 'running' ? 'working' :
                  event.status === 'done' ? 'online' :
                  event.status === 'error' ? 'error' : 'offline';
                get().updateAgentStatus(agentId, agentStatus);
              }

              get().addEventLog(event.message);
            } catch {
              get().addEventLog('[SSE] Parse error');
            }
          };

          es.onerror = () => {
            set({ isStreaming: false, sseConnected: false });
            get().addEventLog('[SSE] Connection closed');
            es.close();
            eventSourceRef = null;
          };
        } catch {
          set({ isStreaming: false, sseConnected: false });
          get().addEventLog('[SSE] Failed to connect');
        }
      },

      disconnectSSE: () => {
        if (eventSourceRef) {
          eventSourceRef.close();
          eventSourceRef = null;
        }
        set({ isStreaming: false, sseConnected: false });
      },

      resetFlow: () =>
        set({
          nodes: initialNodes.map((n) => ({
            ...n,
            data: { ...n.data, status: 'todo' as TaskStatus },
          })),
          edges: initialEdges.map((e) => ({
            ...e,
            animated: false,
            style: { stroke: '#262626', strokeWidth: 1 },
          })),
        }),

      addEventLog: (message) =>
        set((state) => ({
          eventLog: [...state.eventLog, message],
        })),
    }),
    {
      name: 'pixel-coding-hub-storage',
      partialize: (state) => ({
        agents: state.agents.map((a) => ({ id: a.id, apiKey: a.apiKey })),
      }),
      merge: (persisted, current) => {
        const p = persisted as { agents?: { id: string; apiKey: string }[] } | null;
        if (!p?.agents) return current;
        const keyMap = new Map(p.agents.map((a) => [a.id, a.apiKey]));
        return {
          ...current,
          agents: current.agents.map((a) => {
            const savedKey = keyMap.get(a.id);
            return savedKey !== undefined ? { ...a, apiKey: savedKey } : a;
          }),
        };
      },
    },
  ),
);
