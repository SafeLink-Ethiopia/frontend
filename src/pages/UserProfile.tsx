
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading profile...</p>
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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-teal-600"
          >
            <span>←</span>
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-lg text-white">
              🛡️
            </div>

            <span className="font-bold text-slate-900">
              SafeLink
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Profile Header */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-4xl">
              👤
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-slate-900">
                SafeLink User
              </h1>

              <p className="mt-1 font-mono text-sm text-slate-500">
                {session.safelink_id}
              </p>

              <div className="mt-3 flex justify-center sm:justify-start">
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  ● Active
                </span>
              </div>
            </div>

            <button
              onClick={copySafeLinkId}
              className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-100"
            >
              Copy SafeLink ID
            </button>
          </div>
        </section>

        {/* Account Information */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Account Information
          </h2>

          <div className="mt-5 divide-y divide-slate-100">
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-500">
                SafeLink ID
              </span>

              <span className="font-mono text-sm font-semibold text-slate-900">
                {session.safelink_id}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-500">
                Preferred Language
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {languageNames[session.language] ||
                  session.language}
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-500">
                Account Type
              </span>

              <span className="text-sm font-semibold text-slate-900">
                User
              </span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-slate-500">
                Created
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {formattedDate}
              </span>
            </div>
          </div>
        </section>

        {/* Selected Advisor */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Your Advisor
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your currently selected support advisor.
              </p>
            </div>
          </div>

          {advisor && selectedAdvisor ? (
            <div className="mt-5 flex flex-col gap-4 rounded-xl bg-slate-50 p-5 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-2xl">
                {advisor.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-slate-900">
                  {advisor.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {advisor.description}
                </p>
              </div>

              <button
                onClick={openAdvisorChat}
                className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                Open Advisor Chat
              </button>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                You have not selected an advisor yet.
              </p>

              <button
                onClick={() => navigate("/user/dashboard")}
                className="mt-3 text-sm font-semibold text-teal-600 hover:text-teal-700"
              >
                Choose an Advisor →
              </button>
            </div>
          )}
        </section>

        {/* Privacy */}
        <section className="mt-6 rounded-2xl border border-teal-100 bg-teal-50 p-6">
          <div className="flex gap-4">
            <div className="text-2xl">🔒</div>

            <div>
              <h2 className="font-bold text-teal-900">
                Privacy & Safety
              </h2>

              <p className="mt-2 text-sm leading-6 text-teal-800">
                Your SafeLink ID allows you to access support while
                helping protect your identity. Keep your SafeLink ID
                private and only share it when necessary.
              </p>
            </div>
          </div>
        </section>

        {/* Logout */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={logout}
            className="rounded-xl border border-red-200 bg-white px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      </main>
    </div>
  );
}

