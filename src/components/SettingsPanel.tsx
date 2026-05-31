import { useState, useEffect } from 'react';
import { useAgentStore } from '../store/useAgentStore';
import type { KeyStatus } from '../types/agent';

const VERSION = 'v0.5.0-alpha';

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { keysStatus, claudeInstalled, envInfo } = useAgentStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!open || !hydrated) return null;

  const keyEntries = Object.entries(keysStatus) as [string, KeyStatus][];

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

        <div className="space-y-3">
          <div className="glass-panel p-3">
            <div className="font-mono text-xs text-neutral-400 mb-2">API Keys (Auto-detected from env)</div>
            {keyEntries.length === 0 ? (
              <div className="font-mono text-xs text-neutral-600">No keys detected — start bridge server first</div>
            ) : (
              keyEntries.map(([id, info]) => (
                <div key={id} className="flex items-center justify-between py-1.5">
                  <span className="font-mono text-xs text-neutral-300">{id}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-neutral-500">{info.source}</span>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${info.available ? 'bg-[#84a59d]' : 'bg-neutral-700'}`} />
                    <span className="font-mono text-[10px] text-neutral-500">{info.available ? info.masked : 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="glass-panel p-3">
            <div className="font-mono text-xs text-neutral-400 mb-2">Environment</div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-500">Claude CLI</span>
                <span className={`font-mono text-[10px] ${claudeInstalled ? 'text-[#84a59d]' : 'text-neutral-600'}`}>
                  {claudeInstalled ? 'Installed ✓' : 'Not Found'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-500">API Base URL</span>
                <span className="font-mono text-[10px] text-neutral-400">{envInfo.anthropicBaseUrl || '(default)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-500">Model</span>
                <span className="font-mono text-[10px] text-neutral-400">{envInfo.anthropicModel || '(default)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-neutral-500">Subagent Model</span>
                <span className="font-mono text-[10px] text-neutral-400">{envInfo.subagentModel || '(default)'}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-3">
            <div className="font-mono text-xs text-neutral-400 mb-2">Mode</div>
            <div className="font-mono text-xs text-neutral-300">MONITOR + COORDINATE</div>
            <div className="font-mono text-[10px] text-neutral-600 mt-1">
              Read agent status → Aggregate to panel → AI coordinates agents
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/[0.06] flex justify-between items-center">
          <span className="font-mono text-[10px] text-neutral-600">Keys auto-read from process.env</span>
          <span className="font-pixel text-[9px] text-neutral-600">{VERSION}</span>
        </div>
      </div>
    </div>
  );
}
