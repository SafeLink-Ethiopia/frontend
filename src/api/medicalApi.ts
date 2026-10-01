const API_URL = "http://localhost:5000/api";

export interface Message {
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  edited?: boolean;
}

export interface Recommendation {
  facility_name: string;
  location: string;
  contact: string;
  notes: string;
}

export type AdvisorType = "general" | "medical" | "legal" | "psychological";

export interface Conversation {
  conversation_id: string;
  session_id: string;
  advisor_id: string;
  advisor_type: AdvisorType;
  messages: Message[];
  recommendation: Recommendation | null;
  urgent: boolean;
  hidden_for_user: boolean;
  created_at: string;
  updated_at: string;
}

interface ConversationResponse {
  success: boolean;
  message?: string;
  conversation: Conversation;
}

interface ConversationsResponse {
  success: boolean;
  message?: string;
  conversations: Conversation[];
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function requestMedicalSupport(
  sessionId: string,
): Promise<Conversation> {
  const response = await fetch(`${API_URL}/conversations/request/medical`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session_id: sessionId,
    }),
  });

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function getUserConversations(
  sessionId: string,
): Promise<Conversation[]> {
  const response = await fetch(`${API_URL}/conversations/session/${sessionId}`);

  const data = await handleResponse<ConversationsResponse>(response);

  return data.conversations;
}

export async function getConversation(
  conversationId: string,
): Promise<Conversation> {
  const response = await fetch(`${API_URL}/conversations/${conversationId}`);

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function sendUserMessage(
  conversationId: string,
  text: string,
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: "user",
        text,
      }),
    },
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function sendAdvisorMessage(
  conversationId: string,
  text: string,
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/message`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: "advisor",
        text,
      }),
    },
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function recommendFacility(
  conversationId: string,
  recommendation: Recommendation,
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/recommend`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recommendation),
    },
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}
export async function getUserConversation(
  sessionId: string,
  conversationId: string,
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/session/${sessionId}/${conversationId}`,
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function hideConversation(
  sessionId: string,
  conversationId: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/hide`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    },
  );

  await handleResponse<{ success: boolean }>(response);
}

export async function clearConversation(
  sessionId: string,
  conversationId: string,
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/clear`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    },
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function editUserMessage(
  sessionId: string,
  conversationId: string,
  messageIndex: number,
  text: string,
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/messages/${messageIndex}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        text,
      }),
    },
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}