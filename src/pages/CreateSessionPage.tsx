import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createSession } from "../api/sessionApi";
import type { Language } from "../types/session";

interface CreateSessionPageProps {
  onSessionCreated: (safelinkId: string) => void;
  onBack: () => void;
}

function CreateSessionPage({
  onSessionCreated,
  onBack,
}: CreateSessionPageProps) {
  const [language, setLanguage] = useState<Language>("en");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateSession = async () => {
    setError("");
    setIsCreating(true);

    try {
      const response = await createSession(language, password || undefined);

      const session = response.session;

      localStorage.setItem("safelink_session", JSON.stringify(session));

      onSessionCreated(session.safelink_id);
    } catch (error) {
      console.error("Failed to create session:", error);

      setError(
        "We couldn't create your private session. Please check your connection and try again.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main
      className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#FAFBF7] bg-cover bg-center bg-no-repeat px-4"
      style={{
        backgroundImage: "url('/safelink-login-bg.png')",
      }}
    >
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/85 px-3.5 py-2 text-sm font-medium text-[#173B28] shadow-sm backdrop-blur-sm transition hover:bg-white sm:left-6 sm:top-6"
      >
        <ArrowLeft size={17} />
        Back
      </button>

      {/* Main card */}
      <div className="w-full max-w-[420px] rounded-3xl border border-white/70 bg-white/95 px-6 py-5 shadow-xl backdrop-blur-sm sm:px-7 sm:py-6">
        {/* Logo */}
        <div className="flex h-[58px] items-center justify-center">
          <img
            src="/safelink-logo.png"
            alt="SafeLink"
            className="block h-auto max-h-[55px] w-[110px] object-contain"
          />
        </div>

        {/* Heading */}
        <div className="mt-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#173B28] sm:text-[25px]">
            Create your SafeLink session
          </h1>

          <p className="mx-auto mt-1.5 max-w-[330px] text-sm leading-5 text-[#5B6F62]">
            Start a private space without sharing your name, phone number, or
            email.
          </p>
        </div>

        {/* Form */}
        <div className="mt-5 space-y-3.5">
          {/* Language */}
          <div>
            <label
              htmlFor="language"
              className="mb-1.5 block text-sm font-semibold text-[#173B28]"
            >
              Language
            </label>

            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full rounded-xl border border-[#2F8F4E]/25 bg-[#FAFBF7] px-4 py-3 text-sm text-[#173B28] outline-none transition focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/15"
            >
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="om">Afaan Oromoo</option>
            </select>
          </div>

          {/* PIN */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-[#173B28]"
              >
                Optional PIN
              </label>

              <span className="text-xs text-[#6B7F72]">Optional</span>
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a PIN"
                maxLength={20}
                className="w-full rounded-xl border border-[#2F8F4E]/25 bg-[#FAFBF7] px-4 py-3 pr-12 text-sm text-[#173B28] outline-none transition placeholder:text-[#91A197] focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/15"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide PIN" : "Show PIN"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6B7F72] transition hover:text-[#176B3A]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <p className="mt-1.5 text-xs text-[#6B7F72]">
              Use 4–20 characters. You can leave this empty.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2">
              <p className="text-xs leading-5 text-red-700">{error}</p>
            </div>
          )}

          {/* Create button */}
          <button
            type="button"
            onClick={handleCreateSession}
            disabled={isCreating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2F8F4E] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating session...
              </>
            ) : (
              <>
                Create private session
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </div>

        {/* Privacy message */}
        <div className="mt-4 rounded-xl border border-[#2F8F4E]/15 bg-[#E7F1E3] px-3.5 py-2.5">
          <p className="text-center text-xs leading-5 text-[#365844]">
            No name, phone number, or email is required. Keep your SafeLink ID
            safe so you can access your session again.
          </p>
        </div>

        {/* Footer */}
        <p className="mt-3 text-center text-[11px] text-[#718277]">
          Private. Safe. Designed for you.
        </p>
      </div>
    </main>
  );
}

export default CreateSessionPage;
