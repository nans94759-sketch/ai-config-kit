import { defaultLocale, type Locale } from './types';
export { type Locale, defaultLocale, locales, localeNames } from './types';
import { commonZhCN, commonEnUS } from './common';
import { settingsZhCN, settingsEnUS } from './settings';

export const translations = {
  'zh-CN': {
    ...commonZhCN,
    ...settingsZhCN,
  },
  'en-US': {
    ...commonEnUS,
    ...settingsEnUS,
  },
} as const;

export type TranslationKey = keyof (typeof translations)[typeof defaultLocale];

export function translate(locale: Locale, key: string): string {
  const keys = key.split('.');
  let value: unknown = translations[locale];
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
  }
  return (typeof value === 'string' ? value : undefined) ?? key;
}

export function getClientTranslation(key: string): string {
  let locale: Locale = defaultLocale;

  if (typeof window !== 'undefined') {
    try {
      const storedLocale = localStorage.getItem('ai-config-kit-locale');
      if (storedLocale === 'zh-CN' || storedLocale === 'en-US') {
        locale = storedLocale;
      }
    } catch {
      // localStorage unavailable, keep default locale
    }
  }

  return translate(locale, key);
}
