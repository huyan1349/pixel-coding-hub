import { Terminal, Settings } from 'lucide-react';

export function TopBar({ onSettings }: { onSettings?: () => void }) {
  return (
    <div className="w-full bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06] px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#84a59d] animate-pulse-soft" />
        <h1 className="text-[13px] font-medium tracking-wide text-neutral-200" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
          Pixel Coding Hub
        </h1>
        <span className="font-pixel text-[7px] text-neutral-700">v0.6.0-alpha</span>
        <div className="hidden md:flex items-center gap-1.5 text-[11px] bg-white/[0.03] border border-white/[0.06] border-t-white/[0.1] rounded-lg px-2.5 py-1 text-neutral-500" style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 300 }}>
          <Terminal size={11} className="text-[#84a59d]" />
          <span>MONITOR + COORDINATE</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onSettings}
          className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] border-t-white/[0.1] text-neutral-500 hover:text-neutral-200 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 ease-out hover:-translate-y-px"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
