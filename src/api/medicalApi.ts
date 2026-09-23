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

  return handleResponse<Conversation>(response);
}

export async function getConversation(
  conversationId: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}`
  );

  return handleResponse<Conversation>(response);
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

  return handleResponse<Conversation>(response);
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

  return handleResponse<Conversation>(response);
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

  return handleResponse<Conversation>(response);
}