import { Terminal, Settings, ShieldAlert } from 'lucide-react';

export function TopBar() {
  return (
    <div className="w-full bg-pixel-dark border-b-2 border-pixel-text p-2 flex items-center justify-between font-mono">
      <div className="flex items-center gap-3">
        <span className="font-pixel text-xs text-pixel-accent animate-pulse">■</span>
        <h1 className="font-pixel text-sm tracking-wider text-pixel-text">PIXEL-CODING-HUB v0.1.0</h1>
        <div className="hidden md:flex items-center gap-1 text-[11px] bg-pixel-panel border border-pixel-muted px-2 text-pixel-muted">
          <Terminal size={12} className="text-pixel-info" />
          <span>WORKSPACE: /users/dev/repo-sandbox</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-[11px] text-pixel-waiting">
          <ShieldAlert size={14} />
          <span className="hidden sm:inline">MOCK MODE ACTIVE</span>
        </div>
        <button className="pixel-panel p-1 bg-pixel-panel hover:bg-pixel-dark text-pixel-text">
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
