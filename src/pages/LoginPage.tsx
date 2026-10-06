
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSession } from "../api/sessionApi";
import { loginAdvisor } from "../api/advisorAuthApi";

interface AdminLoginResponse {
  message?: string;
  token?: string;
  accessToken?: string;
  admin?: {
    admin_id?: string;
  };
}

type Role = "user" | "advisor" | "admin";

function detectRole(id: string): Role | null {
  const value = id.trim().toUpperCase();

  if (value.startsWith("SL")) {
    return "user";
  }

  if (value.startsWith("ADV")) {
    return "advisor";
  }

  if (value.startsWith("ADMIN")) {
    return "admin";
  }

  return null;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setError("");

    const loginId = id.trim();
    const role = detectRole(loginId);

    if (!loginId) {
      setError("Please enter your SafeLink ID.");
      return;
    }

    if (!role) {
      setError(
        "Invalid ID. User IDs start with SF, advisor IDs with ADV, and admin IDs with ADMIN.",
      );
      return;
    }

    // Password is required for staff accounts,
    // but optional for user private sessions.
    if ((role === "advisor" || role === "admin") && !password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // USER LOGIN
      // =========================
      if (role === "user") {
        const response = await loginSession(
          loginId,
          password || undefined,
        );

        localStorage.setItem(
          "safelink_session",
          JSON.stringify(response.session),
        );

        navigate("/user/dashboard", { replace: true });
        return;
      }

      // =========================
      // ADVISOR LOGIN
      // =========================
      if (role === "advisor") {
        const response = await loginAdvisor(loginId, password);

        localStorage.setItem("advisor_token", response.token);

        localStorage.setItem(
          "advisor_profile",
          JSON.stringify(response.advisor),
        );

        if (response.advisor.mustChangePassword) {
          navigate("/advisor/profile", { replace: true });
        } else {
          navigate("/advisor/dashboard", { replace: true });
        }

        return;
      }

      // =========================
      // ADMIN LOGIN
      // =========================
      const response = await fetch(
        "http://localhost:5000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admin_id: loginId,
            password,
          }),
        },
      );

      const data: AdminLoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed.");
      }

      const token = data.token || data.accessToken;

      if (!token) {
        throw new Error(
          "Login was successful, but the server did not return a token.",
        );
      }

      localStorage.setItem("adminToken", token);

      localStorage.setItem(
        "adminId",
        data.admin?.admin_id || loginId,
      );

      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your ID and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfcfc] text-[#0b4964]">
      {/* Background decoration */}
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#dff4f2] opacity-70 blur-3xl" />

      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#edf6fc] opacity-70 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-semibold text-[#496873] transition hover:text-[#0b4964]"
        >
          <span className="text-lg">←</span>
          Back to SafeLink
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0b4964] shadow-sm">
            <span className="text-lg font-bold text-white">♡</span>
          </div>

          <span className="text-lg font-bold tracking-tight text-[#0b4964]">
            SafeLink
          </span>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Intro */}
          <div className="mb-7 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#16a38b] to-[#079b9d] shadow-lg shadow-[#079b9d]/20">
              <span className="text-3xl text-white">♡</span>
            </div>

            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#16a38b]">
              Private & Safe
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#0b4964]">
              Welcome back
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-[#70888f]">
              Sign in to continue to your SafeLink space.
            </p>
          </div>

          {/* Login card */}
          <form
            onSubmit={handleLogin}
            className="rounded-[2rem] border border-[#e1eae7] bg-white/95 p-7 shadow-[0_20px_60px_rgba(11,73,100,0.10)] backdrop-blur-xl md:p-8"
          >
            {/* ID */}
            <div className="mb-5">
              <label
                htmlFor="login-id"
                className="mb-2 block text-sm font-semibold text-[#33484d]"
              >
                SafeLink ID
              </label>

              <input
                id="login-id"
                type="text"
                value={id}
                onChange={(event) => {
                  setId(event.target.value);
                  setError("");
                }}
                placeholder="SF..., ADV..., or ADMIN..."
                autoComplete="username"
                autoCapitalize="characters"
                className="w-full rounded-xl border border-[#d6e4e1] bg-[#f8fbfa] px-4 py-3.5 font-mono text-sm uppercase text-[#0b4964] outline-none transition placeholder:font-sans placeholder:normal-case placeholder:text-[#9aabad] focus:border-[#16a38b] focus:bg-white focus:ring-4 focus:ring-[#16a38b]/10"
              />

              <p className="mt-2 text-xs text-[#8a9ba0]">
                Enter the ID you received when creating your SafeLink
                account.
              </p>
            </div>

            {/* Password / PIN */}
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-[#33484d]"
                >
                  Password / PIN
                </label>

                <span className="text-xs font-medium text-[#8a9ba0]">
                  Optional for users
                </span>
              </div>

              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter your password or PIN"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#d6e4e1] bg-[#f8fbfa] px-4 py-3.5 pr-20 text-sm text-[#0b4964] outline-none transition placeholder:text-[#9aabad] focus:border-[#16a38b] focus:bg-white focus:ring-4 focus:ring-[#16a38b]/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-[#079b9d] transition hover:bg-[#e7f7f4]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-[#8a9ba0]">
                User sessions can be opened without a PIN if you did not
                create one. Advisor and admin accounts require a password.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0b4964] py-3.5 font-semibold text-white shadow-lg shadow-[#0b4964]/15 transition hover:bg-[#075c72] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-lg">◌</span>
                  Signing in...
                </>
              ) : (
                <>
                  Continue securely
                  <span className="text-lg">→</span>
                </>
              )}
            </button>

            {/* Privacy */}
            <div className="mt-6 flex gap-3 rounded-xl bg-[#eaf8f5] p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-sm shadow-sm">
                🔒
              </div>

              <div>
                <p className="text-xs font-semibold text-[#0b4964]">
                  Your privacy comes first
                </p>

                <p className="mt-1 text-xs leading-relaxed text-[#70888f]">
                  SafeLink is designed to minimize the personal information
                  needed to access support.
                </p>
              </div>
            </div>

            {/* Create account */}
            <div className="mt-6 border-t border-[#edf1f0] pt-5 text-center">
              <span className="text-sm text-[#70888f]">
                Need a new user session?{" "}
              </span>

              <button
                type="button"
                onClick={() => navigate("/create")}
                className="text-sm font-semibold text-[#079b9d] transition hover:text-[#0b4964]"
              >
                Create one
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-[#9aabad]">
            SafeLink Ethiopia · A private space for support
          </p>
        </div>
      </section>
    </main>
  );
}