
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
    <main className="min-h-screen bg-[#faf8f3] text-[#12304a] relative overflow-hidden">

      {/* Background decoration */}
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

      {/* Content */}
      <section className="relative z-10 min-h-[calc(100vh-96px)] flex items-center justify-center px-6 py-10">

        <div className="w-full max-w-lg">

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#239b78] to-[#1685a5] flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl">
                ♡
              </span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl p-7 md:p-9">

            <div className="mb-8">
              <p className="text-sm font-semibold text-[#239b78] mb-2">
                PRIVATE SESSION
              </p>

              <h1 className="text-3xl font-bold">
                Welcome back
              </h1>

              <p className="text-gray-500 mt-3 leading-relaxed">
                Enter your SafeLink ID to return to your private session.
              </p>
            </div>

            {/* SafeLink ID */}
            <div className="mb-6">

              <label
                htmlFor="safelink-id"
                className="block font-semibold mb-2"
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
                  border border-gray-200
                  rounded-xl
                  px-4 py-3.5
                  bg-[#fafcfb]
                  font-mono
                  uppercase
                  outline-none
                  focus:ring-2
                  focus:ring-[#239b78]/30
                  focus:border-[#239b78]
                  transition
                "
              />

            </div>

            {/* PIN */}
            <div className="mb-6">

              <label
                htmlFor="session-pin"
                className="block font-semibold mb-2"
              >
                PIN
                <span className="text-gray-400 font-normal ml-2">
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
                If your session has no PIN, you can leave this empty.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Login */}
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
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
              {isLoggingIn ? (
                <>
                  <span className="animate-spin">◌</span>
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
            <div className="mt-6 pt-6 border-t border-gray-100">

              <div className="flex gap-3">

                <span className="text-lg">
                  🔒
                </span>

                <p className="text-xs text-gray-500 leading-relaxed">
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

