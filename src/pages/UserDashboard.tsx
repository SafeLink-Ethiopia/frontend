import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  Heart,
  Info,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Scale,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import QuickExit from "../components/QuickExit";

import {
  getUserConversations,
  type AdvisorType,
  type Conversation,
} from "../api/conversationApi";

/*
  SafeLink Dashboard
  ------------------------------------------------------------
  #FAFBF7  mist      - page background
  #E7F1E3  mint      - soft surfaces
  #2F8F4E  green     - actions / accents
  #176B3A  forest    - dark green surfaces
  #173B28  ink       - main text
*/

const advisorTypes: {
  type: AdvisorType;
  title: string;
  description: string;
  icon: typeof Heart;
}[] = [
  {
    type: "medical",
    title: "Medical",
    description: "Health and medical support",
    icon: Heart,
  },
  {
    type: "legal",
    title: "Legal",
    description: "Rights and legal guidance",
    icon: Scale,
  },
  {
    type: "psychological",
    title: "Emotional",
    description: "Emotional and psychological support",
    icon: MessageCircle,
  },
  {
    type: "general",
    title: "General",
    description: "Talk about your situation",
    icon: MessageCircle,
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const menuCloseRef = useRef<HTMLButtonElement>(null);
  const wasMobileMenuOpen = useRef(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [loadingConversation, setLoadingConversation] = useState(true);

  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!mobileMenuOpen) {
      if (wasMobileMenuOpen.current) {
        wasMobileMenuOpen.current = false;
        menuTriggerRef.current?.focus();
      }
      return;
    }

    wasMobileMenuOpen.current = true;
    menuCloseRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  /* ======================================================================== */
  /* LOAD SAVED SESSION                                                       */
  /* ======================================================================== */

  useEffect(() => {
    const savedSession = localStorage.getItem("safelink_session");

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
      console.error("Unable to read saved session:", error);
    }

    setLoadingConversation(false);
  }, []);

  /* ======================================================================== */
  /* LOAD CONVERSATIONS                                                       */
  /* ======================================================================== */

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const loadConversations = async () => {
      setLoadingConversation(true);

      try {
        const result = await getUserConversations(sessionId);

        setConversations(result);
      } catch (error) {
        console.error("Unable to load conversations:", error);

        setConversations([]);
      } finally {
        setLoadingConversation(false);
      }
    };

    loadConversations();
  }, [sessionId]);

  /* ======================================================================== */
  /* OPEN CHAT                                                                 */
  /* ======================================================================== */

  const openChat = (advisorType: AdvisorType = "general") => {
    closeMobileMenu();

    if (sessionId) {
      localStorage.setItem(
        `safelink_selected_advisor_${sessionId}`,
        advisorType,
      );
    }

    navigate("/user/dashboard/chat");
  };

  const logout = () => {
    localStorage.removeItem("safelink_session");

    if (sessionId) {
      localStorage.removeItem(`safelink_selected_advisor_${sessionId}`);
    }

    setSessionId(null);
    setConversations([]);
    closeMobileMenu();
    navigate("/login", { replace: true });
  };

  /* ======================================================================== */
  /* RESOURCES                                                                 */
  /* ======================================================================== */

  const openAwareness = () => {
    closeMobileMenu();
    navigate("/awareness");
  };

  const openInformation = () => {
    closeMobileMenu();
    navigate("/information");
  };

  /* ======================================================================== */
  /* FIND CONVERSATION                                                        */
  /* ======================================================================== */

  const getConversationForAdvisor = (
    advisorType: AdvisorType,
  ): Conversation | null => {
    return (
      conversations.find(
        (conversation) => conversation.advisor_type === advisorType,
      ) ?? null
    );
  };

  /* ======================================================================== */
  /* UNREAD                                                                    */
  /* ======================================================================== */

  const hasUnreadAdvisorMessage = (
    conversation: Conversation | null,
  ): boolean => {
    if (!conversation) {
      return false;
    }

    return conversation.messages.some(
      (message) =>
        message.sender === "advisor" && !message.deleted && !message.seen_at,
    );
  };

  const totalUnreadMessages = conversations.reduce((total, conversation) => {
    return (
      total +
      conversation.messages.filter(
        (message) =>
          message.sender === "advisor" && !message.deleted && !message.seen_at,
      ).length
    );
  }, 0);

  /* ======================================================================== */
  /* RECENT CONVERSATIONS                                                      */
  /* ======================================================================== */

  const recentConversations = [...conversations]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 3);

  /* ======================================================================== */
  /* NO SESSION                                                                */
  /* ======================================================================== */

  if (!sessionId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFBF7] px-6 text-[#173B28]">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F1E3]">
            <Lock size={28} strokeWidth={1.8} className="text-[#2F8F4E]" />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-[#176B3A]">
            Your private space
          </h1>

          <p className="mt-3 leading-7 text-[#173B28]/60">
            We couldn't find your SafeLink session. Start a private session to
            access your support space.
          </p>

          <button
            type="button"
            onClick={() => navigate("/create")}
            className="mt-7 w-full rounded-xl bg-[#2F8F4E] px-6 py-3.5 font-semibold text-white transition hover:bg-[#176B3A]"
          >
            Start a Private Session
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-3 w-full rounded-xl border border-[#D9E6D5] bg-white px-6 py-3.5 font-semibold text-[#173B28] transition hover:bg-[#E7F1E3]"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  /* ======================================================================== */
  /* DASHBOARD                                                                */
  /* ======================================================================== */

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="flex min-h-screen">
        {/* ================================================================== */}
        {/* SIDEBAR                                                             */}
        {/* ================================================================== */}

        <aside
          id="user-dashboard-sidebar"
          aria-label="Dashboard navigation"
          className={`${
            mobileMenuOpen
              ? "fixed inset-y-0 left-0 z-50 flex w-[min(85vw,280px)] shadow-xl lg:z-30 lg:w-[230px] lg:shadow-none"
              : "fixed inset-y-0 left-0 z-30 hidden w-[230px] lg:flex"
          } shrink-0 flex-col overflow-y-auto border-r border-[#DCE8D9] bg-white`}
        >
          {/* Logo */}
          <div className="flex items-center justify-between px-5 pb-7 pt-7">
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                navigate("/user/dashboard");
              }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center">
                <img
                  src="/safelink-logo.png"
                  alt="SafeLink logo"
                  className="w-10 h-auto object-contain"
                />
              </div>
              {/* <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2F8F4E]">
                <ShieldCheck
                  size={21}
                  strokeWidth={2}
                  className="text-white"
                />
              </div> */}

              <div className="text-left">
                <p className="text-[19px] font-bold leading-none text-[#173B28]">
                  SafeLink
                </p>

                <p className="mt-1 text-[8px] font-semibold tracking-[0.18em] text-[#7B8F82]">
                  PRIVATE SUPPORT
                </p>
              </div>
            </button>

            <button
              type="button"
              ref={menuCloseRef}
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
              className="rounded-lg p-2 text-[#607568] transition hover:bg-[#F4F7F2] hover:text-[#173B28] lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A9A90]">
              Your space
            </p>

            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                navigate("/user/dashboard");
              }}
              className="flex w-full items-center gap-3 rounded-xl bg-[#E7F1E3] px-3 py-3 text-sm font-semibold text-[#176B3A]"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                navigate("/user/profile");
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#607568] transition hover:bg-[#F4F7F2] hover:text-[#173B28]"
            >
              <User size={18} />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => openChat("general")}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#607568] transition hover:bg-[#F4F7F2] hover:text-[#173B28]"
            >
              <MessageCircle size={18} />

              <span className="flex-1 text-left">Advisor Chat</span>

              {totalUnreadMessages > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2F8F4E] px-1.5 text-[9px] font-bold text-white">
                  {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={openAwareness}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#607568] transition hover:bg-[#F4F7F2] hover:text-[#173B28]"
            >
              <BookOpen size={18} />
              <span>Awareness</span>
            </button>

            <button
              type="button"
              onClick={openInformation}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#607568] transition hover:bg-[#F4F7F2] hover:text-[#173B28]"
            >
              <Info size={18} />
              <span>Information</span>
            </button>
          </nav>

          {/* Sidebar bottom */}
          <div className="px-4 pb-6">
            {/* <div className="rounded-xl border border-[#D5E5D0] bg-[#E7F1E3] p-4">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[#2F8F4E]" />

                <span className="text-xs font-semibold text-[#176B3A]">
                  Private session active
                </span>

              </div>

              <p className="mt-2 text-[11px] leading-5 text-[#607568]">
                Your support space is private.
              </p>

            </div> */}

            <div className="mt-4">
              <QuickExit />
            </div>

            <button
              type="button"
              onClick={logout}
              className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[#DCE8D9] px-3 py-3 text-sm font-semibold text-[#607568] transition hover:border-[#AFCDAF] hover:bg-[#F4F7F2] hover:text-[#173B28] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2"
            >
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* ================================================================== */}
        {/* MAIN AREA                                                           */}
        {/* ================================================================== */}

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMobileMenu}
            className="fixed inset-0 z-40 bg-[#173B28]/35 lg:hidden"
          />
        )}

        <div className="min-w-0 flex-1 lg:ml-[230px]">
          {/* Mobile header */}
          <header className="border-b border-[#DCE8D9] bg-white px-4 py-4 sm:px-5 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  ref={menuTriggerRef}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="user-dashboard-sidebar"
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-lg p-2 text-[#176B3A] transition hover:bg-[#F4F7F2]"
                >
                  <Menu size={22} />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/user/dashboard")}
                  className="flex min-w-0 items-center gap-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2F8F4E]">
                    <ShieldCheck size={19} className="text-white" />
                  </div>

                  <div className="text-left">
                    <p className="font-bold text-[#173B28]">SafeLink</p>

                    <p className="text-[7px] font-semibold tracking-[0.18em] text-[#7B8F82]">
                      PRIVATE SUPPORT
                    </p>
                  </div>
                </button>
              </div>

              <div className="shrink-0">
                <QuickExit />
              </div>
            </div>
          </header>

          {/* ================================================================ */}
          {/* CONTENT                                                           */}
          {/* ================================================================ */}

          <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-7 sm:py-7 lg:px-9 lg:py-9">
            {/* ============================================================= */}
            {/* DASHBOARD HEADER                                                */}
            {/* ============================================================= */}

            <header className="mb-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-start gap-4">
                  {/* <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#DCE8D9] bg-white p-2.5 shadow-sm sm:flex">
                    <img
                      src="/safelink-logo.png"
                      alt="SafeLink logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div> */}

                  <div>
                    {/* <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7B8F82]">
                      Private support
                    </p> */}

                    <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#173B28] sm:text-[36px]">
                      Welcome back
                    </h1>

                    <p className="mt-2 text-[#607568]">
                      What would you like help with today?
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {totalUnreadMessages > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE0CB] bg-white px-3 py-1.5 text-xs font-semibold text-[#176B3A]">
                      <span className="h-2 w-2 rounded-full bg-[#2F8F4E]" />
                      {totalUnreadMessages}{" "}
                      {totalUnreadMessages === 1
                        ? "new message"
                        : "new messages"}
                    </span>
                  )}

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE8D9] bg-white px-3 py-1.5 text-xs text-[#7B8F82]">
                    <Lock size={14} />
                    <span>Private session</span>
                  </div>
                </div>
              </div>
            </header>

            {/* ============================================================= */}
            {/* PRIMARY SUPPORT AREA                                            */}
            {/* ============================================================= */}

            <section className="mb-9 overflow-hidden rounded-[1.5rem] border border-[#D5E5D1] bg-[#E7F1E3] sm:rounded-[2rem]">
              <div className="flex flex-col gap-7 px-5 py-6 sm:px-8 sm:py-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-2 text-[#2F8F4E]">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm">
                      <MessageCircle size={18} strokeWidth={1.8} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.16em]">
                      A safe place to start
                    </span>
                  </div>

                  <h2 className="mt-4 text-[26px] font-bold leading-tight tracking-tight text-[#173B28] sm:text-[34px]">
                    You don't have to figure it out alone.
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#607568] sm:text-base">
                    Start a private conversation and choose the kind of support
                    that feels right for you. You can take things at your own
                    pace.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => openChat("general")}
                      className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#176B3A] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2F8F4E] hover:shadow-md"
                    >
                      <span>Start a private conversation</span>
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#607568]">
                      <Lock size={14} className="text-[#2F8F4E]" />
                      <span>Private and at your pace</span>
                    </div>
                  </div>
                </div>

                {/* <div className="hidden shrink-0 items-center justify-center md:flex md:pr-3">
                  <div className="flex h-36 w-36 items-center justify-center rounded-full border border-[#2F8F4E]/10 bg-white/35">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[#2F8F4E]/10 bg-white/70 shadow-sm">
                      <img
                        src="/safelink-logo.png"
                        alt="SafeLink"
                        className="h-14 w-14 object-contain"
                      />
                    </div>
                  </div>
                </div> */}
              </div>
            </section>

            {/* ============================================================= */}
            {/* SUPPORT OPTIONS                                                 */}
            {/* ============================================================= */}

            <section className="mb-9">
              <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-[23px] font-bold tracking-tight text-[#173B28]">
                    Choose your support
                  </h2>
                  <p className="mt-1 text-sm text-[#7B8F82]">
                    You can switch advisors whenever you need.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#DCE8D9] bg-white">
                {advisorTypes.map((advisor, index) => {
                  const conversation = getConversationForAdvisor(advisor.type);
                  const unread = hasUnreadAdvisorMessage(conversation);
                  const AdvisorIcon = advisor.icon;

                  return (
                    <button
                      key={advisor.type}
                      type="button"
                      onClick={() => openChat(advisor.type)}
                      className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#F5F8F3] ${
                        index < advisorTypes.length - 1
                          ? "border-b border-[#E4ECE2]"
                          : ""
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-[#2F8F4E] transition group-hover:bg-[#2F8F4E] group-hover:text-white">
                        <AdvisorIcon size={20} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#173B28]">
                            {advisor.title}
                          </h3>

                          {unread && (
                            <span className="rounded-full bg-[#E7F1E3] px-2 py-0.5 text-[10px] font-bold text-[#176B3A]">
                              New message
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-[#7B8F82]">
                          {advisor.description}
                        </p>
                      </div>

                      <ArrowRight
                        size={17}
                        className="shrink-0 text-[#2F8F4E] transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ============================================================= */}
            {/* RECENT CONVERSATIONS                                            */}
            {/* ============================================================= */}

            <section>
              <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-[23px] font-bold tracking-tight text-[#173B28]">
                    Recent conversations
                  </h2>
                  <p className="mt-1 text-sm text-[#7B8F82]">
                    Continue where you left off.
                  </p>
                </div>
              </div>

              {loadingConversation ? (
                <div className="rounded-2xl border border-[#DCE8D9] bg-white p-6">
                  <div className="flex items-center gap-3 text-sm text-[#7B8F82]">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#DCE8D9] border-t-[#2F8F4E]" />
                    Loading your conversations...
                  </div>
                </div>
              ) : recentConversations.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-[#DCE8D9] bg-white">
                  {recentConversations.map((conversation, index) => {
                    const advisor = advisorTypes.find(
                      (item) => item.type === conversation.advisor_type,
                    );

                    const lastMessage =
                      conversation.messages
                        ?.filter((message) => !message.deleted)
                        .slice(-1)[0] ?? null;

                    const unread = hasUnreadAdvisorMessage(conversation);
                    const AdvisorIcon = advisor?.icon ?? MessageCircle;

                    const advisorName =
                      conversation.advisor_type === "psychological"
                        ? "Emotional"
                        : conversation.advisor_type.charAt(0).toUpperCase() +
                          conversation.advisor_type.slice(1);

                    return (
                      <button
                        key={conversation.conversation_id}
                        type="button"
                        onClick={() => openChat(conversation.advisor_type)}
                        className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#F5F8F3] ${
                          index < recentConversations.length - 1
                            ? "border-b border-[#E4ECE2]"
                            : ""
                        }`}
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E3] text-[#2F8F4E]">
                          <AdvisorIcon size={20} strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold text-[#173B28]">
                              {advisorName} Advisor
                            </h3>

                            {unread && (
                              <span className="rounded-full bg-[#E7F1E3] px-2 py-0.5 text-[10px] font-bold text-[#176B3A]">
                                New
                              </span>
                            )}

                            <span className="ml-auto shrink-0 text-[10px] text-[#8B9A90]">
                              {new Date(
                                conversation.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>

                          <p
                            className={`mt-1 truncate text-sm ${
                              unread
                                ? "font-semibold text-[#176B3A]"
                                : "text-[#7B8F82]"
                            }`}
                          >
                            {unread
                              ? "Your advisor sent you a new message."
                              : lastMessage
                                ? lastMessage.text
                                : "Start chatting with your advisor."}
                          </p>
                        </div>

                        <ArrowRight
                          size={17}
                          className="shrink-0 text-[#2F8F4E] transition-transform group-hover:translate-x-1"
                        />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#DCE8D9] bg-white p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E3] text-[#2F8F4E]">
                      <MessageCircle size={20} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-[#173B28]">
                        No conversations yet
                      </h3>
                      <p className="mt-1 text-sm text-[#7B8F82]">
                        Choose an advisor above whenever you're ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* ============================================================= */}
            {/* SIMPLE RESOURCES                                                */}
            {/* ============================================================= */}

            <section className="mt-8 border-t border-[#DCE8D9] pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#173B28]">
                    Need more information?
                  </p>
                  <p className="mt-1 text-xs text-[#7B8F82]">
                    Explore SafeLink resources whenever you need them.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openAwareness}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DCE8D9] bg-white px-4 py-2.5 text-xs font-semibold text-[#173B28] transition hover:border-[#AFCDAF] hover:bg-[#F5F8F3]"
                  >
                    <BookOpen size={15} className="text-[#2F8F4E]" />
                    Awareness
                  </button>

                  <button
                    type="button"
                    onClick={openInformation}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DCE8D9] bg-white px-4 py-2.5 text-xs font-semibold text-[#173B28] transition hover:border-[#AFCDAF] hover:bg-[#F5F8F3]"
                  >
                    <Info size={15} className="text-[#2F8F4E]" />
                    About SafeLink
                  </button>
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* FOOTER                                                         */}
            {/* ============================================================= */}

            <footer className="mt-8 flex flex-col gap-2 border-t border-[#DCE8D9] pt-5 text-xs text-[#809287] sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <span>SafeLink</span>
                <span>•</span>
                <span>Private Support</span>
              </div>

              <p>
                SafeLink does not replace emergency services or qualified
                professionals.
              </p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}
