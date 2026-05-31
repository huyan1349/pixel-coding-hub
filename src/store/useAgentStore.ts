import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, AgentStatus, SSEEvent, TaskStatus, KeyStatus, ProcessTelemetry, CloudTelemetry, ClaudeCodeTelemetry, TraeTelemetry } from '../types/agent';
import type { Node, Edge } from '@xyflow/react';

const BRIDGE_URL = import.meta.env.DEV ? '' : 'http://localhost:4001';

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
    data: { label: '协调分析', type: 'task', status: 'todo', description: 'Coordinator 分析任务，分配子任务' },
  },
  {
    id: 'agent-codex',
    type: 'agentNode',
    position: { x: 100, y: 290 },
    data: { label: 'Codex', type: 'agent', status: 'todo', agentId: 'codex' },
  },
  {
    id: 'agent-trae',
    type: 'agentNode',
    position: { x: 320, y: 290 },
    data: { label: 'Trae Solo', type: 'agent', status: 'todo', agentId: 'trae' },
  },
  {
    id: 'agent-claude',
    type: 'agentNode',
    position: { x: 540, y: 290 },
    data: { label: 'Claude Code', type: 'agent', status: 'todo', agentId: 'claude' },
  },
  {
    id: 'task-merge',
    type: 'taskNode',
    position: { x: 320, y: 430 },
    data: { label: '结果汇总', type: 'task', status: 'todo', description: '汇总各 Agent 输出' },
  },
  {
    id: 'task-done',
    type: 'taskNode',
    position: { x: 320, y: 560 },
    data: { label: '协调完成', type: 'task', status: 'todo', description: 'Coordinator 综合分析完成' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-input-arch', source: 'input-1', target: 'task-arch', type: 'flowEdge' },
  { id: 'e-arch-codex', source: 'task-arch', target: 'agent-codex', type: 'flowEdge' },
  { id: 'e-arch-trae', source: 'task-arch', target: 'agent-trae', type: 'flowEdge' },
  { id: 'e-arch-claude', source: 'task-arch', target: 'agent-claude', type: 'flowEdge' },
  { id: 'e-codex-merge', source: 'agent-codex', target: 'task-merge', type: 'flowEdge' },
  { id: 'e-trae-merge', source: 'agent-trae', target: 'task-merge', type: 'flowEdge' },
  { id: 'e-claude-merge', source: 'agent-claude', target: 'task-merge', type: 'flowEdge' },
  { id: 'e-merge-done', source: 'task-merge', target: 'task-done', type: 'flowEdge' },
];

const defaultAgents: Agent[] = [
  { id: 'coordinator', name: 'Coordinator', kind: 'coordinator', status: 'offline', capabilities: ['analyze', 'dispatch', 'synthesize'], avatarSeed: 'coord01', apiKey: '', backend: 'DeepSeek API', logs: [] },
  { id: 'codex', name: 'Codex', kind: 'codex', status: 'offline', capabilities: ['code_gen', 'api_call'], avatarSeed: '101010', apiKey: '', backend: 'DeepSeek API', logs: [] },
  { id: 'trae', name: 'Trae Solo CN', kind: 'trae', status: 'offline', capabilities: ['monitor', 'file_watch', 'ai_read'], avatarSeed: '010101', apiKey: '', logs: [] },
  { id: 'claude', name: 'Claude Code', kind: 'claude-code-cli', status: 'offline', capabilities: ['review', 'refactor', 'analyze'], avatarSeed: '111000', apiKey: '', backend: 'DeepSeek API', logs: [] },
  { id: 'cursor', name: 'Cursor', kind: 'cursor', status: 'offline', capabilities: ['ide', 'ai_edit', 'codebase'], avatarSeed: 'cur010', apiKey: '', backend: 'Reserved', logs: [] },
];

const MAX_LOGS = 50;

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  nodes: Node[];
  edges: Edge[];
  eventLog: string[];
  isStreaming: boolean;
  sseConnected: boolean;
  keysStatus: Record<string, KeyStatus>;
  claudeInstalled: boolean;
  envInfo: { anthropicBaseUrl: string; anthropicModel: string; subagentModel: string };
  selectAgent: (id: string) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  updateAgentField: (id: string, field: string, value: unknown) => void;
  appendAgentLog: (id: string, message: string) => void;
  updateNodeStatus: (nodeId: string, status: TaskStatus) => void;
  fetchKeysStatus: () => Promise<void>;
  fetchAgentStatus: () => Promise<void>;
  dispatchTask: (prompt: string, agents?: string[]) => Promise<void>;
  disconnectSSE: () => void;
  resetFlow: () => void;
  addEventLog: (message: string) => void;
}

let abortControllerRef: AbortController | null = null;

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
      keysStatus: {},
      claudeInstalled: false,
      envInfo: { anthropicBaseUrl: '', anthropicModel: '', subagentModel: '' },

      selectAgent: (id) => set({ selectedAgentId: id }),

      updateAgentStatus: (id, status) =>
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, status } : a)),
        })),

      updateAgentField: (id, field, value) =>
        set((state) => ({
          agents: state.agents.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
        })),

      appendAgentLog: (id, message) =>
        set((state) => ({
          agents: state.agents.map((a) => {
            if (a.id !== id) return a;
            const logs = [...a.logs, message].slice(-MAX_LOGS);
            return { ...a, logs };
          }),
        })),

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

      fetchKeysStatus: async () => {
        try {
          const res = await fetch(`${BRIDGE_URL}/api/keys`);
          if (!res.ok) return;
          const data = await res.json();
          set({
            keysStatus: data.keys,
            claudeInstalled: data.claudeInstalled,
            envInfo: data.envInfo,
          });

          const { keysStatus } = get();
          const updatedAgents = get().agents.map((a) => {
            const keyInfo = keysStatus[a.id];
            if (keyInfo) {
              return {
                ...a,
                status: keyInfo.available ? 'online' as AgentStatus : 'unconfigured' as AgentStatus,
                apiKey: keyInfo.masked,
              };
            }
            return a;
          });
          set({ agents: updatedAgents });
        } catch {
          // server not available
        }
      },

      fetchAgentStatus: async () => {
        try {
          const res = await fetch(`${BRIDGE_URL}/api/agents/status`);
          if (!res.ok) return;
          const data = await res.json();

          set((state) => ({
            agents: state.agents.map((a) => {
              const info = data[a.id];
              if (!info) return a;
              return {
                ...a,
                status: info.status as AgentStatus,
                backend: info.backend || a.backend,
                model: info.model || a.model,
                pid: info.pid ?? a.pid,
                workspaceDir: info.workspaceDir ?? a.workspaceDir,
                aiActive: info.aiActive ?? a.aiActive,
                telemetry: info.telemetry as ProcessTelemetry | CloudTelemetry | ClaudeCodeTelemetry | TraeTelemetry | undefined,
                telemetryType: info.telemetryType as 'process' | 'cloud' | 'claude-code' | 'trae' | undefined,
              };
            }),
          }));
        } catch {
          // server not available
        }
      },

      dispatchTask: async (prompt, agents) => {
        const { isStreaming, sseConnected } = get();
        if (isStreaming || sseConnected) return;

        set({ isStreaming: true, eventLog: [], sseConnected: false });
        get().resetFlow();

        try {
          const abortController = new AbortController();
          abortControllerRef = abortController;

          const streamRes = await fetch(`${BRIDGE_URL}/api/dispatch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, agents }),
            signal: abortController.signal,
          });

          if (!streamRes.ok || !streamRes.body) {
            get().addEventLog('[DISPATCH] Connection failed');
            set({ isStreaming: false });
            return;
          }

          set({ sseConnected: true });
          get().addEventLog('[DISPATCH] Connected to bridge server');

          const reader = streamRes.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;
              const payload = trimmed.slice(6);

              try {
                const event: SSEEvent = JSON.parse(payload);

                if (event.nodeId === '__system__') {
                  get().addEventLog(event.message);
                  if (event.status === 'done' || event.status === 'error') {
                    set({ isStreaming: false, sseConnected: false });
                  }
                  continue;
                }

                get().updateNodeStatus(event.nodeId, event.status as TaskStatus);

                if (event.nodeId.startsWith('agent-')) {
                  const agentId = event.nodeId.replace('agent-', '');
                  const agentStatus: AgentStatus =
                    event.status === 'running' ? 'working' :
                    event.status === 'done' ? 'syncing' :
                    event.status === 'error' ? 'error' : 'offline';
                  get().updateAgentStatus(agentId, agentStatus);
                  get().appendAgentLog(agentId, event.message);

                  if (event.status === 'done') {
                    setTimeout(() => {
                      get().updateAgentStatus(agentId, 'online');
                    }, 1500);
                  }
                }

                get().addEventLog(event.message);
              } catch {
                // skip malformed
              }
            }
          }

          set({ isStreaming: false, sseConnected: false });
          get().addEventLog('[DISPATCH] Stream ended');
        } catch (err) {
          if ((err as Error).name !== 'AbortError') {
            get().addEventLog('[DISPATCH] Connection error');
          }
          set({ isStreaming: false, sseConnected: false });
        } finally {
          abortControllerRef = null;
        }
      },

      disconnectSSE: () => {
        if (abortControllerRef) {
          abortControllerRef.abort();
          abortControllerRef = null;
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
      partialize: () => ({}),
    },
  ),
);
