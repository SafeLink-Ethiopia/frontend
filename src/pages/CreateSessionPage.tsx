import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
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
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      {/* Top navigation */}
      <header className="border-b border-[#a79093]/30 bg-[#f7f5f6]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
          <button
            type="button"
            onClick={onBack}
            className="group flex items-center gap-2 text-sm font-medium text-[#a79093] transition hover:text-[#3e1919]"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center bg-[#3e1919]">
              <LockKeyhole
                size={15}
                className="text-[#f0e2d6]"
              />
            </div>

            <span className="text-sm font-semibold tracking-wide">
              SafeLink
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto max-w-6xl px-6 py-12 sm:px-8 sm:py-16">
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_460px] lg:gap-20">
          {/* Introduction */}
          <div className="pt-2">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
              Private access
            </p>

            <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Create your private space.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-[#a79093]">
              Start a private SafeLink session without sharing your
              name, phone number, or email address.
            </p>

            <div className="mt-10 max-w-xl border-t border-[#a79093]/30">
              <PrivacyItem
                icon={<LockKeyhole size={19} />}
                title="Private by design"
                text="No personal information is required to create a session."
              />

              <PrivacyItem
                icon={<ShieldCheck size={19} />}
                title="Optional PIN"
                text="Add a PIN if you want an additional layer of protection."
              />

              <PrivacyItem
                icon={
                  <span className="text-sm font-semibold">Aa</span>
                }
                title="Your language"
                text="Choose English, Amharic, or Afaan Oromoo."
              />
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-[#a79093]/30">
            <div className="border-b border-[#a79093]/30 px-6 py-6 sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                New session
              </p>

              <h2 className="mt-2 text-2xl font-semibold">
                Get started
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#a79093]">
                Choose your language and optionally create a PIN.
              </p>
            </div>

            <div className="px-6 py-7 sm:px-8 sm:py-8">
              {/* Language */}
              <div className="mb-7">
                <label
                  htmlFor="language"
                  className="mb-2 block text-sm font-semibold"
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
                    border border-[#a79093]/40
                    bg-[#f7f5f6]
                    px-4 py-3.5
                    text-sm
                    text-[#3e1919]
                    outline-none
                    transition
                    focus:border-[#3e1919]
                    focus:ring-1
                    focus:ring-[#3e1919]
                  "
                >
                  <option value="en">English</option>
                  <option value="am">Amharic</option>
                  <option value="om">Afaan Oromoo</option>
                </select>
              </div>

              {/* PIN */}
              <div className="mb-7">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold"
                  >
                    Optional PIN
                  </label>

                  <span className="text-xs text-[#a79093]">
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
                      border border-[#a79093]/40
                      bg-[#f7f5f6]
                      px-4 py-3.5 pr-12
                      text-sm
                      text-[#3e1919]
                      placeholder:text-[#a79093]
                      outline-none
                      transition
                      focus:border-[#3e1919]
                      focus:ring-1
                      focus:ring-[#3e1919]
                    "
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? "Hide PIN"
                        : "Show PIN"
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      p-1
                      text-[#a79093]
                      transition
                      hover:text-[#3e1919]
                    "
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs leading-5 text-[#a79093]">
                  Use 4–20 characters. You can leave this empty.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-4 py-3">
                  <p className="text-sm leading-5 text-[#3e1919]">
                    {error}
                  </p>
                </div>
              )}

              {/* Create button */}
              <button
                type="button"
                onClick={handleCreateSession}
                disabled={isCreating}
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  bg-[#3e1919]
                  px-5
                  py-4
                  text-sm
                  font-semibold
                  text-[#f7f5f6]
                  transition
                  hover:bg-[#a79093]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isCreating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f7f5f6]/30 border-t-[#f7f5f6]" />
                    Creating session...
                  </>
                ) : (
                  <>
                    Create private session
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              {/* Privacy note */}
              <div className="mt-7 border-t border-[#a79093]/30 pt-6">
                <div className="flex items-start gap-3">
                  <LockKeyhole
                    size={17}
                    className="mt-0.5 shrink-0 text-[#a79093]"
                  />

                  <p className="text-xs leading-5 text-[#a79093]">
                    SafeLink does not require your name, phone number,
                    or email to create a private session. Keep your
                    SafeLink ID safe so you can access your session
                    again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom information */}
      <footer className="border-t border-[#a79093]/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-xs font-medium text-[#3e1919]">
            SafeLink
          </p>

          <p className="text-xs text-[#a79093]">
            Your privacy matters.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ================= PRIVACY ITEM ================= */

function PrivacyItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 border-b border-[#a79093]/30 py-5 last:border-b-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#f0e2d6] text-[#3e1919]">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-[#3e1919]">
          {title}
        </p>

        <p className="mt-1 text-sm leading-6 text-[#a79093]">
          {text}
        </p>
      </div>
    </div>
  );
}

export default CreateSessionPage;