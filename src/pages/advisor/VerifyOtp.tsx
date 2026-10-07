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

  const handleOtpChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f5f6] px-5 py-10 text-[#3e1919] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center justify-center">
        <div className="w-full">
          {/* HEADER */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3e1919] text-2xl text-[#f0e2d6]">
              ✉
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
              Advisor Portal
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3e1919] sm:text-3xl">
              Verify your email
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#a79093]">
              Enter the 6-digit verification code sent to your
              advisor account email.
            </p>

            {email && (
              <p className="mt-4 inline-block border-b border-[#a79093]/40 pb-1 text-sm font-semibold text-[#3e1919]">
                {email}
              </p>
            )}
          </div>

          {/* FORM */}
          <div className="border-y border-[#a79093]/30 bg-white px-6 py-7 sm:px-8 sm:py-8">
            {/* ERROR */}
            {error && (
              <div className="mb-6 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-4 py-3">
                <p className="text-sm leading-5 text-[#3e1919]">
                  {error}
                </p>
              </div>
            )}

            {/* SUCCESS */}
            {success && (
              <div className="mb-6 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-4 py-3">
                <p className="text-sm leading-5 text-[#3e1919]">
                  {success}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-semibold text-[#3e1919]"
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
                  className="w-full border border-[#a79093]/40 bg-[#f7f5f6] px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] text-[#3e1919] outline-none transition placeholder:text-sm placeholder:tracking-normal placeholder:text-[#a79093] focus:border-[#3e1919] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs text-[#a79093]">
                    Enter all 6 digits.
                  </p>

                  <p className="text-xs font-medium text-[#a79093]">
                    Expires in 10 minutes
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-[#3e1919] px-4 py-3 text-sm font-semibold text-[#f0e2d6] transition hover:bg-[#3e1919]/90 focus:outline-none focus:ring-2 focus:ring-[#3e1919]/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>
            </form>

            {/* DIFFERENT EMAIL */}
            <div className="mt-6 border-t border-[#a79093]/20 pt-6 text-center">
              <Link
                to="/advisor/forgot-password"
                className="text-sm font-semibold text-[#3e1919] transition hover:text-[#a79093] hover:underline"
              >
                ← Use a different email
              </Link>
            </div>
          </div>

          {/* SECURITY NOTE */}
          <div className="mt-6 flex items-start gap-3 px-2">
            <span className="text-sm">🔒</span>

            <p className="text-xs leading-5 text-[#a79093]">
              Never share your verification code with anyone. SafeLink
              will only use this code to confirm your password reset
              request.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[#a79093]">
            SafeLink Advisor Portal
          </p>
        </div>
      </div>
    </main>
  );
}