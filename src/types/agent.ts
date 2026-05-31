export type AgentStatus =
  | 'unconfigured'
  | 'offline'
  | 'connecting'
  | 'online'
  | 'working'
  | 'waiting'
  | 'error'
  | 'syncing';

export type TaskStatus = 'todo' | 'running' | 'done' | 'error';

export interface ProcessTelemetry {
  pid: number | null;
  cpu: string;
  ram: string;
  uptime: string;
  activeFile: string;
  threads: number;
}

export interface CloudTelemetry {
  latency: string;
  tokens: number;
  phase: string;
  load: number;
  requests: number;
}

export interface Agent {
  id: string;
  name: string;
  kind: 'codex' | 'trae' | 'claude-code-cli' | 'coordinator' | 'cursor' | 'custom';
  status: AgentStatus;
  capabilities: string[];
  avatarSeed: string;
  apiKey: string;
  backend?: string;
  model?: string;
  pid?: number | null;
  workspaceDir?: string | null;
  aiActive?: boolean;
  logs: string[];
  telemetry?: ProcessTelemetry | CloudTelemetry;
  telemetryType?: 'process' | 'cloud';
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
