const API_URL = "http://localhost:5000/api";

export interface Message {
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
}

export interface Recommendation {
  facility_name: string;
  location: string;
  contact: string;
  notes: string;
}

export interface Conversation {
  conversation_id: string;
  session_id: string;
  advisor_id: string;
  messages: Message[];
  recommendation: Recommendation | null;
}

interface ConversationResponse {
  success: boolean;
  message?: string;
  conversation: Conversation;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export async function requestMedicalSupport(
  sessionId: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/request/medical`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    }
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function getConversation(
  conversationId: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}`
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function sendUserMessage(
  conversationId: string,
  text: string
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
    }
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function sendAdvisorMessage(
  conversationId: string,
  text: string
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
    }
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}

export async function recommendFacility(
  conversationId: string,
  recommendation: Recommendation
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/recommend`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recommendation),
    }
  );

  const data = await handleResponse<ConversationResponse>(response);

  return data.conversation;
}