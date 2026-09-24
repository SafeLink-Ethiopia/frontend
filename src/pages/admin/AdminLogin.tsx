import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoginResponse {
  message?: string;
  token?: string;
  accessToken?: string;
  admin?: {
    admin_id?: string;
  };
}

export default function AdminLogin() {
  const navigate = useNavigate();

  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    console.log("LOGIN BUTTON CLICKED");
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          admin_id: adminId.trim(),
          password,
        }),
      });

      const data: LoginResponse = await response.json();

      console.log("Login response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Admin login failed.");
      }

      // Support either "token" or "accessToken"
      const token = data.token || data.accessToken;

      if (!token) {
        throw new Error(
          "Login was successful, but the server did not return a JWT token.",
        );
      }

      // Save authentication information
      localStorage.setItem("adminToken", token);

      if (data.admin?.admin_id) {
        localStorage.setItem("adminId", data.admin.admin_id);
      } else {
        localStorage.setItem("adminId", adminId.trim());
      }

      console.log("Admin token saved.");
      console.log("Navigating to dashboard...");

      // Go to dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Admin login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#126d85] text-3xl text-white">
              ♡
            </div>

            <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>

            <p className="mt-2 text-gray-500">
              Sign in to access the SafeLink administration panel.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Admin ID */}
            <div>
              <label
                htmlFor="adminId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Admin ID
              </label>

              <input
                id="adminId"
                type="text"
                value={adminId}
                onChange={(event) => setAdminId(event.target.value)}
                placeholder="ADMIN-001"
                required
                autoComplete="username"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#126d85] focus:ring-1 focus:ring-[#126d85] disabled:bg-gray-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-[#126d85] focus:ring-1 focus:ring-[#126d85] disabled:bg-gray-100"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#126d85] px-5 py-3 font-semibold text-white transition hover:bg-[#0d5d73] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* Back Button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-gray-100 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Back to SafeLink
          </button>
        </div>
      </div>
    </div>
  );
}
