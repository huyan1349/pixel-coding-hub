import { Terminal, Settings } from 'lucide-react';

export function TopBar({ onSettings }: { onSettings?: () => void }) {
  return (
    <div className="w-full bg-white/[0.02] backdrop-blur-md border-b border-white/[0.08] px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="font-pixel text-[9px] text-neutral-400 animate-pulse">■</span>
        <h1 className="font-pixel text-[9px] tracking-wider text-neutral-200">PIXEL-CODING-HUB</h1>
        <span className="text-[10px] font-mono text-pixel-muted">v0.5.0-alpha</span>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] bg-white/[0.02] border border-white/[0.06] rounded-sm px-2 py-0.5 text-pixel-muted font-mono">
          <Terminal size={12} className="text-pixel-info" />
          <span>MONITOR + COORDINATE</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onSettings}
          className="p-1.5 rounded-sm bg-white/[0.02] border border-white/[0.08] text-pixel-muted hover:text-neutral-200 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 ease-out"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
