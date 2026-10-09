import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginSession } from "../api/sessionApi";
import { loginAdvisor } from "../api/advisorAuthApi";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

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

  if (value.startsWith("SL")) return "user";
  if (value.startsWith("ADV")) return "advisor";
  if (value.startsWith("ADMIN")) return "admin";

  return null;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();
  const { t } = useTranslation();

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
      setError(t("login.missingId"));
      return;
    }

    if (!role) {
      setError(t("login.invalidId"));
      return;
    }

    if ((role === "advisor" || role === "admin") && !password) {
      setError(t("login.missingPassword"));
      return;
    }

    setLoading(true);

    try {
      /* USER */
      if (role === "user") {
        const response = await loginSession(loginId, password || undefined);

        setLanguage(response.session.language);
        localStorage.setItem(
          "safelink_session",
          JSON.stringify(response.session),
        );

        navigate("/user/dashboard", {
          replace: true,
        });

        return;
      }

      /* ADVISOR */
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

      /* ADMIN */
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
        throw new Error("No login token received.");
      }

      localStorage.setItem("adminToken", token);

      localStorage.setItem("adminId", data.admin?.admin_id || loginId);

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : t("login.failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        overflow-hidden
        bg-[#FAFBF7]
        bg-cover
        bg-center
        bg-no-repeat
        px-4
      "
      style={{
        backgroundImage: "url('/safelink-login-bg.png')",
      }}
    >
      {/* Light background layer */}
      <div className="absolute inset-0 bg-[#FAFBF7]/20" />

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="
          absolute
          left-4
          top-4
          z-20
          rounded-lg
          px-2
          py-1
          text-sm
          font-medium
          text-[#176B3A]
          transition
          hover:bg-white/60
          sm:left-6
          sm:top-5
        "
      >
        ← {t("back")}
      </button>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-[390px]">
        <form
          onSubmit={handleLogin}
          className="
            rounded-[1.5rem]
            border
            border-[#2F8F4E]/15
            bg-white/95
            px-5
            py-5
            shadow-[0_20px_60px_rgba(23,59,40,0.14)]
            backdrop-blur-sm
            sm:px-7
            sm:py-6
          "
        >
          {/* Logo */}
          <div className="mb-3 flex justify-center">
            <img
              src="/safelink-logo.png"
              alt="SafeLink"
              className="
                w-[105px]
                object-contain
                sm:w-[120px]
              "
            />
          </div>

          {/* Heading */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl font-bold text-[#173B28]">{t("login.heading")}</h1>

            <p className="mt-1 text-xs text-[#789187]">
              {t("login.description")}
            </p>
          </div>

          {/* SafeLink ID */}
          <div className="mb-3">
            <label
              htmlFor="login-id"
              className="
                mb-1
                block
                text-xs
                font-semibold
                text-[#173B28]
              "
            >
              {t("safeLinkId")}
            </label>

            <input
              id="login-id"
              type="text"
              value={id}
              onChange={(event) => {
                setId(event.target.value);
                setError("");
              }}
              placeholder={t("login.idPlaceholder")}
              autoComplete="username"
              className="
                w-full
                rounded-xl
                border
                border-[#2F8F4E]/20
                bg-[#FAFBF7]
                px-4
                py-2.5
                text-sm
                uppercase
                text-[#173B28]
                outline-none
                transition
                placeholder:normal-case
                placeholder:text-[#9AAEA4]
                focus:border-[#2F8F4E]
                focus:bg-white
                focus:ring-2
                focus:ring-[#2F8F4E]/10
              "
            />
          </div>

          {/* Password */}
          <div className="mb-3">
            <label
              htmlFor="login-password"
              className="
                mb-1
                block
                text-xs
                font-semibold
                text-[#173B28]
              "
            >
              {t("login.passwordLabel")}
            </label>

            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder={t("login.passwordPlaceholder")}
                autoComplete="current-password"
                className="
                  w-full
                  rounded-xl
                  border
                  border-[#2F8F4E]/20
                  bg-[#FAFBF7]
                  px-4
                  py-2.5
                  pr-12
                  text-sm
                  text-[#173B28]
                  outline-none
                  transition
                  placeholder:text-[#9AAEA4]
                  focus:border-[#2F8F4E]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#2F8F4E]/10
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
                  text-sm
                  text-[#2F8F4E]
                "
              >
                {t(showPassword ? "login.hide" : "login.show")}
              </button>
            </div>

            <p className="mt-1 text-[10px] text-[#8CA59A]">
              {t("login.optionalPassword")}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="
                mb-3
                rounded-lg
                bg-red-50
                px-3
                py-2
                text-xs
                text-red-600
              "
            >
              {error}
            </div>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="
              flex
              w-full
              items-center
              justify-center
              rounded-xl
              bg-[#2F8F4E]
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-md
              shadow-[#2F8F4E]/20
              transition
              hover:bg-[#176B3A]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? t("login.signingIn") : t("login.continue")}
          </button>

        

          {/* Create */}
          <div className="mt-3 text-center">
            <span className="text-xs text-[#789187]">{t("login.newSession")} </span>

            <button
              type="button"
              onClick={() => navigate("/create")}
              className="
                text-xs
                font-semibold
                text-[#176B3A]
                hover:underline
              "
            >
              {t("login.createOne")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
