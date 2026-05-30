import { Terminal, Settings, ShieldAlert } from 'lucide-react';

export function TopBar() {
  return (
    <div className="w-full bg-[#1e293b]/80 backdrop-blur-sm border-b border-white/10 px-4 py-2 flex items-center justify-between font-mono">
      <div className="flex items-center gap-3">
        <span className="font-pixel text-[10px] text-pixel-accent animate-pulse">■</span>
        <h1 className="font-pixel text-[10px] tracking-wider text-pixel-text">PIXEL-CODING-HUB</h1>
        <span className="text-[10px] font-mono text-pixel-muted">v0.1.0</span>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] bg-white/5 border border-white/10 rounded-sm px-2 py-0.5 text-pixel-muted">
          <Terminal size={12} className="text-pixel-info" />
          <span>/users/dev/repo-sandbox</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[11px] text-pixel-waiting">
          <ShieldAlert size={14} />
          <span className="hidden sm:inline">MOCK MODE</span>
        </div>
        <button className="p-1.5 rounded-sm bg-white/5 border border-white/10 text-pixel-muted hover:text-pixel-text hover:border-white/20 hover:bg-white/5 transition-all duration-300 ease-out">
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
