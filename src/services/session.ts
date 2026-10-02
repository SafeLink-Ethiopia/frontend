import type { Language, Session } from "../types/session";

function readSavedSession(): Session | null {
  try {
    const saved = localStorage.getItem("safelink_session");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function getSafelinkId(): string {
  return readSavedSession()?.safelink_id ?? "";
}

export function getSavedLanguage(): Language {
  return readSavedSession()?.language ?? "en";
}