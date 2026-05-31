import { useState, useEffect } from 'react';
import { useAgentStore } from '../store/useAgentStore';
import type { KeyStatus } from '../types/agent';

const VERSION = 'v0.6.0-alpha';

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
      <div
        className="relative w-full max-w-md mx-4"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)',
          padding: '24px',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-medium text-neutral-200 tracking-wide" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>Settings</h2>
          <button onClick={onClose} className="pixel-button">Close</button>
        </div>

        <div className="space-y-3">
          <div className="glass-panel-inset p-4">
            <div className="telemetry-label mb-3">API Keys (Auto-detected)</div>
            {keyEntries.length === 0 ? (
              <div className="telemetry-value text-neutral-600">No keys detected — start bridge server first</div>
            ) : (
              keyEntries.map(([id, info]) => (
                <div key={id} className="flex items-center justify-between py-1.5">
                  <span className="telemetry-value">{id}</span>
                  <div className="flex items-center gap-2">
                    <span className="telemetry-label" style={{ fontSize: '10px' }}>{info.source}</span>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${info.available ? 'bg-[#84a59d]' : 'bg-neutral-700'}`} />
                    <span className="telemetry-value text-neutral-500">{info.available ? info.masked : 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="glass-panel-inset p-4">
            <div className="telemetry-label mb-3">Environment</div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="telemetry-label">Claude CLI</span>
                <span className={`telemetry-value ${claudeInstalled ? 'text-[#84a59d]' : 'text-neutral-600'}`}>
                  {claudeInstalled ? 'Installed ✓' : 'Not Found'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="telemetry-label">API Base URL</span>
                <span className="telemetry-value text-neutral-400">{envInfo.anthropicBaseUrl || '(default)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="telemetry-label">Model</span>
                <span className="telemetry-value text-neutral-400">{envInfo.anthropicModel || '(default)'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="telemetry-label">Subagent Model</span>
                <span className="telemetry-value text-neutral-400">{envInfo.subagentModel || '(default)'}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel-inset p-4">
            <div className="telemetry-label mb-2">Mode</div>
            <div className="telemetry-value text-neutral-200">MONITOR + COORDINATE</div>
            <div className="telemetry-value text-[10px] text-neutral-600 mt-1">
              Read agent status → Aggregate to panel → AI coordinates agents
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="telemetry-value text-[10px] text-neutral-600">Keys auto-read from process.env</span>
          <span className="font-pixel text-[7px] text-neutral-700">{VERSION}</span>
        </div>
      </div>
    </div>
  );
}
