import { VoxideClient, VoxideWidget } from "@voxide/react";
import React from "react";
// ---------------------------------------------------------------------
// STEP 1: Paste your real key here (from Voxide dashboard → Integration)
// ---------------------------------------------------------------------
const ai = new VoxideClient({
  publicKey: "vox_pub_85ff748128230386a14a5df5592f7948e30f2cf21d2d8bdd",
});

// ---------------------------------------------------------------------
// STEP 2: The handoff functions.
// Right now these are just placeholders (they log to the console) so
// YOU can test your action-registration works before Person 3 and
// Person 4 have anything built. Once they give you their real
// functions, swap these two out for real imports — e.g.:
//
//   import { goToMedicalFlow } from "../person3/medicalFlow";
//   import { showAwarenessPage } from "../person4/awareness";
//
// and delete the placeholder versions below.
// ---------------------------------------------------------------------
function goToMedicalFlow(): void {
  console.log("[PLACEHOLDER] Would now open Person 3's medical flow");
}

type AwarenessSlug = "consent" | "harassment";

function showAwarenessPage(slug: AwarenessSlug): void {
  console.log(`[PLACEHOLDER] Would now show Person 4's awareness page: ${slug}`);
}

// ---------------------------------------------------------------------
// STEP 3: Register the actions.
// The "description" is what the AI reads to decide when to trigger
// each one — write it in plain English, describing exactly when it
// should fire. This only needs to be done once, so it lives outside
// the component function.
//
// Note: if @voxide/react ships its own TypeScript types for
// ai.register(...), your editor will type-check this automatically.
// If you hit a type error here, check the package's own .d.ts files
// or docs for the exact expected shape — the structure below matches
// their documented example.
// ---------------------------------------------------------------------
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
// STEP 4 (optional): Give the AI awareness of app state.
// Uncomment and fill in once you have a real session ID from Person 1.
// ---------------------------------------------------------------------
// interface AppState {
//   safelinkId: string;
//   language: string;
// }
//
// ai.bindState((): AppState => {
//   return {
//     safelinkId: getCurrentSafelinkId(), // however Person 1 exposes this
//     language: getCurrentLanguage(),
//   };
// });

// ---------------------------------------------------------------------
// This is the component you'll import and place in App.tsx.
// ---------------------------------------------------------------------
export function Assistant(): React.JSX.Element {
  return <VoxideWidget client={ai} />;
}
