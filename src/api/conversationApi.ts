import axios from "axios";

const API_URL = "http://localhost:5000/api/conversations";

export type Sender = "user" | "advisor";

export type AdvisorType = "medical" | "legal" | "psychological" | "general";

export interface Message {
  message_id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  edited: boolean;
  deleted: boolean;
  deleted_at?: string | null;
}

export interface Recommendation {
  facility_id: string;
  facility_name: string;
  location: string;
  contact: string;
  notes: string;
}

export interface Conversation {
  conversation_id: string;
  session_id: string;
  advisor_id: string;
  advisor_type: AdvisorType;
  urgent: boolean;
  hidden_for_user: boolean;
  hidden_for_advisor: boolean;
  created_at: string;
  messages: Message[];
  recommendation: Recommendation | null;
  suggested_advisor_types: AdvisorType[];
}

interface ConversationResponse {
  conversation: Conversation;
}

interface RequestConversationResponse {
  conversation: Conversation;
}

export const requestAdvisor = async (
  session_id: string,
  advisor_type: AdvisorType,
): Promise<Conversation> => {
  const response = await axios.post<RequestConversationResponse>(
    `${API_URL}/request`,
    {
      session_id,
      advisor_type,
    },
  );

  return response.data.conversation;
};

export const getUserConversation = async (
  session_id: string,
): Promise<Conversation | null> => {
  try {
    const response = await axios.get<ConversationResponse>(
      `${API_URL}/session/${session_id}`,
    );

    return response.data.conversation;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export const getConversation = async (
  conversationId: string,
): Promise<Conversation> => {
  const response = await axios.get<ConversationResponse>(
    `${API_URL}/${conversationId}`,
  );

  return response.data.conversation;
};

export const sendMessage = async (
  conversationId: string,
  sender: Sender,
  text: string,
  urgent = false,
): Promise<Conversation> => {
  const response = await axios.post<ConversationResponse>(
    `${API_URL}/${conversationId}/message`,
    {
      sender,
      text,
      urgent,
    },
  );

  return response.data.conversation;
};
