import { useState } from "react";
import { loginSession } from "../api/sessionApi";

interface LoginSessionPageProps {
  onLoginSuccess: (safelinkId: string) => void;
  onBack: () => void;
}

function LoginSessionPage({
  onLoginSuccess,
  onBack,
}: LoginSessionPageProps) {
  const [safelinkId, setSafelinkId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!safelinkId.trim()) {
      setError("Please enter your SafeLink ID.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await loginSession(
        safelinkId.trim(),
        password || undefined
      );

      const session = response.session;

      localStorage.setItem(
        "safelink_session",
        JSON.stringify(session)
      );

      onLoginSuccess(session.safelink_id);
    } catch (error) {
      console.error("Session login failed:", error);

      setError(
        "We couldn't open this session. Please check your SafeLink ID and PIN."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f5f6] text-[#3e1919]">

      {/* Background decoration */}
      <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#f0e2d6] opacity-80 blur-3xl" />

      <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#a79093] opacity-20 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 py-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 font-medium text-[#3e1919] transition-all hover:gap-3 hover:text-[#a79093]"
        >
          <span>←</span>
          Back
        </button>
      </header>

      {/* Content */}
      <section className="relative z-10 flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-10">

        <div className="w-full max-w-lg">

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3e1919] shadow-lg shadow-[#3e1919]/20">
              <span className="text-3xl text-[#f0e2d6]">
                ♡
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="rounded-[2rem] border border-[#f0e2d6] bg-white/90 p-7 shadow-2xl backdrop-blur-xl md:p-9">

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold tracking-wide text-[#a79093]">
                PRIVATE SESSION
              </p>

              <h1 className="text-3xl font-bold text-[#3e1919]">
                Welcome back
              </h1>

              <p className="mt-3 leading-relaxed text-[#a79093]">
                Enter your SafeLink ID to return to your private session.
              </p>
            </div>

            {/* SafeLink ID */}
            <div className="mb-6">

              <label
                htmlFor="safelink-id"
                className="mb-2 block font-semibold text-[#3e1919]"
              >
                SafeLink ID
              </label>

              <input
                id="safelink-id"
                type="text"
                value={safelinkId}
                onChange={(e) => setSafelinkId(e.target.value)}
                placeholder="e.g. SL-A1B2C3D4"
                autoComplete="off"
                className="
                  w-full
                  rounded-xl
                  border border-[#f0e2d6]
                  bg-[#f7f5f6]
                  px-4 py-3.5
                  font-mono
                  uppercase
                  text-[#3e1919]
                  outline-none
                  transition
                  placeholder:text-[#a79093]
                  focus:border-[#a79093]
                  focus:ring-2
                  focus:ring-[#a79093]/20
                "
              />

            </div>

            {/* PIN */}
            <div className="mb-6">

              <label
                htmlFor="session-pin"
                className="mb-2 block font-semibold text-[#3e1919]"
              >
                PIN

                <span className="ml-2 font-normal text-[#a79093]">
                  if you created one
                </span>
              </label>

              <div className="relative">

                <input
                  id="session-pin"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your PIN"
                  autoComplete="off"
                  className="
                    w-full
                    rounded-xl
                    border border-[#f0e2d6]
                    bg-[#f7f5f6]
                    px-4 py-3.5 pr-16
                    text-[#3e1919]
                    outline-none
                    transition
                    placeholder:text-[#a79093]
                    focus:border-[#a79093]
                    focus:ring-2
                    focus:ring-[#a79093]/20
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-sm
                    font-medium
                    text-[#3e1919]
                    transition
                    hover:text-[#a79093]
                  "
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              <p className="mt-2 text-xs text-[#a79093]">
                If your session has no PIN, you can leave this empty.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-[#a79093]/30 bg-[#f0e2d6] px-4 py-3 text-sm text-[#3e1919]">
                {error}
              </div>
            )}

            {/* Login */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-[#3e1919]
                py-4
                font-semibold
                text-white
                shadow-lg
                shadow-[#3e1919]/20
                transition-all
                hover:bg-[#a79093]
                disabled:cursor-not-allowed
                disabled:bg-[#a79093]
              "
            >
              {isLoggingIn ? (
                <>
                  <span className="animate-spin">
                    ◌
                  </span>

                  Opening your session...
                </>
              ) : (
                <>
                  Continue to Private Support

                  <span>→</span>
                </>
              )}
            </button>

            {/* Privacy note */}
            <div className="mt-6 border-t border-[#f0e2d6] pt-6">

              <div className="flex gap-3">

                <span className="text-lg text-[#3e1919]">
                  🔒
                </span>

                <p className="text-xs leading-relaxed text-[#a79093]">
                  SafeLink does not require your name, phone number, or
                  email. Your SafeLink ID is used to access your private
                  session.
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

export default LoginSessionPage;