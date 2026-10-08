export type AdvisorType = "medical" | "legal" | "psychological" | "general";

export type ChatAdvisorType = Exclude<AdvisorType, "medical">;

export interface Message {
  message_id?: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  edited: boolean;
  deleted?: boolean;
  deleted_at?: string | null;
  seen_at?: string | null;
  reply_to?: string | null;
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
