import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import he from './locales/he.json';

export const SUPPORTED_LANGS = ['he', 'en'];
export const RTL_LANGS = ['he'];

const STORAGE_KEY = 'mv.lang';

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'he' || saved === 'en') return saved;
  } catch {
    /* localStorage unavailable */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'he';
  return nav?.toLowerCase().startsWith('he') ? 'he' : 'en';
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    he: { translation: he },
  },
  lng: detectInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export default i18n;
