import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import es from './es.json';

const LANGUAGE_KEY = '@user_language';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const languageDetector: any = {
  type: 'languageDetector',
  async: true,
  detect: async (callback: (lang: string) => void) => {
    // Avoid accessing AsyncStorage on Node/SSR environment during build or server rendering
    if (typeof window !== 'undefined') {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage) {
          return callback(savedLanguage);
        }
      } catch (e) {
        console.error('Failed to load saved language', e);
      }
    }
    const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'es';
    callback(deviceLanguage);
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    if (typeof window !== 'undefined') {
      try {
        await AsyncStorage.setItem(LANGUAGE_KEY, lng);
      } catch (e) {
        console.error('Failed to save language setting', e);
      }
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
  });

export default i18n;
