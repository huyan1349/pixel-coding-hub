import { useState, useEffect } from 'react';
import { useAgentStore } from '../store/useAgentStore';

const VERSION = 'v0.3.0-alpha';

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { agents, updateAgentApiKey } = useAgentStore();
  const [localKeys, setLocalKeys] = useState<Record<string, string>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const map: Record<string, string> = {};
    agents.forEach((a) => { map[a.id] = a.apiKey || ''; });
    setLocalKeys(map);
  }, [agents, open]);

  if (!open || !hydrated) return null;

  const handleKeyChange = (agentId: string, value: string) => {
    setLocalKeys((prev) => ({ ...prev, [agentId]: value }));
    updateAgentApiKey(agentId, value);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-panel p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-sm text-neutral-200">Settings</h2>
          <button
            onClick={onClose}
            className="pixel-button text-[9px] font-pixel px-2 py-1"
          >
            CLOSE
          </button>
        </div>

        <div className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.id}>
              <label className="block font-mono text-xs text-neutral-400 mb-1.5">
                {agent.name} API Key
              </label>
              <input
                type="password"
                value={localKeys[agent.id] ?? ''}
                onChange={(e) => handleKeyChange(agent.id, e.target.value)}
                placeholder={`Enter ${agent.name} API key...`}
                className="w-full bg-white/[0.02] border border-white/[0.08] rounded px-3 py-2 font-mono text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-white/[0.16] transition-colors duration-300"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 pt-3 border-t border-white/[0.06] flex justify-between items-center">
          <span className="font-mono text-[10px] text-neutral-600">Persisted via localStorage</span>
          <span className="font-pixel text-[9px] text-neutral-600">{VERSION}</span>
        </div>
      </div>
    </div>
  );
}
