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
  kind: 'codex' | 'trae' | 'claude-code-cli' | 'coordinator' | 'custom';
  status: AgentStatus;
  capabilities: string[];
  avatarSeed: string;
  apiKey: string;
  backend?: string;
  model?: string;
  pid?: number | null;
  workspaceDir?: string | null;
  aiActive?: boolean;
}

export interface KeyStatus {
  key: string;
  available: boolean;
  masked: string;
  source: string;
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
  message: string;
  timestamp: number;
}
