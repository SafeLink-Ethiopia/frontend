import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

interface UserSession {
  safelink_id: string;
  language: "en" | "am" | "om";
  created_at: string;
}

type AdvisorType = "medical" | "legal" | "psychological" | "general";

const advisorInfo: Record<
  AdvisorType,
  {
    title: string;
    description: string;
    symbol: string;
  }
> = {
  medical: {
    title: "profile.medicalAdvisor",
    description: "profile.medicalDescription",
    symbol: "✚",
  },
  legal: {
    title: "profile.legalAdvisor",
    description: "profile.legalDescription",
    symbol: "§",
  },
  psychological: {
    title: "profile.psychologicalAdvisor",
    description: "profile.psychologicalDescription",
    symbol: "◌",
  },
  general: {
    title: "profile.generalAdvisor",
    description: "profile.generalDescription",
    symbol: "•",
  },
};

function UserProfile() {
  const navigate = useNavigate();
  const { language: activeLanguage, setLanguage } = useLanguage();
  const { t } = useTranslation();

  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorType | null>(
    null,
  );

  const [copied, setCopied] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  useEffect(() => {
    const savedSession = localStorage.getItem("safelink_session");

    if (!savedSession) {
      navigate("/login");
      return;
    }

    try {
      const parsedSession: UserSession = JSON.parse(savedSession);

      if (!parsedSession.safelink_id) {
        navigate("/login");
        return;
      }

      setSession(parsedSession);

      const savedAdvisor = localStorage.getItem(
        `safelink_selected_advisor_${parsedSession.safelink_id}`,
      );

      if (
        savedAdvisor === "medical" ||
        savedAdvisor === "legal" ||
        savedAdvisor === "psychological" ||
        savedAdvisor === "general"
      ) {
        setSelectedAdvisor(savedAdvisor);
      }
    } catch {
      localStorage.removeItem("safelink_session");
      navigate("/login");
    }
  }, [navigate]);

  const handleCopy = async () => {
    if (!session?.safelink_id) return;

    try {
      await navigator.clipboard.writeText(session.safelink_id);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      console.error("Failed to copy SafeLink ID");
    }
  };

  const handleLanguageChange = (language: UserSession["language"]) => {
    if (!session) return;
    setLanguage(language);

    const updatedSession: UserSession = {
      ...session,
      language,
    };

    localStorage.setItem("safelink_session", JSON.stringify(updatedSession));

    setSession(updatedSession);
    setShowLanguageMenu(false);
  };

  const handleOpenChat = () => {
    if (!session || !selectedAdvisor) return;

    localStorage.setItem(
      `safelink_selected_advisor_${session.safelink_id}`,
      selectedAdvisor,
    );

    navigate("/user/dashboard/chat");
  };

  const handleChangeAdvisor = () => {
    navigate("/user/dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("safelink_session");
    navigate("/login");
  };

  if (!session) {
    return null;
  }

  const formattedDate = new Date(session.created_at).toLocaleDateString(
    activeLanguage === "am" ? "am-ET" : activeLanguage === "om" ? "om-ET" : "en",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <div className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      {/* Header */}
      <header className="border-b border-[#DDE8DC] bg-white/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              {t("profile.account")}
            </p>

            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              {t("profile.title")}
            </h1>
          </div>

          <button
            onClick={() => navigate("/user/dashboard")}
            className="rounded-lg border border-[#BFD5C2] bg-white px-4 py-2 text-sm font-medium text-[#176B3A] transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3]"
          >
            {t("common.dashboard")}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Profile introduction */}
        <section className="relative overflow-hidden rounded-2xl border border-[#D7E5D7] bg-white">
          <div className="absolute left-0 top-0 h-full w-1 bg-[#2F8F4E]" />

          <div className="flex flex-col gap-6 px-7 py-7 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F1E3] text-xl font-semibold text-[#176B3A]">
                U
              </div>

              <div>
                <h2 className="text-xl font-semibold">{t("profile.user")}</h2>

                <div className="mt-1 flex items-center gap-2 text-sm text-[#607568]">
                  <span className="h-2 w-2 rounded-full bg-[#2F8F4E]" />
                  {t("profile.privateAccount")}
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <p className="text-xs text-[#607568]">{t("safeLinkId")}</p>

              <div className="mt-1 flex items-center gap-2 sm:justify-end">
                <span className="font-mono text-sm font-semibold">
                  {session.safelink_id}
                </span>

                <button
                  onClick={handleCopy}
                  title={t(copied ? "copied" : "copySafeLinkId")}
                  aria-label={
                    t(copied ? "sessionCreatedPage.copiedMessage" : "copySafeLinkId")
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#C9DCC9] text-[#2F8F4E] transition hover:bg-[#E7F1E3]"
                >
                  {copied ? "✓" : "⧉"}
                </button>
              </div>

              {copied && (
                <p className="mt-1 text-xs font-medium text-[#2F8F4E]">
                  {t("copied")}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Account information */}
        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              {t("profile.account")}
            </p>

            <h3 className="mt-1 text-lg font-semibold">{t("profile.accountInfo")}</h3>
          </div>

          <div className="overflow-hidden rounded-xl border border-[#DDE8DC] bg-white">
            <div className="grid grid-cols-1 gap-1 border-b border-[#DDE8DC] px-6 py-5 sm:grid-cols-2">
              <span className="text-sm text-[#607568]">{t("safeLinkId")}</span>

              <span className="font-mono text-sm font-medium sm:text-right">
                {session.safelink_id}
              </span>
            </div>

            {/* Language */}
            <div className="relative grid grid-cols-1 gap-2 px-6 py-5 sm:grid-cols-2">
              <span className="text-sm text-[#607568]">{t("profile.preferredLanguage")}</span>

              <div className="flex items-center gap-3 sm:justify-end">
                <span className="text-sm font-medium">
                  {t(`language.${activeLanguage}`)}
                </span>

                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="text-sm font-medium text-[#2F8F4E] hover:underline"
                >
                  {t("profile.change")}
                </button>
              </div>

              {showLanguageMenu && (
                <div className="absolute right-6 top-[70px] z-20 w-44 overflow-hidden rounded-lg border border-[#D5E3D5] bg-white shadow-lg">
                  {(["en", "am", "om"] as UserSession["language"][]).map(
                    (language) => (
                      <button
                        key={language}
                        onClick={() => handleLanguageChange(language)}
                        className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-[#E7F1E3] ${
                          activeLanguage === language
                            ? "font-semibold text-[#2F8F4E]"
                            : "text-[#173B28]"
                        }`}
                      >
                        {t(`language.${language}`)}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-1 border-t border-[#DDE8DC] px-6 py-5 sm:grid-cols-2">
              <span className="text-sm text-[#607568]">{t("profile.accountType")}</span>

              <span className="text-sm font-medium sm:text-right">{t("profile.user")}</span>
            </div>

            <div className="grid grid-cols-1 gap-1 border-t border-[#DDE8DC] px-6 py-5 sm:grid-cols-2">
              <span className="text-sm text-[#607568]">{t("profile.created")}</span>

              <span className="text-sm font-medium sm:text-right">
                {formattedDate}
              </span>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              {t("profile.support")}
            </p>

            <h3 className="mt-1 text-lg font-semibold">{t("profile.yourAdvisor")}</h3>
          </div>

          {selectedAdvisor ? (
            <div className="rounded-xl border border-[#DDE8DC] bg-white px-6 py-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E7F1E3] text-lg font-semibold text-[#176B3A]">
                    {advisorInfo[selectedAdvisor].symbol}
                  </div>

                  <div>
                    <h4 className="font-semibold">
                      {t(advisorInfo[selectedAdvisor].title)}
                    </h4>

                    <p className="mt-1 text-sm text-[#607568]">
                      {t(advisorInfo[selectedAdvisor].description)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleChangeAdvisor}
                    className="rounded-lg border border-[#BFD5C2] px-4 py-2.5 text-sm font-medium text-[#176B3A] transition hover:bg-[#E7F1E3]"
                  >
                    {t("profile.changeAdvisor")}
                  </button>

                  <button
                    onClick={handleOpenChat}
                    className="rounded-lg bg-[#2F8F4E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#176B3A]"
                  >
                    {t("profile.openChat")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#DDE8DC] bg-white px-6 py-6">
              <p className="text-sm text-[#607568]">
                {t("profile.noAdvisor")}
              </p>

              <button
                onClick={() => navigate("/user/dashboard")}
                className="mt-4 text-sm font-semibold text-[#2F8F4E] hover:underline"
              >
                {t("profile.findAdvisor")}
              </button>
            </div>
          )}
        </section>

        {/* Session security */}
        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              {t("profile.security")}
            </p>

            <h3 className="mt-1 text-lg font-semibold">{t("profile.sessionSecurity")}</h3>
          </div>

          <div className="flex items-start gap-4 rounded-xl border border-[#CFE2D1] bg-[#E7F1E3]/60 px-6 py-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#2F8F4E] shadow-sm">
              ✓
            </div>

            <div>
              <p className="text-sm font-semibold text-[#176B3A]">
                {t("profile.sessionActive")}
              </p>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#607568]">
                {t("profile.sessionActiveDescription")}
              </p>
            </div>
          </div>
        </section>

        {/* Privacy */}
        <section className="mt-10 border-t border-[#DDE8DC] pt-8">
          <div className="flex items-start gap-4">
            

            <div>
              <h3 className="text-sm font-semibold">
                {t("profile.keepIdPrivate")}
              </h3>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#607568]">
                {t("profile.idWarning")}
              </p>
            </div>
          </div>
        </section>

        {/* Logout */}
        <div className="mt-8 border-t border-[#DDE8DC] pt-6">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 transition hover:text-red-700 hover:underline"
          >
            {t("common.logOut")}
          </button>
        </div>
      </main>
    </div>
  );
}

export default UserProfile;
