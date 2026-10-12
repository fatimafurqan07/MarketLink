import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Language, LanguageContextType } from './types.ts';
import { translations } from './translations.ts';

const STORAGE_KEY = 'egreen_lang';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'ur' || stored === 'en') {
        return stored;
      }
    } catch {
      // Fallback
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'ur' : 'en';
    setLanguage(nextLang);
  };

  const isRTL = language === 'ur';

  // Apply RTL direction and language attributes to the document
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.lang = language;
    htmlEl.dir = isRTL ? 'rtl' : 'ltr';

    if (isRTL) {
      document.body.classList.add('lang-ur');
    } else {
      document.body.classList.remove('lang-ur');
    }
  }, [language, isRTL]);

  const t = useMemo(() => {
    return (key: string, fallback?: string): string => {
      const langDict = translations[language] || translations.en;
      if (langDict && langDict[key]) {
        return langDict[key];
      }
      // Fallback to English dictionary if key missing in target language
      if (translations.en && translations.en[key]) {
        return translations.en[key];
      }
      return fallback !== undefined ? fallback : key;
    };
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    toggleLanguage,
    t,
    isRTL,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
