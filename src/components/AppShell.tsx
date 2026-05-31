import type { ReactNode } from 'react';
import { TopBar } from './TopBar';

export function AppShell({ left, right, onSettings }: { left: ReactNode; right: ReactNode; onSettings?: () => void }) {
  return (
    <div className="w-screen h-screen aero-bg text-pixel-text flex flex-col overflow-hidden select-none">
      <TopBar onSettings={onSettings} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[65%] min-w-0 overflow-hidden relative p-3 pr-1.5">
          {left}
        </div>
        <div className="w-px bg-gradient-to-b from-white/[0.06] via-white/[0.08] to-white/[0.06] flex-shrink-0" />
        <div className="w-[35%] min-w-0 overflow-hidden p-3 pl-1.5">
          {right}
        </div>
      </div>
    </div>
  );
}
