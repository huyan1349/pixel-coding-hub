import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light';
export type Locale = 'zh' | 'en';

interface AppPreferences {
  theme: ThemeMode;
  locale: Locale;
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
}

export const usePreferences = create<AppPreferences>()(
  persist(
    (set) => ({
      theme: 'dark',
      locale: 'zh',
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'pixel-coding-hub-preferences',
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<AppPreferences>),
      }),
    },
  ),
);
