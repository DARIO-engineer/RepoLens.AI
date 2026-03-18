import { useState, useCallback } from "react";
import { I18nContext, LANG_KEY, translations } from "./i18n-context";

function safeSetLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return undefined;
  }
  return value;
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(LANG_KEY) || "en";
    } catch {
      return "en";
    }
  });

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "pt" : "en";
      safeSetLocalStorage(LANG_KEY, next);
      return next;
    });
  }, []);

  const setLanguage = useCallback((nextLang) => {
    setLang(nextLang);
    safeSetLocalStorage(LANG_KEY, nextLang);
  }, []);

  const t = useCallback(
    (key, fallback) => translations[lang]?.[key] ?? translations.en?.[key] ?? fallback ?? key,
    [lang]
  );

  return (
    <I18nContext.Provider value={{ lang, t, toggleLang, setLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}
