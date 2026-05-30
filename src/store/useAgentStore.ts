import { create } from 'zustand';
import type { Agent, AgentStatus, SSEEvent, TaskStatus } from '../types/agent';
import type { Node, Edge } from '@xyflow/react';

const initialNodes: Node[] = [
  {
    id: 'input-1',
    type: 'inputNode',
    position: { x: 300, y: 40 },
    data: { label: '需求接收', type: 'input', status: 'todo', description: '接收用户需求描述' },
  },
  {
    id: 'task-1',
    type: 'taskNode',
    position: { x: 300, y: 160 },
    data: { label: '逻辑拆解', type: 'task', status: 'todo', description: '分析需求，拆解子任务' },
  },
  {
    id: 'agent-codex',
    type: 'agentNode',
    position: { x: 280, y: 280 },
    data: { label: 'Codex', type: 'agent', status: 'todo', agentId: 'codex' },
  },
  {
    id: 'task-2',
    type: 'taskNode',
    position: { x: 300, y: 400 },
    data: { label: '代码生成', type: 'task', status: 'todo', description: '根据拆解结果生成代码' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-input-task1', source: 'input-1', target: 'task-1', type: 'flowEdge' },
  { id: 'e-task1-codex', source: 'task-1', target: 'agent-codex', type: 'flowEdge' },
  { id: 'e-codex-task2', source: 'agent-codex', target: 'task-2', type: 'flowEdge' },
];

const sseEventQueue: SSEEvent[] = [
  { nodeId: 'input-1', status: 'running', timestamp: 1000, message: '[SSE] 需求接收中...' },
  { nodeId: 'input-1', status: 'done', timestamp: 2500, message: '[SSE] 需求已接收' },
  { nodeId: 'task-1', status: 'running', timestamp: 3000, message: '[SSE] 逻辑拆解启动...' },
  { nodeId: 'task-1', status: 'done', timestamp: 5000, message: '[SSE] 拆解完成：3个子任务' },
  { nodeId: 'agent-codex', status: 'running', timestamp: 5500, message: '[SSE] Codex 开始处理...' },
  { nodeId: 'agent-codex', status: 'done', timestamp: 8000, message: '[SSE] Codex 处理完成' },
  { nodeId: 'task-2', status: 'running', timestamp: 8500, message: '[SSE] 代码生成中...' },
  { nodeId: 'task-2', status: 'done', timestamp: 11000, message: '[SSE] 代码生成完成 ✓' },
];

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  nodes: Node[];
  edges: Edge[];
  eventLog: string[];
  isStreaming: boolean;
  selectAgent: (id: string) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  triggerConnectionMock: (id: string) => void;
  updateNodeStatus: (nodeId: string, status: TaskStatus) => void;
  simulateEventStream: () => void;
  resetFlow: () => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [
    { id: 'codex', name: 'Codex', kind: 'codex', status: 'online', capabilities: ['read_files', 'write_code'], avatarSeed: '101010' },
    { id: 'trae', name: 'Trae Solo', kind: 'trae', status: 'unconfigured', capabilities: ['ui_layout', 'components'], avatarSeed: '010101' },
    { id: 'claude', name: 'Claude Code', kind: 'claude-code-cli', status: 'working', capabilities: ['review', 'refactor', 'test'], avatarSeed: '111000' },
  ],
  selectedAgentId: null,
  nodes: initialNodes,
  edges: initialEdges,
  eventLog: [],
  isStreaming: false,

  selectAgent: (id) => set({ selectedAgentId: id }),

  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a)),
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

  simulateEventStream: () => {
    const { isStreaming } = get();
    if (isStreaming) return;

    set({ isStreaming: true, eventLog: [] });

    get().resetFlow();

    sseEventQueue.forEach((event, index) => {
      setTimeout(() => {
        get().updateNodeStatus(event.nodeId, event.status);

        if (event.nodeId.startsWith('agent-')) {
          const agentId = event.nodeId.replace('agent-', '');
          const agentStatus: AgentStatus = event.status === 'running' ? 'working' : event.status === 'done' ? 'online' : 'offline';
          get().updateAgentStatus(agentId, agentStatus);
        }

        set((state) => ({
          eventLog: [...state.eventLog, event.message],
        }));

        if (index === sseEventQueue.length - 1) {
          set({ isStreaming: false });
        }
      }, event.timestamp);
    });
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
}));
