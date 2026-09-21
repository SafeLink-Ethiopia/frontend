import axios from "axios";

const API_URL = "http://localhost:5000";

export interface Session {
  safelink_id: string;
  language: "am" | "om" | "en";
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

export const createSession = async (
  language: "am" | "om" | "en",
  password?: string,
): Promise<CreateSessionResponse> => {
  const response = await axios.post<CreateSessionResponse>(
    `${API_URL}/session/create`,
    {
      language,
      ...(password ? { password } : {}),
    },
  );

  return response.data;
};

export const loginSession = async (
  safelink_id: string,
  password?: string,
): Promise<LoginSessionResponse> => {
  const response = await axios.post<LoginSessionResponse>(
    `${API_URL}/session/login`,
    {
      safelink_id,
      ...(password ? { password } : {}),
    },
  );

  return response.data;
};

export const getSession = async (
  safelink_id: string,
): Promise<{ session: Session }> => {
  const response = await axios.get<{ session: Session }>(
    `${API_URL}/session/${safelink_id}`,
  );

  return response.data;
};
