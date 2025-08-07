import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './en/translations.json';
import el from './el/translations.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      el: { translation: el },
    },
    lng: 'el', 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
