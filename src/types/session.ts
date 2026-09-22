export type Language = "am" | "om" | "en";

export interface Session {
  safelink_id: string;
  language: Language;
  created_at: string;
}

export interface CreateSessionResponse {
  message: string;
  session: Session;
}

export interface LoginSessionResponse {
  message: string;
  session: Session;
}

export interface GetSessionResponse {
  session: Session;
}
