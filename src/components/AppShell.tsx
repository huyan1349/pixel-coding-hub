import type { ReactNode } from 'react';
import { TopBar } from './TopBar';

export function AppShell({ sidebar, main, bottom }: { sidebar: ReactNode; main: ReactNode; bottom: ReactNode }) {
  return (
    <div className="w-screen h-screen bg-pixel-bg text-pixel-text flex flex-col overflow-hidden select-none">
      <TopBar />
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        <aside className="col-span-12 md:col-span-3 border-r-0 md:border-r border-white/10 bg-[#1e293b]/40 backdrop-blur-sm p-3 overflow-y-auto">
          {sidebar}
        </aside>
        <main className="col-span-12 md:col-span-9 flex flex-col overflow-hidden bg-pixel-bg">
          <div className="flex-1 overflow-hidden relative">{main}</div>
          <div className="h-48 border-t border-white/10 bg-[#1e293b]/40 backdrop-blur-sm">{bottom}</div>
        </main>
      </div>
    </div>
  );
}
