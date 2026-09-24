import { VoxideClient, VoxideWidget } from "@voxide/react";
import { goToMedicalFlow } from "../pages/medicalFlow";

const ai = new VoxideClient({
  publicKey: "vox_pub_6fb2324ce0a6866ea41d2fd07f4a2ea38660b45136f97d3c",
});

type AwarenessSlug = "consent" | "harassment";

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

export function Assistant() {
  return <VoxideWidget client={ai} />;
}
