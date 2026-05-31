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
  totalCpu: string;
  totalRam: string;
  processCount: number;
  subProcesses: Array<{ pid: number; role: string; cpu: string; ram: string }>;
}

export interface CloudTelemetry {
  latency: string;
  tokens: number;
  phase: string;
  load: number;
  requests: number;
}

export interface ClaudeCodeTelemetry extends ProcessTelemetry {
  activeSession: boolean;
  sessionStatus: 'busy' | 'idle' | 'none';
  workingDir: string | null;
  model: string;
  totalCost: string;
  sessionCount: number;
  continuousWorkTime: string;
  currentTask: string;
  lastActivity: string;
  subProcessCount: number;
  version: string;
  sessionId: string | null;
  recentOutput: string[];
}

export interface TraeTelemetry extends ProcessTelemetry {
  aiAgentActive: boolean;
  currentProject: string;
  recentActivity: string[];
  apiCallCount: number;
  lastApiCall: string;
  sandboxSessions: number;
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
  telemetry?: ProcessTelemetry | CloudTelemetry | ClaudeCodeTelemetry | TraeTelemetry;
  telemetryType?: 'process' | 'cloud' | 'claude-code' | 'trae';
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
