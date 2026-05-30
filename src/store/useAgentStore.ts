import { create } from 'zustand';
import type { Agent, AgentStatus } from '../types/agent';

interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  selectAgent: (id: string) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  triggerConnectionMock: (id: string) => void;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [
    { id: 'codex', name: 'Codex', kind: 'codex', status: 'online', capabilities: ['read_files', 'write_code'], avatarSeed: '101010' },
    { id: 'trae', name: 'Trae Solo', kind: 'trae', status: 'unconfigured', capabilities: ['ui_layout', 'components'], avatarSeed: '010101' },
    { id: 'claude', name: 'Claude Code', kind: 'claude-code-cli', status: 'working', capabilities: ['review', 'refactor', 'test'], avatarSeed: '111000' },
  ],
  selectedAgentId: null,
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
}));
