import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  ArrowRight,
  BookOpen,
  Heart,
  Info,
  Lock,
  MessageCircle,
  Scale,
} from "lucide-react";

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
    title: "dashboard.medical",
    description: "dashboard.medicalDescription",
    icon: Heart,
  },
  {
    type: "legal",
    title: "dashboard.legal",
    description: "dashboard.legalDescription",
    icon: Scale,
  },
  {
    type: "psychological",
    title: "dashboard.emotional",
    description: "dashboard.emotionalDescription",
    icon: MessageCircle,
  },
  {
    type: "general",
    title: "dashboard.general",
    description: "dashboard.generalDescription",
    icon: MessageCircle,
  },
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [loadingConversation, setLoadingConversation] = useState(true);

  const [sessionId, setSessionId] = useState<string | null>(null);

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
    if (sessionId) {
      localStorage.setItem(
        `safelink_selected_advisor_${sessionId}`,
        advisorType,
      );
    }

    navigate("/user/dashboard/chat");
  };

  /* ======================================================================== */
  /* RESOURCES                                                                 */
  /* ======================================================================== */

  const openAwareness = () => {
    navigate("/awareness");
  };

  const openInformation = () => {
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
            {t("dashboard.privateSpace")}
          </h1>

          <p className="mt-3 leading-7 text-[#173B28]/60">
            {t("dashboard.sessionMissing")}
          </p>

          <button
            type="button"
            onClick={() => navigate("/create")}
            className="mt-7 w-full rounded-xl bg-[#2F8F4E] px-6 py-3.5 font-semibold text-white transition hover:bg-[#176B3A]"
          >
            {t("dashboard.startSession")}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-3 w-full rounded-xl border border-[#D9E6D5] bg-white px-6 py-3.5 font-semibold text-[#173B28] transition hover:bg-[#E7F1E3]"
          >
            {t("dashboard.backHome")}
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
      <div className="min-w-0">
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
                      {t("dashboard.welcome")}
                    </h1>

                    <p className="mt-2 text-[#607568]">
                      {t("dashboard.prompt")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {totalUnreadMessages > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#CFE0CB] bg-white px-3 py-1.5 text-xs font-semibold text-[#176B3A]">
                      <span className="h-2 w-2 rounded-full bg-[#2F8F4E]" />
                      {t("dashboard.newMessage", { count: totalUnreadMessages })}
                    </span>
                  )}

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE8D9] bg-white px-3 py-1.5 text-xs text-[#7B8F82]">
                    <Lock size={14} />
                    <span>{t("dashboard.privateSession")}</span>
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
                      {t("dashboard.safeStart")}
                    </span>
                  </div>

                  <h2 className="mt-4 text-[26px] font-bold leading-tight tracking-tight text-[#173B28] sm:text-[34px]">
                    {t("dashboard.reassurance")}
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-7 text-[#607568] sm:text-base">
                    {t("dashboard.conversationIntro")}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => openChat("general")}
                      className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#176B3A] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2F8F4E] hover:shadow-md"
                    >
                      <span>{t("dashboard.startConversation")}</span>
                      <ArrowRight
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </button>

                    <div className="flex items-center gap-2 text-xs text-[#607568]">
                      <Lock size={14} className="text-[#2F8F4E]" />
                      <span>{t("dashboard.privateAtPace")}</span>
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
                    {t("dashboard.chooseSupport")}
                  </h2>
                  <p className="mt-1 text-sm text-[#7B8F82]">
                    {t("dashboard.switchAdvisors")}
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
                            {t(advisor.title)}
                          </h3>

                          {unread && (
                            <span className="rounded-full bg-[#E7F1E3] px-2 py-0.5 text-[10px] font-bold text-[#176B3A]">
                              {t("dashboard.newMessageLabel")}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-sm text-[#7B8F82]">
                          {t(advisor.description)}
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
                    {t("dashboard.recent")}
                  </h2>
                  <p className="mt-1 text-sm text-[#7B8F82]">
                    {t("dashboard.continue")}
                  </p>
                </div>
              </div>

              {loadingConversation ? (
                <div className="rounded-2xl border border-[#DCE8D9] bg-white p-6">
                  <div className="flex items-center gap-3 text-sm text-[#7B8F82]">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#DCE8D9] border-t-[#2F8F4E]" />
                    {t("dashboard.loadingConversations")}
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
                        ? t("dashboard.emotional")
                        : t(`dashboard.${conversation.advisor_type}`);

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
                              {t("dashboard.advisorTitle", { advisorType: advisorName })}
                            </h3>

                            {unread && (
                              <span className="rounded-full bg-[#E7F1E3] px-2 py-0.5 text-[10px] font-bold text-[#176B3A]">
                                {t("dashboard.new")}
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
                              ? t("dashboard.advisorNewMessage")
                              : lastMessage
                                ? lastMessage.text
                                : t("dashboard.startChatting")}
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
                        {t("dashboard.noneYet")}
                      </h3>
                      <p className="mt-1 text-sm text-[#7B8F82]">
                        {t("dashboard.chooseAdvisor")}
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
                    {t("dashboard.moreInfo")}
                  </p>
                  <p className="mt-1 text-xs text-[#7B8F82]">
                    {t("dashboard.exploreResources")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={openAwareness}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DCE8D9] bg-white px-4 py-2.5 text-xs font-semibold text-[#173B28] transition hover:border-[#AFCDAF] hover:bg-[#F5F8F3]"
                  >
                    <BookOpen size={15} className="text-[#2F8F4E]" />
                    {t("common.awareness")}
                  </button>

                  <button
                    type="button"
                    onClick={openInformation}
                    className="inline-flex items-center gap-2 rounded-full border border-[#DCE8D9] bg-white px-4 py-2.5 text-xs font-semibold text-[#173B28] transition hover:border-[#AFCDAF] hover:bg-[#F5F8F3]"
                  >
                    <Info size={15} className="text-[#2F8F4E]" />
                    {t("dashboard.about")}
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
                <span>{t("dashboard.privateFooter")}</span>
              </div>

              <p>
                {t("dashboard.disclaimer")}
              </p>
            </footer>
          </div>
      </div>
    </main>
  );
}
