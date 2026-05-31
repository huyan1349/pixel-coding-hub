import { motion } from 'framer-motion';
import { LayoutDashboard, Map, ScrollText, Settings, Terminal } from 'lucide-react';
import clsx from 'clsx';

export type ViewId = 'dashboard' | 'map' | 'logs' | 'settings';

const NAV_ITEMS: { id: ViewId; icon: typeof LayoutDashboard; label: string }[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'map', icon: Map, label: 'Topology' },
  { id: 'logs', icon: ScrollText, label: 'Logs' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ activeView, onViewChange }: { activeView: ViewId; onViewChange: (v: ViewId) => void }) {
  return (
    <motion.div
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 py-3 px-1.5"
      style={{
        background: 'rgba(128, 128, 128, 0.04)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(128, 128, 128, 0.08)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}
    >
      <div className="mb-2 flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04]">
        <Terminal size={13} className="text-[#84a59d]" />
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={clsx(
              'w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300 ease-out relative group',
              isActive
                ? 'bg-white/[0.08] text-neutral-200'
                : 'text-neutral-600 hover:bg-white/[0.04] hover:text-neutral-400',
            )}
            title={item.label}
          >
            <Icon size={15} />
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute -left-0.5 w-0.5 h-3 rounded-full bg-gradient-to-b from-[#84a59d] to-[#c2b280]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <div className="absolute left-full ml-2 px-2 py-0.5 rounded-md bg-neutral-900/90 border border-white/[0.06] text-[10px] text-neutral-400 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
              {item.label}
            </div>
          </button>
        );
      })}
    </motion.div>
  );
}
