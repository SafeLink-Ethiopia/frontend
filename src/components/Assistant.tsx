import { VoxideClient, VoxideWidget } from "@voxide/react";

type Language = "en" | "am" | "om";
type AwarenessSlug = "consent" | "harassment";

// ---------------------------------------------------------------------
// Read the language saved when the SafeLink session was created.
// Falls back to English if there is no valid saved language.
// ---------------------------------------------------------------------
function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem("safelink_session");

    if (!saved) {
      return "en";
    }

    const parsed = JSON.parse(saved);

    if (parsed?.language === "am") {
      return "am";
    }

    if (parsed?.language === "om") {
      return "om";
    }

    return "en";
  } catch {
    return "en";
  }
}

// ---------------------------------------------------------------------
// Get the Voxide public key for the current language.
//
// If language-specific keys are not configured, the default key is used.
// ---------------------------------------------------------------------
function getPublicKeyForLanguage(language: Language): string {
  const languageKeys: Record<Language, string | undefined> = {
    en: import.meta.env.VITE_VOXIDE_PUBLIC_KEY_EN,
    am: import.meta.env.VITE_VOXIDE_PUBLIC_KEY_AM,
    om: import.meta.env.VITE_VOXIDE_PUBLIC_KEY_OM,
  };

  const key = languageKeys[language] || import.meta.env.VITE_VOXIDE_PUBLIC_KEY_DEFAULT;

  if (!key) {
    console.error(
      "[Assistant] No Voxide public key found in .env. " +
        "Check VITE_VOXIDE_PUBLIC_KEY_DEFAULT.",
    );
  }

  return key ?? "";
}

// ---------------------------------------------------------------------
// Session configuration
// ---------------------------------------------------------------------
const currentLanguage = getSavedLanguage();
const publicKey = getPublicKeyForLanguage(currentLanguage);

console.log("[Assistant] Using language:", currentLanguage);

if (publicKey) {
  console.log(
    "[Assistant] Using key ending in:",
    publicKey.slice(-6),
  );
}

const ai = new VoxideClient({
  publicKey,
});

// ---------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------
function goToMedicalFlow(): void {
  window.location.href = "/medical";
}

function showAwarenessPage(slug: AwarenessSlug): void {
  window.location.href = `/awareness/${slug}`;
}

// ---------------------------------------------------------------------
// AI actions
// ---------------------------------------------------------------------
ai.register({
  requestMedicalSupport: {
    description:
      "Connect the user with a medical advisor. Trigger this when the user says they need medical help, need to see a doctor, or need medical support.",
    params: {},
    handler: async (): Promise<{ status: string }> => {
      goToMedicalFlow();

      return {
        status: "connecting",
      };
    },
  },

  explainConsent: {
    description:
      "Explain what consent means. Trigger this when the user asks what consent is or wants to learn about consent.",
    params: {},
    handler: (): { status: string } => {
      showAwarenessPage("consent");

      return {
        status: "shown",
      };
    },
  },

  explainHarassment: {
    description:
      "Explain what sexual harassment is. Trigger this when the user asks what sexual harassment is or wants to learn about it.",
    params: {},
    handler: (): { status: string } => {
      showAwarenessPage("harassment");

      return {
        status: "shown",
      };
    },
  },
});

// ---------------------------------------------------------------------
// Give Voxide the current SafeLink session language.
// ---------------------------------------------------------------------
ai.bindState(() => ({
  language: currentLanguage,
}));

// ---------------------------------------------------------------------
// Assistant widget
// ---------------------------------------------------------------------
export function Assistant() {
  return <VoxideWidget client={ai} />;
}