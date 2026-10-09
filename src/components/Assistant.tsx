import { useEffect } from "react";
import {
  useLocation,
  useNavigate,
  type NavigateFunction,
} from "react-router-dom";
import { VoxideClient, VoxideWidget } from "@voxide/react";
import {
  getUserConversations,
  requestAdvisor,
  type AdvisorType,
} from "../api/conversationApi";
import { getSafelinkId, getSavedLanguage } from "../services/session";
import { executeQuickExit } from "./QuickExit";

const publicKey = import.meta.env.VITE_VOXIDE_PUBLIC_KEY;

if (!publicKey) {
  console.error(
    "[Assistant] VITE_VOXIDE_PUBLIC_KEY is not configured.",
  );
}

const ai = new VoxideClient({
  publicKey: publicKey ?? "",
});

let navigateTo: NavigateFunction | null = null;

const advisorTypes: AdvisorType[] = [
  "general",
  "medical",
  "legal",
  "psychological",
];

ai.register({
  startAdvisorConversation: {
    description:
      "Start or open a private conversation with the requested SafeLink advisor type: general, medical, legal, or psychological. Use this when the user asks to talk to, connect with, or request one of these advisors.",
    params: {
      advisorType: {
        type: "string",
        required: true,
        enum: advisorTypes,
        description:
          "The advisor type the user wants: general, medical, legal, or psychological.",
      },
    },
    dangerous: false,
    handler: async (args) => {
      const requestedAdvisorType = args.advisorType;

      if (
        typeof requestedAdvisorType !== "string" ||
        !advisorTypes.includes(requestedAdvisorType as AdvisorType)
      ) {
        throw new Error("Unsupported advisor type.");
      }

      const advisorType = requestedAdvisorType as AdvisorType;
      const sessionId = getSafelinkId();
      if (!sessionId) {
        navigateTo?.("/create");
        return {
          status: "session_required",
          message: "The user needs to create or continue a SafeLink session first.",
        };
      }

      const conversations = await getUserConversations(sessionId);
      const existingConversation = conversations.find(
        (conversation) => conversation.advisor_type === advisorType,
      );

      if (!existingConversation) {
        await requestAdvisor(sessionId, advisorType);
      }

      localStorage.setItem("safelink_selected_advisor", advisorType);
      localStorage.setItem(
        `safelink_selected_advisor_${sessionId}`,
        advisorType,
      );
      navigateTo?.("/user/dashboard/chat");

      return {
        status: existingConversation ? "opened" : "started",
        advisorType,
      };
    },
  },

  goToAwareness: {
    description:
      "Open SafeLink's awareness and education section, where the user can read safety and support information.",
    params: {},
    dangerous: false,
    handler: (): { status: string } => {
      navigateTo?.("/awareness");
      return { status: "opened" };
    },
  },

  quickExit: {
    description:
      "Immediately leave SafeLink and open a neutral external page using the app's existing Quick Exit behavior. Use this when the user asks to leave quickly or says they need a quick exit.",
    params: {},
    dangerous: false,
    handler: (): { status: string } => {
      executeQuickExit();
      return { status: "exited" };
    },
  },

  goToDashboard: {
    description:
      "Open the user's SafeLink private dashboard. Use this when the user asks to go home, see their dashboard, or return to their private space.",
    params: {},
    dangerous: false,
    handler: (): { status: string } => {
      navigateTo?.("/user/dashboard");
      return { status: "opened" };
    },
  },
});

ai.bindState(() => {
  const sessionId = getSafelinkId();

  // preferredLanguage tells the assistant which language the user is using so it can respond in kind.
  return {
    currentRoute: window.location.pathname,
    preferredLanguage: getSavedLanguage(),
    hasSession: Boolean(sessionId),
  };
});

export function Assistant() {
  const navigate = useNavigate();
  const location = useLocation();

  navigateTo = navigate;
  ai.setActiveRoute(location.pathname);

  useEffect(() => {
    navigateTo = navigate;

    return () => {
      if (navigateTo === navigate) {
        navigateTo = null;
      }
    };
  }, [navigate]);

  return <VoxideWidget client={ai} />;
}
