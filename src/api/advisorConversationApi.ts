import axios from "axios";
import type { Conversation, Message } from "./conversationApi";

const API_URL = "http://localhost:5000/api/conversations";

interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
}

interface ConversationResponse {
  conversation: Conversation;
}

const getAdvisorHeaders = () => {
  const token = localStorage.getItem("advisor_token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getPendingConversations = async (): Promise<Conversation[]> => {
  const response = await axios.get<ConversationsResponse>(
    `${API_URL}/pending`,
    {
      headers: getAdvisorHeaders(),
    },
  );

  return response.data.conversations;
};

export const getAdvisorConversation = async (
  conversationId: string,
): Promise<Conversation> => {
  const response = await axios.get<ConversationResponse>(
    `${API_URL}/${conversationId}`,
    {
      headers: getAdvisorHeaders(),
    },
  );

  return response.data.conversation;
};

export const sendAdvisorMessage = async (
  conversationId: string,
  text: string,
): Promise<Conversation> => {
  const response = await axios.post<ConversationResponse>(
    `${API_URL}/${conversationId}/message`,
    {
      sender: "advisor",
      text,
    },
    {
      headers: getAdvisorHeaders(),
    },
  );

  return response.data.conversation;
};
