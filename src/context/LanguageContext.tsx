import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import i18n from "../i18n";
import type { Language as SessionLanguage } from "../types/session";

export type Language = SessionLanguage;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const savedSession = localStorage.getItem("safelink_session");
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session?.language === "en" || session?.language === "am" || session?.language === "om") {
          return session.language;
        }
      }
    } catch (error) {
      console.error("Unable to read saved session language:", error);
    }
    return "en";
  });

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);

    try {
      const savedSession = localStorage.getItem("safelink_session");
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session && typeof session === "object") {
          localStorage.setItem(
            "safelink_session",
            JSON.stringify({ ...session, language: newLanguage }),
          );
        }
      } else {
        localStorage.setItem(
          "safelink_session",
          JSON.stringify({ language: newLanguage }),
        );
      }
    } catch (error) {
      console.error("Unable to update saved session language:", error);
    }

    void i18n.changeLanguage(newLanguage);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
