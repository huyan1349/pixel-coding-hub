import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar, type ViewId } from './Sidebar';

export function AppShell({ children, activeView, onViewChange }: { children: ReactNode; activeView: ViewId; onViewChange: (v: ViewId) => void }) {
  return (
    <div className="w-screen h-screen aero-bg flex flex-col overflow-hidden select-none">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={onViewChange} />
        <motion.div
          className="flex-1 min-w-0 overflow-hidden pl-14 pr-4 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
