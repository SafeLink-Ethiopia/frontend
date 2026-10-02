
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const loginId = id.trim();

    if (!loginId) {
      setError("Please enter your ID.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    const role = detectRole(loginId);

    if (!role) {
      setError(
        "Invalid ID. User IDs start with SF, advisor IDs with ADV, and admin IDs with ADM.",
      );
      return;
    }

    setLoading(true);

    try {
      // =========================
      // USER LOGIN
      // =========================
      if (role === "user") {
        const response = await loginSession(loginId, password);

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
    <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold text-[#33484D]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[#6B7A7C]">
            Sign in to your SafeLink account
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="rounded-3xl bg-white p-8 shadow-lg"
        >
          <div className="mb-5">
            <label
              htmlFor="login-id"
              className="mb-2 block text-sm font-medium text-[#33484D]"
            >
              SafeLink ID
            </label>

            <input
              id="login-id"
              type="text"
              value={id}
              onChange={(event) => setId(event.target.value)}
              placeholder="SF..., ADV..., or ADMIN..."
              autoComplete="username"
              className="w-full rounded-xl border border-[#5C838A]/30 px-4 py-3 text-sm outline-none transition focus:border-[#5C838A]"
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-[#33484D]"
            >
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-[#5C838A]/30 px-4 py-3 text-sm outline-none transition focus:border-[#5C838A]"
            />
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#5C838A] py-3 font-semibold text-white transition hover:bg-[#4C6F75] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="mt-6 text-center">
            <span className="text-sm text-[#6B7A7C]">
              Don't have a user account?{" "}
            </span>

            <button
              type="button"
              onClick={() => navigate("/create")}
              className="text-sm font-semibold text-[#5C838A] underline"
            >
              Sign up
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 w-full text-center text-sm text-[#6B7A7C]"
          >
            Back
          </button>
        </form>
      </div>
    </main>
  );
}

