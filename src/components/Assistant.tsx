import { VoxideClient, VoxideWidget } from "@voxide/react";

type Language = "en" | "am" | "om";
type AwarenessSlug = "consent" | "harassment";

// ---------------------------------------------------------------------
// Read the saved language the same way MedicalFlowPage.tsx does, so
// the two stay in sync with whatever the user picked at session
// creation. Falls back to "en" if nothing is saved yet.
// ---------------------------------------------------------------------
function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem("safelink_session");
    if (!saved) return "en";

    const parsed = JSON.parse(saved);
    if (parsed?.language === "am") return "am";
    if (parsed?.language === "om") return "om";

    return "en";
  } catch {
    return "en";
  }
}

// ---------------------------------------------------------------------
// Pick the right key for the current language.
//
// If your Voxide dashboard uses ONE key for every language, only
// VITE_VOXIDE_PUBLIC_KEY_DEFAULT needs to be set in .env — this
// function will use it for every language automatically.
//
// If your dashboard actually has a separate project per language,
// fill in VITE_VOXIDE_PUBLIC_KEY_EN / _AM / _OM in .env and this
// will pick the right one based on the saved session language.
// ---------------------------------------------------------------------
function getPublicKeyForLanguage(language: Language): string {
  const perLanguageKeys: Record<Language, string | undefined> = {
    en: import.meta.env.VITE_VOXIDE_PUBLIC_KEY_EN,
    am: import.meta.env.VITE_VOXIDE_PUBLIC_KEY_AM,
    om: import.meta.env.VITE_VOXIDE_PUBLIC_KEY_OM,
  };

  const specificKey = perLanguageKeys[language];
  const fallbackKey = import.meta.env.VITE_VOXIDE_PUBLIC_KEY_DEFAULT;

  const key = specificKey || fallbackKey;

  if (!key) {
    console.error(
      "[Assistant] No Voxide public key found in .env — check VITE_VOXIDE_PUBLIC_KEY_DEFAULT is set.",
    );
  }

  return key ?? "";
}

const currentLanguage = getSavedLanguage();

const ai = new VoxideClient({});
console.log("[Assistant] Using language:", currentLanguage);
console.log(
  "[Assistant] Using key ending in:",
  getPublicKeyForLanguage(currentLanguage).slice(-6),
);

// ---------------------------------------------------------------------
// Navigate by URL for both flows — this matches how the rest of the
// app already routes (see App.tsx), and avoids depending on a
// separate handoff function/file that may not exist.
// ---------------------------------------------------------------------
function goToMedicalFlow(): void {
  window.location.href = "/medical";
}

function showAwarenessPage(slug: AwarenessSlug): void {
  window.location.href = `/awareness/${slug}`;
}

ai.register({
  requestMedicalSupport: {
    description:
      "Connect the user with a medical advisor. Trigger this when the user says they need medical help, need to see a doctor, or need medical support.",
    params: {},
    handler: async (): Promise<{ status: string }> => {
      goToMedicalFlow();
      return { status: "connecting" };
    },
  },

  explainConsent: {
    description:
      "Explain what consent means. Trigger this when the user asks what consent is or wants to learn about consent.",
    params: {},
    handler: (): { status: string } => {
      showAwarenessPage("consent");
      return { status: "shown" };
    },
  },

  explainHarassment: {
    description:
      "Explain what sexual harassment is. Trigger this when the user asks what sexual harassment is or wants to learn about it.",
    params: {},
    handler: (): { status: string } => {
      showAwarenessPage("harassment");
      return { status: "shown" };
    },
  },
});

// ---------------------------------------------------------------------
// Give the AI awareness of the current session language, in case it's
// useful context for how it responds.
// ---------------------------------------------------------------------
ai.bindState(() => {
  return {
    language: currentLanguage,
  };
});

export function Assistant() {
  return <VoxideWidget client={ai} />;
}
