import type { ReactNode } from 'react';
import { TopBar } from './TopBar';

export function AppShell({
  left,
  right,
  onSettings,
}: {
  left: ReactNode;
  right: ReactNode;
  onSettings?: () => void;
}) {
  return (
    <div className="w-screen h-screen bg-pixel-bg text-pixel-text flex flex-col overflow-hidden select-none">
      <TopBar onSettings={onSettings} />
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[65%] min-w-0 overflow-hidden relative">
          {left}
        </div>
        <div className="w-px bg-white/[0.10] backdrop-blur-md flex-shrink-0" />
        <div className="w-[35%] min-w-0 overflow-hidden">
          {right}
        </div>
      </div>
    </div>
  );
}
