
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuickExit from "../components/QuickExit";
import {
  getUserConversation,
  type AdvisorType,
  type Conversation,
} from "../api/conversationApi";

const advisorTypes: {
  type: AdvisorType;
  title: string;
  description: string;
  icon: string;
  style: string;
  iconStyle: string;
}[] = [
  {
    type: "medical",
    title: "Medical",
    description: "Health and medical support",
    icon: "♡",
    style: "bg-[#e9f8f5] border-[#d2eee8]",
    iconStyle: "bg-[#08a6a3] text-white",
  },
  {
    type: "legal",
    title: "Legal",
    description: "Rights and legal guidance",
    icon: "⚖",
    style: "bg-[#f3f1fb] border-[#e5e0f5]",
    iconStyle: "bg-[#8b78cf] text-white",
  },
  {
    type: "psychological",
    title: "Emotional",
    description: "Emotional and psychological support",
    icon: "♡",
    style: "bg-[#fdf1f5] border-[#f3dfe8]",
    iconStyle: "bg-[#e78bad] text-white",
  },
  {
    type: "general",
    title: "General",
    description: "Talk about your situation",
    icon: "▱",
    style: "bg-[#edf6fc] border-[#dcebf6]",
    iconStyle: "bg-[#4d9cdd] text-white",
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [loadingConversation, setLoadingConversation] =
    useState(true);

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  useEffect(() => {
    const savedSession =
      localStorage.getItem("safelink_session");

    if (!savedSession) {
      setLoadingConversation(false);
      return;
    }

    try {
      const parsedSession = JSON.parse(savedSession);

      if (parsedSession?.safelink_id) {
        setSessionId(parsedSession.safelink_id);
      }
    } catch (error) {
      console.error(
        "Unable to read saved session:",
        error,
      );
    }

    setLoadingConversation(false);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const loadConversation = async () => {
      setLoadingConversation(true);

      try {
        const result =
          await getUserConversation(sessionId);

        setConversation(result);
      } catch (error) {
        console.error(
          "Unable to load conversation:",
          error,
        );

        setConversation(null);
      } finally {
        setLoadingConversation(false);
      }
    };

    loadConversation();
  }, [sessionId]);

  const lastMessage =
    conversation?.messages
      ?.filter((message) => !message.deleted)
      .slice(-1)[0] ?? null;

  const openChat = () => {
    navigate("/user/dashboard/chat");
  };

  const openAwareness = () => {
    navigate("/awareness");
  };

  const openSupport = () => {
    navigate("/support");
  };

  const openInformation = () => {
    navigate("/information");
  };

  if (!sessionId) {
    return (
      <main className="min-h-screen bg-[#f8fbfa] flex items-center justify-center px-6 text-[#0b4964]">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#dff3ef] flex items-center justify-center text-3xl">
            🔒
          </div>

          <h1 className="text-3xl font-bold mt-6">
            Your private space
          </h1>

          <p className="text-[#6b858e] mt-3 leading-relaxed">
            We couldn't find your SafeLink session.
            Start a private session to access your
            support space.
          </p>

          <button
            type="button"
            onClick={() => navigate("/create")}
            className="mt-7 w-full rounded-full bg-[#079b9d] px-6 py-3.5 text-white font-semibold hover:bg-[#07898b] transition"
          >
            Start a Private Session
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-3 w-full rounded-full border border-[#dce8e5] bg-white px-6 py-3.5 text-[#0b4964] font-semibold hover:bg-[#f4f8f7] transition"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbfcfc] text-[#0b4964]">
      <div className="flex min-h-screen">

        {/* =====================================================
            SIDEBAR
        ====================================================== */}

        <aside className="hidden lg:flex w-[255px] shrink-0 bg-white border-r border-[#e4ecea] flex-col">

          {/* Logo */}
          <div className="px-6 pt-7 pb-8">
            <button
              type="button"
              onClick={() =>
                navigate("/user/dashboard")
              }
              className="flex items-center gap-3"
            >
              <div className="relative w-[46px] h-[46px] rounded-full bg-gradient-to-br from-[#0b9fa0] to-[#2da987] flex items-center justify-center">
                <span className="text-white text-[28px] leading-none">
                  ♡
                </span>
              </div>

              <div className="text-left">
                <p className="text-[22px] leading-none font-bold text-[#0b4964]">
                  SafeLink
                </p>

                <p className="text-[9px] tracking-[0.25em] text-[#16a38b] font-bold mt-1">
                  PRIVATE SUPPORT
                </p>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="px-4 flex-1">

            <p className="px-4 mb-3 text-[10px] uppercase tracking-[0.18em] font-bold text-[#9aaeb4]">
              Your space
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/user/dashboard")
              }
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-[#e6f6f2] text-[#078f91] font-semibold text-sm"
            >
              <span className="text-xl">
                ⌂
              </span>

              Dashboard
            </button>

            <button
              type="button"
              onClick={openChat}
              className="w-full flex items-center gap-4 px-4 py-3.5 mt-1 rounded-xl text-[#496873] hover:bg-[#f4f8f7] hover:text-[#078f91] transition text-sm"
            >
              <span className="text-xl">
                ▢
              </span>

              Advisor Chat
            </button>

            <button
              type="button"
              onClick={openAwareness}
              className="w-full flex items-center gap-4 px-4 py-3.5 mt-1 rounded-xl text-[#496873] hover:bg-[#f4f8f7] hover:text-[#078f91] transition text-sm"
            >
              <span className="text-xl">
                ◇
              </span>

              Awareness
            </button>

            <button
              type="button"
              onClick={openSupport}
              className="w-full flex items-center gap-4 px-4 py-3.5 mt-1 rounded-xl text-[#496873] hover:bg-[#f4f8f7] hover:text-[#078f91] transition text-sm"
            >
              <span className="text-xl">
                ♢
              </span>

              Private Support
            </button>

            <button
              type="button"
              onClick={openInformation}
              className="w-full flex items-center gap-4 px-4 py-3.5 mt-1 rounded-xl text-[#496873] hover:bg-[#f4f8f7] hover:text-[#078f91] transition text-sm"
            >
              <span className="text-xl">
                ⓘ
              </span>

              Information
            </button>
          </nav>

          {/* Sidebar bottom */}
          <div className="px-5 pb-6">

            <div className="rounded-2xl bg-[#eaf8f5] border border-[#d6eee8] p-4">
              <div className="flex items-center gap-2">

                <span className="w-2 h-2 rounded-full bg-[#1eae83]" />

                <span className="text-xs font-semibold text-[#347466]">
                  Private session active
                </span>
              </div>

              <p className="text-[11px] text-[#718b91] mt-2 leading-relaxed">
                Your support space is private and connected
                to your SafeLink session.
              </p>
            </div>

            <div className="mt-4">
              <QuickExit />
            </div>

            <div className="text-center mt-8">
              <p className="text-[9px] tracking-[0.22em] text-[#9aafb3] uppercase">
                You are not alone
              </p>

              <p className="text-xl text-[#079b9d] mt-2">
                ♡
              </p>
            </div>
          </div>
        </aside>

        {/* =====================================================
            MAIN
        ====================================================== */}

        <div className="flex-1 min-w-0">

          {/* Mobile header */}
          <header className="lg:hidden bg-white border-b border-[#e4ecea] px-5 py-4">
            <div className="flex items-center justify-between">

              <button
                type="button"
                onClick={() =>
                  navigate("/user/dashboard")
                }
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0b9fa0] to-[#2da987] flex items-center justify-center">
                  <span className="text-white text-xl">
                    ♡
                  </span>
                </div>

                <div className="text-left">
                  <p className="font-bold">
                    SafeLink
                  </p>

                  <p className="text-[8px] tracking-[0.2em] text-[#16a38b] font-bold">
                    PRIVATE SUPPORT
                  </p>
                </div>
              </button>

              <QuickExit />
            </div>
          </header>

          <div className="max-w-[1320px] mx-auto px-5 sm:px-7 lg:px-9 py-7">

            {/* =================================================
                TOP
            ================================================== */}

            <div className="flex items-center justify-between mb-6">

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] font-bold text-[#079b9d]">
                  Private support space
                </p>

                <h1 className="text-[30px] font-bold text-[#0b4964] mt-1">
                  Welcome back
                </h1>
              </div>

              <div className="hidden sm:flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-[#e2f3ef] flex items-center justify-center">
                  🔒
                </div>

                <div>
                  <p className="text-xs font-semibold text-[#315d6b]">
                    Your SafeLink
                  </p>

                  <p className="text-[11px] text-[#16a38b]">
                    Private & secure
                  </p>
                </div>

                <span className="text-[#78939b]">
                 ⌄
                </span>
              </div>
            </div>

            {/* =================================================
                HERO
            ================================================== */}

            <section className="relative overflow-hidden rounded-[18px] bg-[#dff4f2] border border-[#cdeae6] mb-7">

              <div className="grid lg:grid-cols-[1fr_0.9fr] min-h-[305px]">

                {/* Hero copy */}
                <div className="relative z-20 p-7 md:p-9 lg:p-10 flex flex-col justify-center">

                  <p className="text-[11px] uppercase tracking-[0.22em] font-bold text-[#079b9d]">
                    Private support space
                  </p>

                  <h2 className="text-[38px] md:text-[43px] leading-[1.05] font-bold text-[#0b4964] mt-3">
                    You are not alone.
                  </h2>

                  <p className="text-[15px] text-[#326b7d] mt-4 max-w-[570px] leading-[1.65]">
                    SafeLink is here to support you. Talk to
                    an advisor, learn about your rights, or
                    explore resources that can help you move
                    forward.
                  </p>

                  <div>
                    <button
                      type="button"
                      onClick={openChat}
                      className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#079b9d] px-7 py-3 text-sm font-bold text-white hover:bg-[#07888a] transition"
                    >
                      Talk to an advisor

                      <span className="text-lg">
                        →
                      </span>
                    </button>
                  </div>
                </div>

                {/* Future hero image area */}
                <div className="relative min-h-[250px] lg:min-h-0 overflow-hidden">

                  {/* Soft background shapes */}
                  <div className="absolute w-[290px] h-[290px] rounded-full bg-[#c7ebe5] -right-12 -top-16" />

                  <div className="absolute w-[180px] h-[180px] rounded-full bg-[#b9e3dc]/60 right-[35%] bottom-[-80px]" />

                  {/* Image will be placed here later */}
                  <div className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-8">

                    <div className="relative w-[280px] h-[260px]">

                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[230px] h-[210px] rounded-[50%] bg-[#c7ebe5]" />

                      <div className="absolute top-5 left-1/2 -translate-x-1/2 text-center">

                        <div className="w-24 h-24 rounded-full bg-[#b2ded7] flex items-center justify-center">
                          <span className="text-5xl">
                            ♡
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-[#167a7c] mt-4">
                          A safe space to talk
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                TWO COLUMN CONTENT
            ================================================== */}

            <div className="grid xl:grid-cols-[1fr_325px] gap-7">

              {/* MAIN COLUMN */}
              <div className="min-w-0">

                {/* Support */}
                <section>

                  <div className="mb-4">
                    <h2 className="text-[25px] font-bold text-[#0b4964]">
                      What do you need help with?
                    </h2>

                    <p className="text-sm text-[#70888f] mt-1">
                      Choose a category to connect with the
                      right advisor.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">

                    {advisorTypes.map(
                      (advisor) => (
                        <button
                          key={advisor.type}
                          type="button"
                          onClick={openChat}
                          className={`group text-left rounded-[13px] border p-5 ${advisor.style} hover:-translate-y-0.5 hover:shadow-md transition`}
                        >
                          <div className="flex items-start justify-between">

                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${advisor.iconStyle}`}
                            >
                              {advisor.icon}
                            </div>

                            <span className="text-[#079b9d] opacity-0 group-hover:opacity-100 transition text-xl">
                              →
                            </span>
                          </div>

                          <h3 className="font-bold text-[16px] text-[#164f65] mt-5">
                            {advisor.title}
                          </h3>

                          <p className="text-[12px] text-[#70878e] mt-1 leading-relaxed">
                            {advisor.description}
                          </p>

                          <p className="text-[#079b9d] text-xl mt-4">
                            →
                          </p>
                        </button>
                      ),
                    )}

                  </div>
                </section>

                {/* Recent conversation */}
                <section className="mt-8">

                  <div className="flex items-end justify-between mb-3">

                    <div>
                      <h2 className="text-[24px] font-bold text-[#0b4964]">
                        Recent conversation
                      </h2>

                      <p className="text-sm text-[#70888f] mt-1">
                        Continue your latest chat or start a
                        new one.
                      </p>
                    </div>

                    {conversation && (
                      <button
                        type="button"
                        onClick={openChat}
                        className="hidden sm:block text-sm font-semibold text-[#079b9d] hover:underline"
                      >
                        Open chat →
                      </button>
                    )}
                  </div>

                  {loadingConversation ? (
                    <div className="bg-white border border-[#e1eae7] rounded-[13px] p-5 animate-pulse">
                      <div className="flex gap-4">

                        <div className="w-12 h-12 rounded-full bg-[#edf2f1]" />

                        <div className="flex-1">
                          <div className="h-4 bg-[#edf2f1] rounded w-40" />

                          <div className="h-3 bg-[#edf2f1] rounded w-3/4 mt-3" />
                        </div>
                      </div>
                    </div>
                  ) : conversation ? (
                    <button
                      type="button"
                      onClick={openChat}
                      className="w-full text-left bg-white border border-[#e1eae7] rounded-[13px] p-5 hover:border-[#9dd5c9] hover:shadow-sm transition"
                    >
                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 shrink-0 rounded-full bg-[#e4f5f1] flex items-center justify-center text-xl text-[#079b9d]">
                          ▱
                        </div>

                        <div className="flex-1 min-w-0">

                          <div className="flex items-center justify-between gap-4">

                            <h3 className="font-bold text-[#164f65] capitalize">
                              {conversation.advisor_type} Advisor
                            </h3>

                            <span className="text-[11px] text-[#9aabb0] shrink-0">
                              {new Date(
                                conversation.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <p className="text-sm text-[#72888f] mt-1 truncate">
                            {lastMessage
                              ? lastMessage.text
                              : "Your conversation is ready. Start chatting with your advisor."}
                          </p>
                        </div>

                        <span className="text-xl text-[#079b9d]">
                          →
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="bg-white border border-[#e1eae7] rounded-[13px] p-5">

                      <div className="flex items-center gap-4">

                        <div className="w-12 h-12 rounded-full bg-[#e4f5f1] flex items-center justify-center text-xl">
                          ▱
                        </div>

                        <div className="flex-1">

                          <h3 className="font-bold text-[#164f65]">
                            No conversation yet
                          </h3>

                          <p className="text-sm text-[#72888f] mt-1">
                            Choose an advisor above whenever
                            you're ready.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={openChat}
                          className="hidden sm:block text-sm font-semibold text-[#079b9d]"
                        >
                          Start →
                        </button>
                      </div>
                    </div>
                  )}

                  {conversation && (
                    <button
                      type="button"
                      onClick={openChat}
                      className="w-full mt-2 py-3 rounded-[10px] bg-[#e8f7f4] text-[#07888a] text-sm font-semibold hover:bg-[#dff2ee] transition"
                    >
                      View all conversations →
                    </button>
                  )}
                </section>
              </div>

              {/* =================================================
                  RIGHT COLUMN
              ================================================== */}

              <aside className="space-y-4">

                {/* Session */}
                <div className="bg-[#effaf8] border border-[#d8eee9] rounded-[13px] p-5">

                  <div className="flex items-start gap-4">

                    <div className="w-11 h-11 rounded-full bg-[#d8f1ec] flex items-center justify-center">
                      🔒
                    </div>

                    <div>
                      <h3 className="font-bold text-[18px] text-[#0b4964]">
                        Your session
                      </h3>

                      <p className="text-sm text-[#71878e] mt-1 leading-relaxed">
                        Your SafeLink session is active and
                        private.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Safety */}
                <div className="bg-[#075c72] rounded-[13px] p-6 text-white">

                  <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-xl">
                    🛡
                  </div>

                  <h3 className="font-bold text-[20px] mt-5">
                    Your safety matters
                  </h3>

                  <p className="text-sm text-white/70 mt-2 leading-relaxed">
                    Use Quick Exit whenever you need to
                    leave SafeLink quickly.
                  </p>

                  <div className="mt-5">
                    <QuickExit />
                  </div>
                </div>

                {/* Resources */}
                <div className="bg-white border border-[#e1eae7] rounded-[13px] overflow-hidden">

                  <div className="px-5 py-4 border-b border-[#e8efed]">
                    <h3 className="font-bold text-[#164f65]">
                      Resources
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={openAwareness}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#f8fbfa] transition border-b border-[#edf1ef]"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#e4f5f1] flex items-center justify-center">
                      📖
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#164f65]">
                        Awareness
                      </p>

                      <p className="text-xs text-[#8a9ba0] mt-1">
                        Safety and rights information
                      </p>
                    </div>

                    <span className="text-[#079b9d] text-lg">
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={openInformation}
                    className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#f8fbfa] transition"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#e4f5f1] flex items-center justify-center">
                      ⓘ
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#164f65]">
                        About SafeLink
                      </p>

                      <p className="text-xs text-[#8a9ba0] mt-1">
                        Learn about our support
                      </p>
                    </div>

                    <span className="text-[#079b9d] text-lg">
                      →
                    </span>
                  </button>
                </div>

                {/* Encouragement */}
                <div className="relative overflow-hidden bg-[#e7f7f4] rounded-[13px] p-6 min-h-[125px]">

                  <div className="relative z-10">
                    <p className="text-[#0b4964] text-[16px] font-semibold leading-relaxed max-w-[220px]">
                      Small steps are still progress.
                    </p>

                    <p className="text-sm text-[#5d8584] mt-2">
                      You're doing the right thing.
                    </p>
                  </div>

                  <div className="absolute right-5 bottom-[-12px] text-[75px] leading-none text-[#a2ddd4] opacity-60">
                    ♡
                  </div>
                </div>
              </aside>
            </div>

            {/* =================================================
                FOOTER
            ================================================== */}

            <footer className="mt-8 pt-5 border-t border-[#e2ebe7] flex flex-col sm:flex-row justify-between gap-3 text-xs text-[#8b9da1]">

              <div className="flex gap-3">
                <span>SafeLink</span>
                <span>•</span>
                <span>Private Support</span>
              </div>

              <p>
                SafeLink does not replace emergency services
                or qualified professionals.
              </p>
            </footer>

          </div>
        </div>
      </div>
    </main>
  );
}

