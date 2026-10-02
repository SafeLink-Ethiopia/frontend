const API_URL = "http://localhost:5000/api";

export type AdvisorType =
  | "medical"
  | "legal"
  | "psychological"
  | "general";

export interface Message {
  message_id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  deleted_at?: string;
}

export interface Recommendation {
  facility_id?: string;
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
  advisor_type?: AdvisorType;
  urgent?: boolean;
  hidden_for_user?: boolean;
  hidden_for_advisor?: boolean;
  created_at?: string;
  messages: Message[];
  recommendation: Recommendation | null;
  suggested_advisor_types?: AdvisorType[];
}

interface ConversationResponse {
  success: boolean;
  message?: string;
  conversation: Conversation;
}

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong"
    );
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

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

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

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function getConversationBySession(
  sessionId: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/session/${encodeURIComponent(
      sessionId
    )}`
  );

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function sendUserMessage(
  conversationId: string,
  text: string,
  urgent = false
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
        urgent,
      }),
    },
  );

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

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

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function editMessage(
  conversationId: string,
  messageId: string,
  text: string,
  sender: "user" | "advisor"
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/message/${messageId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        sender,
      }),
    }
  );

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
  sender: "user" | "advisor"
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/message/${messageId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender,
      }),
    }
  );

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function deleteSelectedMessages(
  conversationId: string,
  messageIds: string[],
  sender: "user" | "advisor"
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/messages/bulk`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_ids: messageIds,
      }),
    }
  );

  const data = await handleResponse<ConversationResponse>(
    response
  );

  return data.conversation;
}
export async function deleteSelectedChats(
  conversationIds: string[]
): Promise<void> {
  const response = await fetch(
    `${API_URL}/conversations/chats/bulk`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_ids: conversationIds,
      }),
    }
  );

  await handleResponse<{
    success: boolean;
    message?: string;
    deleted_count?: number;
  }>(response);
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

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function getPendingConversations(): Promise<
  Conversation[]
> {
  const response = await fetch(
    `${API_URL}/conversations/pending`
  );

  const data = await handleResponse<{
    success: boolean;
    conversations: Conversation[];
  }>(response);

  return data.conversations;
}
export async function deleteConversationForAdvisor(
  conversationId: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/advisor`,
    {
      method: "DELETE",
    }
  );

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function deleteSelectedConversations(
  conversationIds: string[]
): Promise<void> {
  if (conversationIds.length === 0) {
    return;
  }

  await Promise.all(
    conversationIds.map((conversationId) =>
      deleteConversationForAdvisor(conversationId)
    )
  );
}