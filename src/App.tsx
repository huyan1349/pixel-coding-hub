import { useState } from 'react';
import { AppShell } from './components/AppShell';
import { AgentCard } from './components/AgentCard';
import { MainStage } from './components/MainStage';
import { SettingsPanel } from './components/SettingsPanel';
import { useAgentStore } from './store/useAgentStore';

export default function App() {
  const { agents, eventLog, sseConnected } = useAgentStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const renderSidebar = () => (
    <div className="h-full flex flex-col">
      <div className="font-pixel text-[10px] text-pixel-muted mb-3 tracking-widest uppercase">
        AGENTS DOCK
      </div>
      <div className="flex-1 overflow-y-auto pr-1">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
      <button
        onClick={() => setSettingsOpen(true)}
        className="pixel-button text-[9px] font-pixel mt-2 w-full"
      >
        SETTINGS
      </button>
    </div>
  );

  const renderTerminal = () => (
    <div className="w-full h-full p-3 font-mono text-xs flex flex-col overflow-hidden">
      <div className="flex items-center justify-between text-neutral-400 border-b border-white/[0.08] pb-1 mb-2 text-[11px]">
        <span>STREAM LOG // AUDIT_LOGGER</span>
        <span className={sseConnected ? 'text-pixel-online' : 'text-pixel-muted'}>
          {sseConnected ? '● SSE LIVE' : '● OFFLINE'}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto text-pixel-muted space-y-1 select-text">
        <p className="text-pixel-info">[SYSTEM] Initializing Kernel Command Bridge...</p>
        <p className="text-pixel-text">[CONFIG] Successfully loaded 3 agent profiles into engine.</p>
        <p className="text-pixel-waiting">[WARN] Trae Solo adapter requires standard verification.</p>
        <p className="text-pixel-online">[READY] Core system fully listening on localhost:3000.</p>
        {eventLog.map((log, i) => (
          <p key={i} className="text-pixel-accent">{log}</p>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <AppShell sidebar={renderSidebar()} main={<MainStage />} bottom={renderTerminal()} />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
