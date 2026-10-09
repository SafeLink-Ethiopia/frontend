import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import am from "./am.json";
import om from "./om.json";
import type { Language } from "../types/session";

function getInitialLanguage(): Language {
  try {
    const savedSession = localStorage.getItem("safelink_session");
    if (savedSession) {
      const language: unknown = JSON.parse(savedSession)?.language;
      if (language === "en" || language === "am" || language === "om") {
        return language;
      }
    }
  } catch (error) {
    console.error("Unable to read saved session language:", error);
  }
  return "en";
}

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    am: { translation: am },
    om: { translation: om },
  },
  lng: getInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
