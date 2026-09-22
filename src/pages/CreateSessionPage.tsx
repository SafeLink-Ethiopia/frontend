
import { useState } from "react";
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
      const response = await createSession(
        language,
        password || undefined
      );

      const session = response.session;

      // Save session locally so the user can continue later.
      localStorage.setItem(
        "safelink_session",
        JSON.stringify(session)
      );

      onSessionCreated(session.safelink_id);
    } catch (error) {
      console.error("Failed to create session:", error);

      setError(
        "We couldn't create your private session. Please check your connection and try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#12304a] relative overflow-hidden">

      {/* Soft background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d9efe5] rounded-full blur-3xl opacity-70" />

      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#dceef4] rounded-full blur-3xl opacity-70" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#126d85] font-medium hover:gap-3 transition-all"
        >
          <span>←</span>
          Back
        </button>
      </header>

      {/* Main */}
      <section className="relative z-10 min-h-[calc(100vh-96px)] flex items-center justify-center px-6 py-10">

        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

          {/* Left information */}
          <div className="hidden lg:block">

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#239b78] to-[#1685a5] flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">
                  ♡
                </span>
              </div>

              <div>
                <p className="font-bold text-xl">
                  SafeLink
                </p>

                <p className="text-xs tracking-[0.3em] text-[#239b78] font-semibold">
                  ETHIOPIA
                </p>
              </div>
            </div>

            <h1 className="text-5xl font-bold leading-tight">
              Create your
              <span className="block text-[#239b78]">
                private space.
              </span>
            </h1>

            <p className="mt-6 text-gray-600 text-lg leading-relaxed max-w-md">
              You don't need to provide your name, phone number, or email.
              Your SafeLink ID lets you access your private session.
            </p>

            <div className="mt-8 space-y-4">

              <PrivacyItem
                icon="🔒"
                title="Private"
                text="No personal information required."
              />

              <PrivacyItem
                icon="🛡️"
                title="Protected"
                text="Your optional PIN is securely hashed."
              />

              <PrivacyItem
                icon="🌐"
                title="Your language"
                text="Choose English, Amharic or Afaan Oromoo."
              />

            </div>
          </div>

          {/* Form card */}
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl p-7 md:p-9">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-7">

              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#239b78] to-[#1685a5] flex items-center justify-center">
                <span className="text-white text-xl">
                  ♡
                </span>
              </div>

              <div>
                <p className="font-bold text-lg">
                  SafeLink
                </p>

                <p className="text-[10px] tracking-[0.3em] text-[#239b78] font-semibold">
                  ETHIOPIA
                </p>
              </div>

            </div>

            <div className="mb-8">
              <p className="text-sm font-semibold text-[#239b78] mb-2">
                PRIVATE SESSION
              </p>

              <h2 className="text-3xl font-bold">
                Let's get you started
              </h2>

              <p className="text-gray-500 mt-3 leading-relaxed">
                Choose your language and optionally add a PIN to protect
                your session.
              </p>
            </div>

            {/* Language */}
            <div className="mb-6">

              <label
                htmlFor="language"
                className="block font-semibold mb-2"
              >
                Language
              </label>

              <select
                id="language"
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as Language)
                }
                className="
                  w-full
                  border border-gray-200
                  rounded-xl
                  px-4 py-3.5
                  bg-[#fafcfb]
                  outline-none
                  focus:ring-2
                  focus:ring-[#239b78]/30
                  focus:border-[#239b78]
                  transition
                "
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
                <option value="om">Afaan Oromoo</option>
              </select>

            </div>

            {/* PIN */}
            <div className="mb-6">

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="font-semibold"
                >
                  Optional PIN
                </label>

                <span className="text-xs text-gray-400">
                  Optional
                </span>

              </div>

              <div className="relative">

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a PIN"
                  maxLength={20}
                  className="
                    w-full
                    border border-gray-200
                    rounded-xl
                    px-4 py-3.5 pr-16
                    bg-[#fafcfb]
                    outline-none
                    focus:ring-2
                    focus:ring-[#239b78]/30
                    focus:border-[#239b78]
                    transition
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#126d85] font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              <p className="text-xs text-gray-500 mt-2">
                Use 4–20 characters. You can leave this empty.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Create */}
            <button
              onClick={handleCreateSession}
              disabled={isCreating}
              className="
                w-full
                flex items-center justify-center gap-3
                bg-[#126d85]
                hover:bg-[#0d5d73]
                disabled:bg-gray-400
                text-white
                py-4
                rounded-xl
                font-semibold
                shadow-lg
                shadow-[#126d85]/20
                transition-all
              "
            >
              {isCreating ? (
                <>
                  <span className="animate-spin">
                    ◌
                  </span>
                  Creating your private session...
                </>
              ) : (
                <>
                  Create Private Session
                  <span>→</span>
                </>
              )}
            </button>

            {/* Privacy notice */}
            <div className="mt-6 pt-6 border-t border-gray-100">

              <div className="flex gap-3">

                <span className="text-lg">
                  🔒
                </span>

                <p className="text-xs text-gray-500 leading-relaxed">
                  SafeLink does not require your name, phone number, or
                  email to create a private session. Keep your SafeLink ID
                  safe so you can access your session again.
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}


/* ================= PRIVACY ITEM ================= */

function PrivacyItem({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">

      <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="font-semibold">
          {title}
        </p>

        <p className="text-sm text-gray-500">
          {text}
        </p>
      </div>

    </div>
  );
}

export default CreateSessionPage;

