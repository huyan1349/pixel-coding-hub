import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppShell } from './components/AppShell';
import type { ViewId } from './components/Sidebar';
import { MainStage } from './components/MainStage';
import { DashboardView } from './components/DashboardView';
import { LogsView } from './components/LogsView';
import { SettingsPanel } from './components/SettingsPanel';
import { useAgentStore } from './store/useAgentStore';

const pageVariants = {
  enter: { opacity: 0, y: 12, scale: 0.98 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
};

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
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            className="w-full h-full"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </AppShell>
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
