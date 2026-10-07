import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Language = "en" | "am" | "om";

interface UserSession {
  safelink_id: string;
  language: Language;
  created_at: string;
}

type AdvisorType =
  | "medical"
  | "legal"
  | "psychological"
  | "general";

const advisorInfo: Record<
  AdvisorType,
  {
    title: string;
    description: string;
    icon: string;
  }
> = {
  medical: {
    title: "Medical Advisor",
    description: "Medical and health support",
    icon: "⚕️",
  },
  legal: {
    title: "Legal Advisor",
    description: "Legal information and guidance",
    icon: "⚖️",
  },
  psychological: {
    title: "Psychological Advisor",
    description: "Emotional and psychological support",
    icon: "🧠",
  },
  general: {
    title: "General Advisor",
    description: "General support and guidance",
    icon: "💬",
  },
};

const languageNames: Record<Language, string> = {
  en: "English",
  am: "Amharic",
  om: "Afaan Oromo",
};

export default function UserProfile() {
  const navigate = useNavigate();

  const [session, setSession] = useState<UserSession | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] =
    useState<AdvisorType | null>(null);

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
    } catch (error) {
      console.error("Failed to load user profile:", error);
      navigate("/login");
    }
  }, [navigate]);

  const copySafeLinkId = async () => {
    if (!session?.safelink_id) return;

    try {
      await navigator.clipboard.writeText(session.safelink_id);
      alert("SafeLink ID copied!");
    } catch (error) {
      console.error("Failed to copy SafeLink ID:", error);
    }
  };

  const openAdvisorChat = () => {
    if (!session?.safelink_id || !selectedAdvisor) return;

    localStorage.setItem(
      `safelink_selected_advisor_${session.safelink_id}`,
      selectedAdvisor,
    );

    navigate("/user/dashboard/chat");
  };

  const logout = () => {
    localStorage.removeItem("safelink_session");
    navigate("/login");
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f5f6]">
        <p className="text-sm text-[#a79093]">Loading profile...</p>
      </div>
    );
  }

  const advisor = selectedAdvisor
    ? advisorInfo[selectedAdvisor]
    : null;

  const formattedDate = session.created_at
    ? new Date(session.created_at).toLocaleDateString()
    : "Not available";

  return (
    <div className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      {/* Header */}
      <header className="border-b border-[#a79093]/30 bg-[#f7f5f6]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <button
            onClick={() => navigate("/user/dashboard")}
            className="group flex items-center gap-2 text-sm font-medium text-[#a79093] transition hover:text-[#3e1919]"
          >
            <span className="text-lg transition-transform group-hover:-translate-x-1">
              ←
            </span>
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3e1919] text-lg text-[#f0e2d6]">
              🛡️
            </div>

            <span className="text-lg font-bold tracking-tight text-[#3e1919]">
              SafeLink
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
        {/* Page introduction */}
        <section className="border-b border-[#a79093]/30 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
            Account
          </p>

          <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#3e1919] sm:text-4xl">
                Your profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a79093] sm:text-base">
                Manage your SafeLink session, preferred language, and
                current support advisor from one private space.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="h-2 w-2 rounded-full bg-[#3e1919]" />
              <span className="text-sm font-medium text-[#3e1919]">
                Active session
              </span>
            </div>
          </div>
        </section>

        {/* Profile summary */}
        <section className="border-b border-[#a79093]/30 py-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#f0e2d6] text-4xl">
                👤
              </div>

              <div>
                <h2 className="text-xl font-bold text-[#3e1919]">
                  SafeLink User
                </h2>

                <p className="mt-1 font-mono text-sm tracking-wide text-[#a79093]">
                  {session.safelink_id}
                </p>

                <p className="mt-2 text-xs font-medium uppercase tracking-wider text-[#a79093]">
                  Private support account
                </p>
              </div>
            </div>

            <button
              onClick={copySafeLinkId}
              className="w-full border border-[#3e1919] px-5 py-3 text-sm font-semibold text-[#3e1919] transition hover:bg-[#3e1919] hover:text-[#f0e2d6] sm:w-auto"
            >
              Copy SafeLink ID
            </button>
          </div>
        </section>

        {/* Account information */}
        <section className="border-b border-[#a79093]/30 py-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                Account details
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#3e1919]">
                Your information
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#a79093]">
                Basic information connected to this SafeLink session.
              </p>
            </div>

            <div className="border-t border-[#a79093]/30">
              <div className="flex flex-col gap-2 border-b border-[#a79093]/20 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#a79093]">
                  SafeLink ID
                </span>

                <span className="font-mono text-sm font-semibold text-[#3e1919]">
                  {session.safelink_id}
                </span>
              </div>

              <div className="flex flex-col gap-2 border-b border-[#a79093]/20 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#a79093]">
                  Preferred Language
                </span>

                <span className="text-sm font-semibold text-[#3e1919]">
                  {languageNames[session.language] ||
                    session.language}
                </span>
              </div>

              <div className="flex flex-col gap-2 border-b border-[#a79093]/20 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#a79093]">
                  Account Type
                </span>

                <span className="text-sm font-semibold text-[#3e1919]">
                  User
                </span>
              </div>

              <div className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-[#a79093]">
                  Created
                </span>

                <span className="text-sm font-semibold text-[#3e1919]">
                  {formattedDate}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Selected Advisor */}
        <section className="border-b border-[#a79093]/30 py-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                Support
              </p>

              <h2 className="mt-2 text-xl font-bold text-[#3e1919]">
                Your advisor
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-[#a79093]">
                Your currently selected support advisor is available
                through your private conversation.
              </p>
            </div>

            <div>
              {advisor && selectedAdvisor ? (
                <div className="border border-[#a79093]/30 bg-[#f0e2d6]/60 p-5 sm:p-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#3e1919] text-2xl">
                      {advisor.icon}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-[#3e1919]">
                        {advisor.title}
                      </h3>

                      <p className="mt-1 text-sm text-[#a79093]">
                        {advisor.description}
                      </p>
                    </div>

                    <button
                      onClick={openAdvisorChat}
                      className="w-full bg-[#3e1919] px-5 py-3 text-sm font-semibold text-[#f0e2d6] transition hover:opacity-90 sm:w-auto"
                    >
                      Open Advisor Chat
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#a79093]/50 px-5 py-6">
                  <p className="text-sm text-[#a79093]">
                    You have not selected an advisor yet.
                  </p>

                  <button
                    onClick={() => navigate("/user/dashboard")}
                    className="mt-4 text-sm font-semibold text-[#3e1919] underline decoration-[#a79093] underline-offset-4 transition hover:decoration-[#3e1919]"
                  >
                    Choose an Advisor →
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Privacy & Safety */}
        <section className="py-10">
          <div className="border-l-4 border-[#3e1919] bg-[#f0e2d6] px-5 py-5 sm:px-6">
            <div className="flex gap-4">
              <div className="text-2xl">🔒</div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a79093]">
                  Privacy & Safety
                </p>

                <h2 className="mt-1 font-bold text-[#3e1919]">
                  Keep your SafeLink ID private
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#3e1919]/75">
                  Your SafeLink ID allows you to access support while
                  helping protect your identity. Keep your SafeLink ID
                  private and only share it when necessary.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Logout */}
        <div className="flex justify-center border-t border-[#a79093]/30 pt-8">
          <button
            onClick={logout}
            className="px-6 py-2.5 text-sm font-semibold text-[#a79093] transition hover:text-[#3e1919]"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}