import { useState, useEffect } from 'react';
import { AppShell } from './components/AppShell';
import { MainStage } from './components/MainStage';
import { MonitorDashboard } from './components/MonitorDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { useAgentStore } from './store/useAgentStore';

export default function App() {
  const { fetchKeysStatus, fetchAgentStatus } = useAgentStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    fetchKeysStatus();
    fetchAgentStatus();

    const interval = setInterval(() => {
      fetchAgentStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchKeysStatus, fetchAgentStatus]);

  return (
    <>
      <AppShell
        left={<MainStage />}
        right={<MonitorDashboard />}
        onSettings={() => setSettingsOpen(true)}
      />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
