import { LayoutDashboard, Map, ScrollText, Settings, Terminal } from 'lucide-react';
import clsx from 'clsx';

export type ViewId = 'dashboard' | 'map' | 'logs' | 'settings';

const NAV_ITEMS: { id: ViewId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'map', icon: Map, label: 'Map' },
  { id: 'logs', icon: ScrollText, label: 'Logs' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ activeView, onViewChange }: { activeView: ViewId; onViewChange: (v: ViewId) => void }) {
  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 py-4 px-2"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="mb-3 flex items-center justify-center w-8 h-8 rounded-xl bg-white/[0.04]">
        <Terminal size={14} className="text-[#84a59d]" />
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={clsx(
              'w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 ease-out group relative',
              isActive
                ? 'bg-white/[0.08] text-neutral-200'
                : 'text-neutral-600 hover:bg-white/[0.04] hover:text-neutral-400',
            )}
            title={item.label}
          >
            <Icon size={16} />
            <div className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-neutral-900/90 border border-white/[0.08] text-[11px] text-neutral-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {item.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
