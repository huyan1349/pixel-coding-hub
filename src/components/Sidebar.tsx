import { motion } from 'framer-motion';
import { LayoutDashboard, Map, ScrollText, Settings, Cpu } from 'lucide-react';
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
      initial={{ x: -60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-4 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1 py-4 px-2"
      style={{
        background: 'rgba(255, 255, 255, 0.025)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderTopColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 40px rgba(0,0,0,0.5)',
      }}
    >
      <motion.div
        className="mb-3 flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] relative overflow-hidden"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <Cpu size={15} className="text-[#84a59d]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#84a59d]/10 to-transparent" />
      </motion.div>

      <div className="w-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-2" />

      {NAV_ITEMS.map((item, index) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={clsx(
              'w-9 h-9 flex items-center justify-center rounded-xl transition-colors duration-300 relative group',
              isActive
                ? 'bg-white/[0.08] text-neutral-200'
                : 'text-neutral-600 hover:bg-white/[0.04] hover:text-neutral-400',
            )}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            title={item.label}
          >
            <Icon size={16} />
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute -left-1 w-0.5 h-4 rounded-full bg-gradient-to-b from-[#84a59d] to-[#c2b280]"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-neutral-900/95 border border-white/[0.08] text-[11px] text-neutral-300 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl" style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 400 }}>
              {item.label}
            </div>
          </motion.button>
        );
      })}

      <div className="w-6 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mt-2 mb-2" />

      <motion.div
        className="w-2 h-2 rounded-full bg-[#84a59d]/40 animate-pulse-soft"
        whileHover={{ scale: 1.5 }}
      />
    </motion.div>
  );
}
