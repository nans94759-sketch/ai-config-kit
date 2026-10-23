'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, translate, defaultLocale } from '@/lib/i18n';

type I18nContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LOCALE_STORAGE_KEY = 'ai-config-kit-locale';
const VALID_LOCALES: Locale[] = ['zh-CN', 'en-US'];

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && VALID_LOCALES.includes(stored as Locale)) {
        setLocaleState(stored as Locale);
        return;
      }
      const detected = navigator.language?.startsWith('zh') ? 'zh-CN' : 'en-US';
      localStorage.setItem(LOCALE_STORAGE_KEY, detected);
      setLocaleState(detected);
    } catch {
      // localStorage unavailable, keep default
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => translate(locale, key);

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

/**
 * Safe hook that falls back to defaultLocale ('zh-CN') if used outside <I18nProvider>,
 * making <SettingsDialog /> / <SettingsPanel /> drop-in ready in any React app.
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: defaultLocale,
      setLocale: () => {},
      t: (key: string) => translate(defaultLocale, key),
    };
  }
  return context;
}
