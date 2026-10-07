import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { resetAdvisorPassword } from "../../services/advisorApi";

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem("advisorResetEmail");
    const savedToken = sessionStorage.getItem("advisorResetToken");

    if (!savedEmail || !savedToken) {
      navigate("/advisor/forgot-password", {
        replace: true,
      });
      return;
    }

    setEmail(savedEmail);
    setResetToken(savedToken);
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email || !resetToken) {
      setError(
        "Your password reset session has expired. Please request a new code.",
      );
      return;
    }

    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword.length > 72) {
      setError("Password cannot exceed 72 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const data = await resetAdvisorPassword(
        email,
        resetToken,
        newPassword,
        confirmPassword,
      );

      setSuccess(data.message || "Password reset successfully.");

      sessionStorage.removeItem("advisorResetEmail");
      sessionStorage.removeItem("advisorResetToken");

      setTimeout(() => {
        navigate("/advisor/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            "Unable to reset your password.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f5f6] px-5 py-10 text-[#3e1919] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-lg items-center justify-center">
        <div className="w-full">
          {/* HEADER */}
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#3e1919] text-2xl text-[#f0e2d6]">
              🔐
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
              Advisor Portal
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3e1919] sm:text-3xl">
              Reset your password
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#a79093]">
              Create a new password for your advisor account. Your
              password should be between 8 and 72 characters.
            </p>
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
              {/* NEW PASSWORD */}
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-semibold text-[#3e1919]"
                >
                  New Password
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full border border-[#a79093]/40 bg-[#f7f5f6] px-4 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#3e1919]"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full border border-[#a79093]/40 bg-[#f7f5f6] px-4 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* PASSWORD REQUIREMENT */}
              <div className="border-l-2 border-[#a79093] pl-3">
                <p className="text-xs leading-5 text-[#a79093]">
                  Password must be between 8 and 72 characters.
                </p>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3e1919] px-4 py-3 text-sm font-semibold text-[#f0e2d6] transition hover:bg-[#3e1919]/90 focus:outline-none focus:ring-2 focus:ring-[#3e1919]/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Resetting Password..."
                  : "Reset Password"}
              </button>
            </form>

            {/* BACK TO LOGIN */}
            <div className="mt-6 border-t border-[#a79093]/20 pt-6 text-center">
              <Link
                to="/advisor/login"
                className="text-sm font-semibold text-[#3e1919] transition hover:text-[#a79093] hover:underline"
              >
                ← Back to Login
              </Link>
            </div>
          </div>

          {/* SECURITY NOTE */}
          <div className="mt-6 flex items-start gap-3 px-2">
            <span className="text-sm">🔒</span>

            <p className="text-xs leading-5 text-[#a79093]">
              Your reset session is temporary. Once your password
              has been changed, the verification information will be
              removed from this browser.
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