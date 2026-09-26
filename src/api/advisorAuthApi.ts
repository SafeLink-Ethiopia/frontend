import type { AdvisorProfile } from "../types/advisorAuth";

const BASE_URL = "/api/advisors"; // her auth routes — confirm exact prefix with her

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Request failed.");
  return body;
}

export function loginAdvisor(
  advisor_id: string,
  password: string
): Promise<{ token: string; advisor: AdvisorProfile }> {
  return fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ advisor_id, password }),
  }).then((res) => handle<{ token: string; advisor: AdvisorProfile }>(res));
}

export function changePassword(
  token: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> {
  return fetch(`${BASE_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword, confirmPassword }),
  }).then((res) => handle<{ message: string }>(res));
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then((res) => handle<{ message: string }>(res));
}

export function verifyResetOtp(
  email: string,
  otp: string
): Promise<{ resetToken: string }> {
  return fetch(`${BASE_URL}/verify-reset-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  }).then((res) => handle<{ resetToken: string }>(res));
}

export function resetPassword(
  email: string,
  resetToken: string,
  newPassword: string,
  confirmPassword: string
): Promise<{ message: string }> {
  return fetch(`${BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, resetToken, newPassword, confirmPassword }),
  }).then((res) => handle<{ message: string }>(res));
}
