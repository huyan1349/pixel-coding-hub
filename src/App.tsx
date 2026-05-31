import { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import type { ViewId } from './components/Sidebar';
import { MainStage } from './components/MainStage';
import { DashboardView } from './components/DashboardView';
import { LogsView } from './components/LogsView';
import { SettingsPanel } from './components/SettingsPanel';
import { useAgentStore } from './store/useAgentStore';

export default function App() {
  const { fetchKeysStatus, fetchAgentStatus } = useAgentStore();
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    fetchKeysStatus();
    fetchAgentStatus();

    const interval = setInterval(() => {
      fetchAgentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchKeysStatus, fetchAgentStatus]);

  useEffect(() => {
    if (activeView === 'settings') {
      setSettingsOpen(true);
      setActiveView('dashboard');
    }
  }, [activeView]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'map':
        return (
          <div className="w-full h-full rounded-2xl overflow-hidden">
            <MainStage />
          </div>
        );
      case 'logs':
        return <LogsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <AppShell activeView={activeView} onViewChange={setActiveView}>
        {renderView()}
      </AppShell>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
