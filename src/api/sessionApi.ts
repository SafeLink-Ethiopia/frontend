import axios from "axios";
import type {
  CreateSessionResponse,
  GetSessionResponse,
  Language,
  LoginSessionResponse,
} from "../types/session";

const API_URL = "http://localhost:5000";

export const createSession = async (
  language: Language,
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
  safelinkId: string,
  password?: string,
): Promise<LoginSessionResponse> => {
  const response = await axios.post<LoginSessionResponse>(
    `${API_URL}/session/login`,
    {
      safelink_id: safelinkId,
      ...(password ? { password } : {}),
    },
  );

  return response.data;
};

export const getSession = async (
  safelinkId: string,
): Promise<GetSessionResponse> => {
  const response = await axios.get<GetSessionResponse>(
    `${API_URL}/session/${safelinkId}`,
  );

  return response.data;
};
