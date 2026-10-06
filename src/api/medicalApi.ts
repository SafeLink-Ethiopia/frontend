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
  seen_at?: string | null;
}

export interface Recommendation {
  facility_id?: string;
  facility_name: string;
  location: string;
  contact: string;
  notes: string;
}

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

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

/**
 * Open a support conversation for a specific advisor type.
 * Used by MedicalFlowPage's pre-chat picker.
 */
export async function requestAdvisorSupport(
  sessionId: string,
  advisorType: AdvisorType
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/request`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session_id: sessionId,
        advisor_type: advisorType,
      }),
    }
  );

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function getConversation(
  conversationId: string
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}`
  );

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
    }
  );

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

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

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}

export async function getPendingConversations(): Promise<
  Conversation[]
> {
  const token = localStorage.getItem("advisor_token");
  const response = await fetch(
    `${API_URL}/conversations/pending`,
    {
      headers: {
        Authorization: `Bearer ${token ?? ""}`,
      },
    }
  );

  const data = await handleResponse<{
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

/**
 * Mark all messages from the other party as seen.
 *
 * viewer = "advisor" → marks all `sender: "user"` messages as seen.
 * viewer = "user"    → marks all `sender: "advisor"` messages as seen.
 */
export async function markMessagesSeen(
  conversationId: string,
  viewer: "user" | "advisor"
): Promise<Conversation> {
  const response = await fetch(
    `${API_URL}/conversations/${conversationId}/seen`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ viewer }),
    }
  );

  const data =
    await handleResponse<ConversationResponse>(
      response
    );

  return data.conversation;
}