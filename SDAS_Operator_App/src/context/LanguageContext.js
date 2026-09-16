import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '../i18n/translations';

const LANGUAGE_STORAGE_KEY = '@sdas_operator_language';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((saved) => {
      if (saved === 'en' || saved === 'si' || saved === 'ta') {
        setLanguageState(saved);
      }
    }).catch(() => {});
  }, []);

  const setLanguage = async (newLang) => {
    setLanguageState(newLang);
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to save operator language:', e);
    }
  };

  const t = (key, fallback = '') => {
    const langDict = translations[language] || translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const enDict = translations.en;
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (k, f) => f || k,
    };
  }
  return context;
}
