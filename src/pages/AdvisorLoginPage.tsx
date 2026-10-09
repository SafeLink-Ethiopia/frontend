import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginAdvisor } from "../api/advisorAuthApi";

export default function AdvisorLoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [advisorId, setAdvisorId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const { token, advisor } = await loginAdvisor(advisorId.trim(), password);

      localStorage.setItem("advisor_token", token);
      localStorage.setItem("advisor_profile", JSON.stringify(advisor));

      if (advisor.mustChangePassword) {
        navigate("/advisor/profile");
      } else {
        navigate("/advisor/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("advisorPortal.login.failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#33484D] p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-[#F4F7F7] p-8 shadow-xl"
      >
        <h1 className="mb-1 text-2xl font-semibold text-[#33484D]">{t("advisorPortal.login.title")}</h1>
        <p className="mb-6 text-sm text-[#6B7A7C]">{t("advisorPortal.login.description")}</p>

        <label className="mb-1 block text-sm font-medium text-[#33484D]">{t("advisorPortal.login.advisorId")}</label>
        <input
          value={advisorId}
          onChange={(e) => setAdvisorId(e.target.value)}
          placeholder={t("advisorPortal.login.advisorIdPlaceholder")}
          className="mb-4 w-full rounded-xl border border-[#5C838A]/30 px-4 py-2.5 text-sm outline-none focus:border-[#5C838A]"
        />

        <label className="mb-1 block text-sm font-medium text-[#33484D]">{t("advisorPortal.login.password")}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-xl border border-[#5C838A]/30 px-4 py-2.5 text-sm outline-none focus:border-[#5C838A]"
        />

        {error && <p className="mb-4 text-sm text-[#D96C6C]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#5C838A] py-3 text-sm font-semibold text-white transition hover:bg-[#4C6F75] disabled:opacity-50"
        >
          {loading ? t("advisorPortal.login.signingIn") : t("advisorPortal.login.signIn")}
        </button>

        <button
          type="button"
          onClick={() => navigate("/advisor/forgot-password")}
          className="mt-4 w-full text-center text-xs text-[#5C838A] underline"
        >
          {t("advisorPortal.login.forgotPassword")}
        </button>
      </form>
    </main>
  );
}
