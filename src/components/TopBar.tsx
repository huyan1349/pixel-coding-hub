import { motion } from 'framer-motion';
import { Sun, Moon, Languages } from 'lucide-react';
import { usePreferences } from '../store/usePreferences';
import { t } from '../i18n';
import clsx from 'clsx';

export function TopBar() {
  const { theme, setTheme, locale, setLocale } = usePreferences();
  const isLight = theme === 'light';

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={clsx(
        'w-full backdrop-blur-xl px-5 py-2.5 flex items-center justify-between',
        isLight
          ? 'bg-black/[0.015] border-b border-black/[0.04]'
          : 'bg-white/[0.015] border-b border-white/[0.04]',
      )}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="w-2 h-2 rounded-full bg-[#84a59d]"
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h1 className={clsx('text-[13px] font-medium tracking-wide', isLight ? 'text-neutral-800' : 'text-neutral-200')} style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
          {t('appTitle', locale)}
        </h1>
        <span className="font-pixel text-[7px] text-neutral-700">v0.6.0-alpha</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={clsx(
          'hidden md:flex items-center gap-1.5 text-[11px] rounded-lg px-2.5 py-1',
          isLight
            ? 'bg-black/[0.02] border border-black/[0.04] text-neutral-600'
            : 'bg-white/[0.02] border border-white/[0.04] text-neutral-600',
        )} style={{ fontFamily: '"Inter", system-ui, sans-serif', fontWeight: 300 }}>
          <span>{t('mode', locale)}</span>
        </div>
        <button
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          className={clsx(
            'p-1.5 rounded-lg transition-all duration-300',
            isLight
              ? 'bg-black/[0.02] border border-black/[0.04] text-neutral-500 hover:text-neutral-700 hover:bg-black/[0.04]'
              : 'bg-white/[0.02] border border-white/[0.04] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]',
          )}
          title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
        >
          <Languages size={13} />
        </button>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className={clsx(
            'p-1.5 rounded-lg transition-all duration-300',
            isLight
              ? 'bg-black/[0.02] border border-black/[0.04] text-neutral-500 hover:text-neutral-700 hover:bg-black/[0.04]'
              : 'bg-white/[0.02] border border-white/[0.04] text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.04]',
          )}
          title={theme === 'dark' ? t('lightMode', locale) : t('darkMode', locale)}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>
      </div>
      <div className="glow-line absolute bottom-0 left-0 right-0" />
    </motion.div>
  );
}
