import { motion } from 'framer-motion';

export function TopBar() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-white/[0.015] backdrop-blur-xl border-b border-white/[0.04] px-5 py-2.5 flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#84a59d]"
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h1 className="text-[13px] font-medium tracking-wide text-neutral-200" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
          Pixel Coding Hub
        </h1>
        <span className="font-pixel text-[7px] text-neutral-700">v0.6.0-alpha</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 text-[11px] bg-white/[0.02] border border-white/[0.04] rounded-lg px-2.5 py-1 text-neutral-600" style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 300 }}>
          <span>MONITOR + COORDINATE</span>
        </div>
      </div>
      <div className="glow-line absolute bottom-0 left-0 right-0" />
    </motion.div>
  );
}
