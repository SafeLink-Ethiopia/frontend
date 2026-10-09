import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { forgotAdvisorPassword } from "../../services/advisorApi";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError(t("advisorPortal.forgotPassword.emailRequired"));
      return;
    }

    try {
      setLoading(true);

      const data = await forgotAdvisorPassword(email.trim());

      setSuccess(data.message);

      sessionStorage.setItem("advisorResetEmail", email.trim());

      setTimeout(() => {
        navigate("/advisor/verify-otp", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            t("advisorPortal.forgotPassword.requestError"),
        );
      } else {
        setError(t("advisorPortal.common.unexpectedError"));
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
              ✉
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
              {t("advisorPortal.common.portal")}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3e1919] sm:text-3xl">
              {t("advisorPortal.forgotPassword.title")}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#a79093]">
              {t("advisorPortal.forgotPassword.description")}
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
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#3e1919]"
                >
                  {t("advisorPortal.forgotPassword.email")}
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("advisorPortal.forgotPassword.emailPlaceholder")}
                  autoComplete="email"
                  disabled={loading}
                  className="w-full border border-[#a79093]/40 bg-[#f7f5f6] px-4 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs leading-5 text-[#a79093]">
                  {t("advisorPortal.forgotPassword.emailHint")}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3e1919] px-4 py-3 text-sm font-semibold text-[#f0e2d6] transition hover:bg-[#3e1919]/90 focus:outline-none focus:ring-2 focus:ring-[#3e1919]/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? t("advisorPortal.forgotPassword.sending")
                  : t("advisorPortal.forgotPassword.sendCode")}
              </button>
            </form>

            {/* BACK TO LOGIN */}
            <div className="mt-6 border-t border-[#a79093]/20 pt-6 text-center">
              <Link
                to="/advisor/login"
                className="text-sm font-semibold text-[#3e1919] transition hover:text-[#a79093] hover:underline"
              >
                {t("advisorPortal.common.backToLogin")}
              </Link>
            </div>
          </div>

          {/* SECURITY NOTE */}
          <div className="mt-6 flex items-start gap-3 px-2">
            <span className="text-sm">🔒</span>

            <p className="text-xs leading-5 text-[#a79093]">
              {t("advisorPortal.forgotPassword.securityNote")}
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[#a79093]">
            {t("advisorPortal.common.brandFooter")}
          </p>
        </div>
      </div>
    </main>
  );
}