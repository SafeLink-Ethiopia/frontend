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

  if (value.startsWith("SF")) {
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

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
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

    if ((role === "advisor" || role === "admin") && !password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      /* ================= USER LOGIN ================= */

      if (role === "user") {
        const response = await loginSession(loginId, password || undefined);

        localStorage.setItem(
          "safelink_session",
          JSON.stringify(response.session),
        );

        navigate("/user/dashboard", {
          replace: true,
        });

        return;
      }

      /* ================= ADVISOR LOGIN ================= */

      if (role === "advisor") {
        const response = await loginAdvisor(loginId, password);

        localStorage.setItem("advisor_token", response.token);

        localStorage.setItem(
          "advisor_profile",
          JSON.stringify(response.advisor),
        );

        if (response.advisor.mustChangePassword) {
          navigate("/advisor/profile", {
            replace: true,
          });
        } else {
          navigate("/advisor/dashboard", {
            replace: true,
          });
        }

        return;
      }

      /* ================= ADMIN LOGIN ================= */

      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_id: loginId,
          password,
        }),
      });

      const data: AdminLoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed.");
      }

      const token = data.token || data.accessToken;

      if (!token) {
        throw new Error("Login was successful, but no token was returned.");
      }

      localStorage.setItem("adminToken", token);

      localStorage.setItem("adminId", data.admin?.admin_id || loginId);

      navigate("/admin/dashboard", {
        replace: true,
      });
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
    <main
      className="
        relative
        h-screen
        w-full
        overflow-hidden
        bg-[#FAFBF7]
        text-[#173B28]
        bg-cover
        bg-center
        bg-no-repeat
      "
      style={{
        backgroundImage: "url('/safelink-login-bg.png')",
      }}
    >
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-[#FAFBF7]/20" />

      {/* ================= HEADER ================= */}

      <header className="absolute left-0 right-0 top-0 z-30 px-5 py-5 sm:px-8 sm:py-6 lg:px-12">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            group
            flex
            items-center
            gap-2
            rounded-lg
            px-2
            py-1
            text-sm
            font-semibold
            text-[#176B3A]
            transition
            hover:bg-white/60
          "
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">
            ←
          </span>

          <span className="hidden sm:inline">Back to SafeLink</span>

          <span className="sm:hidden">Back</span>
        </button>
      </header>

      {/* ================= LOGIN ================= */}

      <section className="relative z-20 flex h-full w-full items-center justify-center px-4 py-4 sm:px-6">
        <div className="w-full max-w-[450px]">
          <form
            onSubmit={handleLogin}
            className="
              max-h-[calc(100vh-30px)]
              overflow-y-auto
              rounded-[1.75rem]
              border
              border-[#2F8F4E]/15
              bg-white/95
              px-5
              py-5
              shadow-[0_25px_80px_rgba(23,59,40,0.15)]
              backdrop-blur-md
              sm:max-h-[calc(100vh-40px)]
              sm:rounded-[2rem]
              sm:px-8
              sm:py-6
            "
          >
            {/* ================= MAIN LOGO ================= */}

            <div className="mb-3 flex justify-center sm:mb-4">
              <img
                src="/safelink-logo.png"
                alt="SafeLink"
                className="
                  h-auto
                  w-[110px]
                  object-contain
                  sm:w-[125px]
                "
              />
            </div>

            {/* ================= WELCOME ================= */}

            <div className="mb-4 text-center sm:mb-5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#2F8F4E]">
                Private & Safe
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-[#173B28] sm:text-3xl">
                Welcome back
              </h1>

              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-[#557565] sm:text-sm">
                Log in to access your SafeLink account and continue your support
                journey.
              </p>
            </div>

            {/* ================= SAFE LINK ID ================= */}

            <div className="mb-3.5">
              <label
                htmlFor="login-id"
                className="mb-1.5 block text-xs font-semibold text-[#173B28] sm:text-sm"
              >
                SafeLink ID
              </label>

              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2F8F4E]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <circle
                      cx="12"
                      cy="8"
                      r="3.2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M5.5 19c.8-3.3 3-5 6.5-5s5.7 1.7 6.5 5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <input
                  id="login-id"
                  type="text"
                  value={id}
                  onChange={(event) => {
                    setId(event.target.value);
                    setError("");
                  }}
                  placeholder="e.g. SF123456"
                  autoComplete="username"
                  autoCapitalize="characters"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-[#2F8F4E]/20
                    bg-[#FAFBF7]
                    py-3
                    pl-11
                    pr-4
                    font-mono
                    text-sm
                    uppercase
                    text-[#173B28]
                    outline-none
                    transition
                    placeholder:font-sans
                    placeholder:normal-case
                    placeholder:text-[#8CA59A]
                    focus:border-[#2F8F4E]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#2F8F4E]/10
                    sm:py-3.5
                  "
                />
              </div>
            </div>

            {/* ================= PASSWORD ================= */}

            <div className="mb-3.5">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#173B28] sm:text-sm"
                >
                  Password / PIN
                </label>

                <span className="text-[10px] font-medium text-[#2F8F4E] sm:text-xs">
                  Optional for users
                </span>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2F8F4E]">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />

                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />

                    <circle cx="12" cy="15" r="1" fill="currentColor" />
                  </svg>
                </div>

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
                  className="
                    w-full
                    rounded-xl
                    border
                    border-[#2F8F4E]/20
                    bg-[#FAFBF7]
                    px-11
                    py-3
                    pr-14
                    text-sm
                    text-[#173B28]
                    outline-none
                    transition
                    placeholder:text-[#8CA59A]
                    focus:border-[#2F8F4E]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#2F8F4E]/10
                    sm:py-3.5
                  "
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    rounded-lg
                    p-1.5
                    text-[#176B3A]
                    transition
                    hover:bg-[#E7F1E3]
                  "
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path
                        d="M3 3l18 18"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M9.9 4.3A10.8 10.8 0 0 1 12 4c5.5 0 9 4 10 8-0.4 1.5-1.2 2.8-2.3 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />

                      <path
                        d="M6.1 6.1C4.4 7.3 3.3 9.1 2 12c1 4 4.5 8 10 8 1.1 0 2.2-.2 3.1-.5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <path
                        d="M2.5 12s3.2-6 9.5-6 9.5 6 9.5 6-3.2 6-9.5 6-9.5-6-9.5-6Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                    </svg>
                  )}
                </button>
              </div>

              <p className="mt-1 text-[10px] leading-relaxed text-[#789187] sm:text-xs">
                User sessions can be opened without a PIN. Advisor and admin
                accounts require a password.
              </p>
            </div>

            {/* ================= ERROR ================= */}

            {error && (
              <div className="mb-3.5 flex gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs leading-relaxed text-red-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
                  !
                </span>

                <p>{error}</p>
              </div>
            )}

            {/* ================= LOGIN BUTTON ================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                w-full
                items-center
                justify-center
                gap-3
                rounded-xl
                bg-[#2F8F4E]
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-[#2F8F4E]/20
                transition
                hover:bg-[#176B3A]
                hover:shadow-xl
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:py-3.5
              "
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

            {/* ================= PRIVATE & SAFE ================= */}

            <div className="mt-3.5 flex gap-3 rounded-xl bg-[#E7F1E3] p-3 sm:mt-4 sm:p-3.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <rect
                    x="5"
                    y="10"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />

                  <path
                    d="M8 10V7a4 4 0 0 1 8 0v3"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />

                  <circle cx="12" cy="15" r="1" fill="currentColor" />
                </svg>
              </div>

              <div>
                <p className="text-xs font-bold text-[#176B3A]">
                  Private & Safe
                </p>

                <p className="mt-0.5 text-[10px] leading-relaxed text-[#557565] sm:text-xs">
                  Your privacy comes first. We never share your information.
                </p>
              </div>
            </div>

            {/* ================= CREATE SESSION ================= */}

            <div className="mt-3.5 border-t border-[#2F8F4E]/10 pt-3.5 text-center sm:mt-4 sm:pt-4">
              <span className="text-xs text-[#789187] sm:text-sm">
                Need a new user session?{" "}
              </span>

              <button
                type="button"
                onClick={() => navigate("/create")}
                className="
                  text-xs
                  font-semibold
                  text-[#176B3A]
                  underline-offset-4
                  transition
                  hover:text-[#2F8F4E]
                  hover:underline
                  sm:text-sm
                "
              >
                Create one →
              </button>
            </div>
          </form>

          <p className="mt-2 text-center text-[10px] text-[#8CA59A] sm:mt-3 sm:text-xs">
            SafeLink Ethiopia · A safer path to support
          </p>
        </div>
      </section>
    </main>
  );
}
