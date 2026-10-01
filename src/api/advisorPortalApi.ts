import type { AdvisorProfile } from "../types/advisorAuth";
import type { Conversation } from "../types/advisor";

const BASE_URL = "/api/advisor-portal";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Request failed.");
  return body;
}

export function getMyConversations(
  token: string
): Promise<{ conversations: Conversation[] }> {
  return fetch(`${BASE_URL}/conversations`, {
    headers: authHeaders(token),
  }).then(handle<{ conversations: Conversation[] }>);
}

export function getMyProfile(token: string): Promise<{ advisor: AdvisorProfile }> {
  return fetch(`${BASE_URL}/profile`, { headers: authHeaders(token) }).then(
    handle<{ advisor: AdvisorProfile }>
  );
}

export function updateMyProfile(
  token: string,
  updates: Partial<
    Pick<AdvisorProfile, "name" | "phone_number" | "location" | "working_hours">
  >
): Promise<{ advisor: AdvisorProfile }> {
  return fetch(`${BASE_URL}/profile`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(updates),
  }).then(handle<{ advisor: AdvisorProfile }>);
}
