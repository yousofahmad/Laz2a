import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LanguageContext = createContext({ language: 'en', setLanguage: () => {} });

function readSavedLanguage() {
  try {
    return window.localStorage.getItem('laz2a_language') === 'ar' ? 'ar' : 'en';
  } catch (_error) {
    return 'en';
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(readSavedLanguage);

  useEffect(() => {
    try {
      window.localStorage.setItem('laz2a_language', language);
    } catch (_error) {
      // The selected language still works for this session if storage is unavailable.
    }
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function localizedCopy(language, english, arabic) {
  return language === 'ar' ? arabic : english;
}
