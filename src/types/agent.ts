export type AgentStatus =
  | 'unconfigured'
  | 'offline'
  | 'connecting'
  | 'online'
  | 'working'
  | 'waiting'
  | 'error';

export interface Agent {
  id: string;
  name: string;
  kind: 'codex' | 'trae' | 'claude-code-cli' | 'custom';
  status: AgentStatus;
  capabilities: string[];
  avatarSeed: string;
}
