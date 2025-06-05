import { configureLocalization } from '@lit/localize';

export const sourceLocale = 'en';
export const targetLocales = ['tr'];

import { translations as enTranslations } from './locales/en.js';
import { translations as trTranslations } from './locales/tr.js';

let translationsCache = {
  en: enTranslations,
  tr: trTranslations
};

const getInitialLocale = () => {
  const savedLocale = localStorage.getItem('userLocale');
  if (savedLocale && (savedLocale === 'tr' || savedLocale === 'en')) {
    return savedLocale;
  }
  
  const browserLang = navigator.language.split('-')[0];
  return targetLocales.includes(browserLang) ? browserLang : sourceLocale;
};

const { getLocale: getCurrentLocale, setLocale: setCurrentLocale } = configureLocalization({
  sourceLocale,
  targetLocales,
  loadLocale: async (locale) => {
    if (translationsCache[locale]) {
      return translationsCache[locale];
    }
    
    try {
      const module = await import(`./locales/${locale}.js`);
      translationsCache[locale] = module.translations;
      return translationsCache[locale];
    } catch (error) {
      console.error(`Failed to load locale ${locale}:`, error);
      return translationsCache[sourceLocale];
    }
  },
});

export const getLocale = getCurrentLocale;

export const setLocale = async (newLocale) => {
  try {
    await setCurrentLocale(newLocale);
    localStorage.setItem('userLocale', newLocale);
    document.documentElement.lang = newLocale;
    window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale: newLocale } }));
    return true;
  } catch (error) {
    console.error('Failed to set locale:', error);
    return false;
  }
};

export const msg = (key) => {
  const currentLocale = getLocale();
  const translations = translationsCache[currentLocale] || translationsCache[sourceLocale];
  return translations?.[key] || key;
};

const initLocale = () => {
  const initialLocale = getInitialLocale();
  if (initialLocale !== sourceLocale) {
    setLocale(initialLocale);
  } else {
    document.documentElement.lang = sourceLocale;
  }
};

initLocale();
