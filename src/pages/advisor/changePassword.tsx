import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { changeAdvisorPassword } from "../../services/advisorApi";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("advisorToken");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError(t("advisorWorkspace.sessionExpired"));
      return;
    }

    if (!newPassword) {
      setError(t("advisorWorkspace.newPasswordRequired"));
      return;
    }

    if (!confirmPassword) {
      setError(t("advisorWorkspace.confirmPasswordRequired"));
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 72) {
      setError(t("advisorWorkspace.passwordLengthError"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("advisorWorkspace.passwordsDoNotMatch"));
      return;
    }

    try {
      setLoading(true);

      const data = await changeAdvisorPassword(
        token,
        newPassword,
        confirmPassword,
      );

      setSuccess(data.message);

      const advisorString = localStorage.getItem("advisor");

      if (advisorString) {
        const advisor = JSON.parse(advisorString);

        advisor.mustChangePassword = false;

        localStorage.setItem("advisor", JSON.stringify(advisor));
      }

      setTimeout(() => {
        navigate("/advisor/dashboard", {
          replace: true,
        });
      }, 1000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message ||
            t("advisorWorkspace.passwordChangeFailed"),
        );
      } else {
        setError(t("advisorWorkspace.genericError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("advisorToken");
    localStorage.removeItem("advisor");

    navigate("/advisor/login", {
      replace: true,
    });
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
              {t("advisorWorkspace.advisorPortal")}
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3e1919] sm:text-3xl">
              {t("advisorWorkspace.changeYourPassword")}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#a79093]">
              {t("advisorWorkspace.temporaryPasswordDescription")}
            </p>
          </div>

          {/* FORM AREA */}
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
                  {t("advisorWorkspace.newPassword")}
                </label>

                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder={t("advisorWorkspace.enterNewPassword")}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full border border-[#a79093]/40 bg-[#f7f5f6] px-4 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs leading-5 text-[#a79093]">
                  {t("advisorWorkspace.passwordLengthHint")}
                </p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#3e1919]"
                >
                  {t("advisorWorkspace.confirmNewPasswordLabel")}
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder={t("advisorWorkspace.confirmNewPassword")}
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full border border-[#a79093]/40 bg-[#f7f5f6] px-4 py-3 text-sm text-[#3e1919] outline-none transition placeholder:text-[#a79093] focus:border-[#3e1919] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3e1919] px-4 py-3 text-sm font-semibold text-[#f0e2d6] transition hover:bg-[#3e1919]/90 focus:outline-none focus:ring-2 focus:ring-[#3e1919]/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? t("advisorWorkspace.changingPassword")
                  : t("advisorWorkspace.changePassword")}
              </button>
            </form>

            {/* LOGOUT */}
            <div className="mt-6 border-t border-[#a79093]/20 pt-6">
              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="w-full border border-[#a79093]/50 bg-transparent px-4 py-3 text-sm font-semibold text-[#3e1919] transition hover:bg-[#f0e2d6] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("advisorWorkspace.cancelAndLogout")}
              </button>
            </div>
          </div>

          {/* SECURITY NOTE */}
          <div className="mt-6 flex items-start gap-3 px-2">
            <span className="text-sm">🔒</span>

            <p className="text-xs leading-5 text-[#a79093]">
              {t("advisorWorkspace.passwordSecurityNote")}
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-[#a79093]">
            {t("advisorWorkspace.safeLinkAdvisorPortal")}
          </p>
        </div>
      </div>
    </main>
  );
}