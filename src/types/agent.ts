export type AgentStatus =
  | 'unconfigured'
  | 'offline'
  | 'connecting'
  | 'online'
  | 'working'
  | 'waiting'
  | 'error';

export type TaskStatus = 'todo' | 'running' | 'done' | 'error';

export interface Agent {
  id: string;
  name: string;
  kind: 'codex' | 'trae' | 'claude-code-cli' | 'custom';
  status: AgentStatus;
  capabilities: string[];
  avatarSeed: string;
}

export interface FlowNodeData {
  [key: string]: unknown;
  label: string;
  type: 'input' | 'task' | 'agent';
  status: TaskStatus;
  agentId?: string;
  description?: string;
}

export interface SSEEvent {
  nodeId: string;
  status: TaskStatus;
  timestamp: number;
  message: string;
}
