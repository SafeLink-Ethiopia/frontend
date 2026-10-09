import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { resetAdvisorPassword } from "../../services/advisorApi";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        t("advisorPortal.resetPassword.sessionExpired"),
      );
      return;
    }

    if (!newPassword) {
      setError(t("advisorPortal.resetPassword.passwordRequired"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("advisorPortal.resetPassword.passwordTooShort"));
      return;
    }

    if (newPassword.length > 72) {
      setError(t("advisorPortal.resetPassword.passwordTooLong"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("advisorPortal.resetPassword.passwordMismatch"));
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

      setSuccess(data.message || t("advisorPortal.resetPassword.success"));

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
          error.response?.data?.message || t("advisorPortal.resetPassword.requestError"),
        );
      } else {
        setError(t("advisorPortal.common.unexpectedError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              {t("advisorPortal.resetPassword.title")}
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {t("advisorPortal.resetPassword.description")}
            </p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="newPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {t("advisorPortal.resetPassword.newPassword")}
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder={t("advisorPortal.resetPassword.newPasswordPlaceholder")}
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                {t("advisorPortal.resetPassword.confirmPassword")}
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t("advisorPortal.resetPassword.confirmPasswordPlaceholder")}
                autoComplete="new-password"
                disabled={loading}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <p className="text-xs text-slate-500">
              {t("advisorPortal.resetPassword.passwordHint")}
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("advisorPortal.resetPassword.resetting") : t("advisorPortal.resetPassword.title")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/advisor/login"
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              {t("advisorPortal.common.backToLogin")}
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {t("advisorPortal.common.brandFooter")}
        </p>
      </div>
    </div>
  );
}
