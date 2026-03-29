import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import cs from './locales/cs.json';
import en from './locales/en.json';
import sk from './locales/sk.json';

const detectLanguage = (): string => {
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('cs')) return 'cs';
  if (lang.startsWith('sk')) return 'sk';
  return 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    cs: { translation: cs },
    sk: { translation: sk },
  },
  lng: detectLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
