// The full set — matches advisor_type / suggested_advisor_types in the
// shared database design doc. A General Advisor can suggest ANY of these,
// including "medical", even though this frontend module doesn't render
// a medical chat page itself (that's your teammate's page).
export type AdvisorType = "medical" | "legal" | "psychological" | "general";

// The subset THIS module's AdvisorChat component actually renders as its
// own page. Medical has its own separate page/flow, built separately.
export type ChatAdvisorType = Exclude<AdvisorType, "medical">;

export interface Message {
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  edited: boolean;
}

export interface Conversation {
  conversation_id: string;
  session_id: string;
  advisor_id: string;
  advisor_type: AdvisorType;
  urgent: boolean;
  hidden_for_user: boolean;
  messages: Message[];
  suggested_advisor_types: AdvisorType[];
}