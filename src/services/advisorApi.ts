import axios from "axios";

const API_URL = "https://backend-tncs.onrender.com/api/advisors";

export interface Advisor {
  advisor_id: string;
  name: string;
  email: string;
  gender: string;
  type: string;
  phone_number: string;
  location: string;
  working_hours: {
    start: string;
    end: string;
  };
  active: boolean;
  mustChangePassword: boolean;
}

export interface AdvisorLoginResponse {
  message: string;
  token: string;
  advisor: Advisor;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface VerifyOtpResponse {
  message: string;
  resetToken: string;
}

export interface ApiMessageResponse {
  message: string;
}

export const loginAdvisor = async (
  advisor_id: string,
  password: string,
): Promise<AdvisorLoginResponse> => {
  const response = await axios.post<AdvisorLoginResponse>(`${API_URL}/login`, {
    advisor_id,
    password,
  });

  return response.data;
};

export const changeAdvisorPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string,
): Promise<ApiMessageResponse> => {
  const response = await axios.post<ApiMessageResponse>(
    `${API_URL}/change-password`,
    {
      newPassword,
      confirmPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const logoutAdvisor = async (
  token: string,
): Promise<ApiMessageResponse> => {
  const response = await axios.post<ApiMessageResponse>(
    `${API_URL}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const forgotAdvisorPassword = async (
  email: string,
): Promise<ForgotPasswordResponse> => {
  const response = await axios.post<ForgotPasswordResponse>(
    `${API_URL}/forgot-password`,
    {
      email,
    },
  );

  return response.data;
};

export const verifyAdvisorResetOtp = async (
  email: string,
  otp: string,
): Promise<VerifyOtpResponse> => {
  const response = await axios.post<VerifyOtpResponse>(
    `${API_URL}/verify-reset-otp`,
    {
      email,
      otp,
    },
  );

  return response.data;
};

export const resetAdvisorPassword = async (
  email: string,
  resetToken: string,
  newPassword: string,
  confirmPassword: string,
): Promise<ApiMessageResponse> => {
  const response = await axios.post<ApiMessageResponse>(
    `${API_URL}/reset-password`,
    {
      email,
      resetToken,
      newPassword,
      confirmPassword,
    },
  );

  return response.data;
};
