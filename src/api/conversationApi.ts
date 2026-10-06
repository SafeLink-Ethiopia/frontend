
import axios from "axios";

const API_URL = "http://localhost:5000/api/conversations";

export type Sender = "user" | "advisor";

export type AdvisorType =
  | "medical"
  | "legal"
  | "psychological"
  | "general";

export interface Message {
  message_id: string;
  sender: Sender;
  text: string;
  timestamp: string;
  edited: boolean;
  deleted: boolean;
  deleted_at?: string | null;
  seen_at?: string | null;
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

interface ConversationsResponse {
  conversations: Conversation[];
}

interface RequestConversationResponse {
  conversation: Conversation;
}

// =========================
// REQUEST ADVISOR
// =========================

export const requestAdvisor = async (
  session_id: string,
  advisor_type: AdvisorType,
): Promise<Conversation> => {
  const response =
    await axios.post<RequestConversationResponse>(
      `${API_URL}/request`,
      {
        session_id,
        advisor_type,
      },
    );

  return response.data.conversation;
};

// =========================
// GET USER CONVERSATION
// =========================

export const getUserConversation = async (
  session_id: string,
): Promise<Conversation | null> => {
  try {
    const response =
      await axios.get<ConversationResponse>(
        `${API_URL}/session/${session_id}`,
      );

    return response.data.conversation;
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 404
    ) {
      return null;
    }

    throw error;
  }
};

// =========================
// GET ALL USER CONVERSATIONS
// =========================

export const getUserConversations = async (
  session_id: string,
): Promise<Conversation[]> => {
  const response =
    await axios.get<ConversationsResponse>(
      `${API_URL}/session/${session_id}/all`,
    );

  return response.data.conversations;
};

// =========================
// GET CONVERSATION
// =========================

export const getConversation = async (
  conversationId: string,
): Promise<Conversation> => {
  const response =
    await axios.get<ConversationResponse>(
      `${API_URL}/${conversationId}`,
    );

  return response.data.conversation;
};

// =========================
// SEND MESSAGE
// =========================

export const sendMessage = async (
  conversationId: string,
  sender: Sender,
  text: string,
  urgent = false,
): Promise<Conversation> => {
  const response =
    await axios.post<ConversationResponse>(
      `${API_URL}/${conversationId}/message`,
      {
        sender,
        text,
        urgent,
      },
    );

  return response.data.conversation;
};

// =========================
// EDIT MESSAGE
// =========================

export const editMessage = async (
  conversationId: string,
  messageId: string,
  text: string,
): Promise<Conversation> => {
  const response =
    await axios.patch<ConversationResponse>(
      `${API_URL}/${conversationId}/message/${messageId}`,
      {
        text,
      },
    );

  return response.data.conversation;
};

// =========================
// DELETE MESSAGE
// =========================

export const deleteMessage = async (
  conversationId: string,
  messageId: string,
): Promise<Conversation> => {
  const response =
    await axios.delete<ConversationResponse>(
      `${API_URL}/${conversationId}/message/${messageId}`,
    );

  return response.data.conversation;
};

// =========================
// MARK CONVERSATION AS SEEN
// =========================

export const markConversationSeen = async (
  conversationId: string,
  viewer: "user" | "advisor",
): Promise<Conversation> => {
  const response =
    await axios.patch<ConversationResponse>(
      `${API_URL}/${conversationId}/seen`,
      {
        viewer,
      },
    );

  return response.data.conversation;
};

