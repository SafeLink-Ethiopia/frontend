import { useTranslation } from "react-i18next";
import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../types/session";

const choices: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "am", label: "አማ" },
  { value: "om", label: "OM" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div
      role="group"
      aria-label={t("language.select")}
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-1 rounded-full border border-[#2F8F4E]/25 bg-white/95 p-1 shadow-lg backdrop-blur"
    >
      {choices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          aria-pressed={language === choice.value}
          aria-label={t(`language.${choice.value}`)}
          onClick={() => setLanguage(choice.value)}
          className={`min-w-10 rounded-full px-3 py-2 text-xs font-semibold transition ${
            language === choice.value
              ? "bg-[#2F8F4E] text-white"
              : "text-[#173B28] hover:bg-[#E7F1E3]"
          }`}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
