import type { AdvisorType, Conversation } from "../types/advisor";

const BASE_URL = "/api/advisor";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Request failed.");
  }
  return res.json();
}

export function requestAdvisor(
  sessionId: string,
  advisorType: AdvisorType
): Promise<Conversation> {
  return fetch(`${BASE_URL}/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, advisor_type: advisorType }),
  }).then(handle<Conversation>);
}

export function getConversation(id: string): Promise<Conversation> {
  return fetch(`${BASE_URL}/conversation/${id}`).then(handle<Conversation>);
}

export function getConversationsForSession(
  sessionId: string
): Promise<Conversation[]> {
  return fetch(`${BASE_URL}/conversations?session_id=${sessionId}`).then(
    handle<Conversation[]>
  );
}

export function sendMessage(
  conversationId: string,
  sender: "user" | "advisor",
  text: string,
  urgent?: boolean
): Promise<Conversation> {
  return fetch(`${BASE_URL}/conversation/${conversationId}/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sender, text, urgent }),
  }).then(handle<Conversation>);
}

export function editMessage(
  conversationId: string,
  index: number,
  text: string
): Promise<Conversation> {
  return fetch(`${BASE_URL}/conversation/${conversationId}/message/${index}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).then(handle<Conversation>);
}

export function clearConversation(conversationId: string): Promise<Conversation> {
  return fetch(`${BASE_URL}/conversation/${conversationId}/clear`, {
    method: "POST",
  }).then(handle<Conversation>);
}

export function deleteConversation(
  conversationId: string
): Promise<{ status: string }> {
  return fetch(`${BASE_URL}/conversation/${conversationId}`, {
    method: "DELETE",
  }).then(handle<{ status: string }>);
}