import { configureLocalization } from '@lit/localize';

export const sourceLocale = 'en';
export const targetLocales = ['tr'];

import { translations as enTranslations } from './locales/en.js';
import { translations as trTranslations } from './locales/tr.js';

export const { getLocale, setLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: (locale) => import(`./locales/${locale}.js`),
});

export const msg = (key) => {
  const currentLocale = getLocale();
  const translations = currentLocale === 'tr' ? trTranslations : enTranslations;
  return translations?.[key] || key;
};
