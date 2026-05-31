export function TopBar() {
  return (
    <div className="w-full bg-white/[0.02] backdrop-blur-xl border-b border-white/[0.06] px-5 py-2.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#84a59d] animate-pulse-soft" />
        <h1 className="text-[13px] font-medium tracking-wide text-neutral-200" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
          Pixel Coding Hub
        </h1>
        <span className="font-pixel text-[7px] text-neutral-700">v0.6.0-alpha</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 text-[11px] bg-white/[0.03] border border-white/[0.06] border-t-white/[0.1] rounded-lg px-2.5 py-1 text-neutral-500" style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 300 }}>
          <span>MONITOR + COORDINATE</span>
        </div>
      </div>
    </div>
  );
}
