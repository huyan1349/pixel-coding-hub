import type { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { Sidebar, type ViewId } from './Sidebar';

export function AppShell({ children, activeView, onViewChange }: { children: ReactNode; activeView: ViewId; onViewChange: (v: ViewId) => void }) {
  return (
    <div className="w-screen h-screen aero-bg text-pixel-text flex flex-col overflow-hidden select-none">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={onViewChange} />
        <div className="flex-1 min-w-0 overflow-hidden pl-14 pr-3 py-3">
          {children}
        </div>
      </div>
    </div>
  );
}
