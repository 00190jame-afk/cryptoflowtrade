import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ar from './locales/ar.json';
import nl from './locales/nl.json';
import sv from './locales/sv.json';
import tr from './locales/tr.json';
import el from './locales/el.json';
import cs from './locales/cs.json';
import ro from './locales/ro.json';
import hu from './locales/hu.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  it: { translation: it },
  pt: { translation: pt },
  ru: { translation: ru },
  zh: { translation: zh },
  ja: { translation: ja },
  ko: { translation: ko },
  ar: { translation: ar },
  nl: { translation: nl },
  sv: { translation: sv },
  tr: { translation: tr },
  el: { translation: el },
  cs: { translation: cs },
  ro: { translation: ro },
  hu: { translation: hu },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: (typeof localStorage !== 'undefined' && localStorage.getItem('language')) || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

if (typeof window !== 'undefined') {
  const setDir = (lng: string) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = ['ar', 'he', 'fa', 'ur'].includes(lng) ? 'rtl' : 'ltr';
  };
  setDir(i18n.language);
  i18n.on('languageChanged', (lng) => {
    try { localStorage.setItem('language', lng); } catch {}
    setDir(lng);
  });
}
