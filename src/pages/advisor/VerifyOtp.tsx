import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { verifyAdvisorResetOtp } from "../../services/advisorApi";

export default function VerifyOtp() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("advisorResetEmail");

    if (!savedEmail) {
      navigate("/advisor/forgot-password", {
        replace: true,
      });
      return;
    }

    setEmail(savedEmail);
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is missing. Please request a new OTP.");
      return;
    }

    if (!otp) {
      setError("Please enter the verification code.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be exactly 6 digits.");
      return;
    }

    try {
      setLoading(true);

      const data = await verifyAdvisorResetOtp(email, otp);

      sessionStorage.setItem("advisorResetToken", data.resetToken);

      setSuccess(data.message || "OTP verified successfully.");

      setTimeout(() => {
        navigate("/advisor/reset-password", {
          replace: true,
        });
      }, 800);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Invalid or expired verification code.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Verify Your Email
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter the 6-digit verification code sent to your email address.
            </p>

            {email && (
              <p className="mt-3 text-sm font-medium text-slate-700">{email}</p>
            )}
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="otp"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                disabled={loading}
                maxLength={6}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] text-slate-900 outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <p className="mt-2 text-xs text-slate-500">
                The code expires after 10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/advisor/forgot-password"
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              Use a different email
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          SafeLink Advisor Portal
        </p>
      </div>
    </div>
  );
}
