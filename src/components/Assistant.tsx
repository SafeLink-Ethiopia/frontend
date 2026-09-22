import {
  VoxideClient,
  VoxideWidget,
} from "@voxide/react";

import { goToMedicalFlow } from "../pages/medicalFlow";

const ai = new VoxideClient({
  publicKey:
    "vox_pub_85ff748128230386a14a5df5592f7948e30f2cf21d2d8bdd",
});

function showAwarenessPage(
  slug: "consent" | "harassment"
): void {
  window.location.href = `/awareness/${slug}`;
}

ai.register({
  requestMedicalSupport: {
    description:
      "Connect the user with a medical advisor. Trigger this when the user says they need medical help, need to see a doctor, or need medical support.",
    params: {},
    handler: async () => {
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
    handler: () => {
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
    handler: () => {
      showAwarenessPage("harassment");

      return {
        status: "shown",
      };
    },
  },
});

export function Assistant() {
  return <VoxideWidget client={ai} />;
}