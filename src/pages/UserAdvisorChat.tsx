
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import QuickExit from "../components/QuickExit";
import {
  requestAdvisor,
  getUserConversations,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationSeen,
  type AdvisorType,
  type Conversation,
} from "../api/conversationApi";

const advisorOptions: {
  type: AdvisorType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    type: "medical",
    label: "Medical Advisor",
    description: "Guidance related to health and medical concerns.",
    icon: "🩺",
  },
  {
    type: "legal",
    label: "Legal Advisor",
    description: "Information about your rights and legal options.",
    icon: "⚖️",
  },
  {
    type: "psychological",
    label: "Psychological Advisor",
    description: "A private space for emotional or psychological concerns.",
    icon: "💚",
  },
  {
    type: "general",
    label: "General Advisor",
    description: "Talk with an advisor about your situation.",
    icon: "💬",
  },
];

const advisorStorageKey = (sessionId: string) =>
  `safelink_selected_advisor_${sessionId}`;

const conversationStorageKey = (
  sessionId: string,
  advisorType: AdvisorType,
) => `safelink_conversation_${sessionId}_${advisorType}`;

const isAdvisorType = (
  value: string | null,
): value is AdvisorType =>
  value === "medical" ||
  value === "legal" ||
  value === "psychological" ||
  value === "general";

export default function UserAdvisorChat() {
  const navigate = useNavigate();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [selectedAdvisor, setSelectedAdvisor] =
    useState<AdvisorType>("general");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [error, setError] = useState("");

  const [editingMessageId, setEditingMessageId] =
    useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const savedSession =
    localStorage.getItem("safelink_session");

  let sessionId: string | null = null;

  try {
    sessionId = savedSession
      ? JSON.parse(savedSession).safelink_id
      : null;
  } catch {
    sessionId = null;
  }

  /*
   * Load the advisor selected from the dashboard.
   */
  useEffect(() => {
    if (!sessionId) {
      navigate("/create");
      return;
    }

    const savedAdvisor = localStorage.getItem(
      advisorStorageKey(sessionId),
    );

    if (isAdvisorType(savedAdvisor)) {
      setSelectedAdvisor(savedAdvisor);
    }
  }, [sessionId, navigate]);

  /*
   * Load ONLY the conversation belonging to
   * the currently selected advisor.
   *
   * We use getUserConversations() instead of
   * getUserConversation(), because the backend
   * now returns all advisor conversations.
   */
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    const loadAdvisorConversation = async () => {
      setError("");
      setConversation(null);

      try {
        const conversations =
          await getUserConversations(sessionId);

        if (cancelled) return;

        /*
         * Find only this advisor's conversation.
         *
         * If there are multiple old conversations
         * for the same advisor, use the newest one.
         */
        const advisorConversations =
          conversations
            .filter(
              (item) =>
                item.advisor_type ===
                  selectedAdvisor &&
                !item.hidden_for_user,
            )
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            );

        const matchingConversation =
          advisorConversations[0] ?? null;

        if (!matchingConversation) {
          /*
           * There is no conversation for this advisor yet.
           * The user will see the Start Conversation screen.
           */
          return;
        }

        setConversation(matchingConversation);

        localStorage.setItem(
          conversationStorageKey(
            sessionId,
            selectedAdvisor,
          ),
          matchingConversation.conversation_id,
        );

        /*
         * Mark advisor messages as seen when
         * the user opens this conversation.
         */
        try {
          const seenConversation =
            await markConversationSeen(
              matchingConversation.conversation_id,
              "user",
            );

          if (!cancelled) {
            setConversation(seenConversation);
          }
        } catch (seenError) {
          console.error(
            "Unable to mark conversation as seen:",
            seenError,
          );
        }
      } catch (loadError) {
        if (cancelled) return;

        console.error(
          "Unable to load advisor conversation:",
          loadError,
        );

        setConversation(null);
        setError(
          "Unable to load this advisor conversation.",
        );
      }
    };

    loadAdvisorConversation();

    return () => {
      cancelled = true;
    };
  }, [sessionId, selectedAdvisor]);

  /*
   * Poll ONLY the currently selected advisor's conversation.
   */
  useEffect(() => {
    if (!conversation || !sessionId) return;

    const activeConversationId =
      conversation.conversation_id;

    const interval = window.setInterval(async () => {
      try {
        const conversations =
          await getUserConversations(sessionId);

        const updatedConversation =
          conversations.find(
            (item) =>
              item.conversation_id ===
                activeConversationId &&
              item.advisor_type ===
                selectedAdvisor &&
              !item.hidden_for_user,
          );

        if (updatedConversation) {
          setConversation(updatedConversation);
        }
      } catch (pollError) {
        console.error(
          "Unable to refresh conversation:",
          pollError,
        );
      }
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    conversation?.conversation_id,
    sessionId,
    selectedAdvisor,
  ]);

  /*
   * Scroll to newest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation?.messages.length]);

  /*
   * Change advisor.
   *
   * The selected advisor is saved separately for
   * this user's private session.
   */
  const handleAdvisorChange = (
    advisorType: AdvisorType,
  ) => {
    if (!sessionId) return;

    setSelectedAdvisor(advisorType);

    localStorage.setItem(
      advisorStorageKey(sessionId),
      advisorType,
    );

    setConversation(null);
    setMessage("");
    setError("");
    setEditingMessageId(null);
    setEditingText("");
  };

  /*
   * Start/open the selected advisor conversation.
   *
   * IMPORTANT:
   * First check whether this advisor already has
   * a conversation.
   *
   * Only create a new conversation if none exists.
   * This prevents duplicate chats.
   */
  const handleStartChat = async () => {
    if (!sessionId) {
      setError(
        "Your private session could not be found.",
      );
      return;
    }

    setStartingChat(true);
    setError("");

    try {
      const conversations =
        await getUserConversations(sessionId);

      const existingConversation =
        conversations
          .filter(
            (item) =>
              item.advisor_type ===
                selectedAdvisor &&
              !item.hidden_for_user,
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0] ?? null;

      /*
       * If the user already has a chat with this advisor,
       * simply reopen it.
       */
      if (existingConversation) {
        setConversation(existingConversation);

        localStorage.setItem(
          advisorStorageKey(sessionId),
          selectedAdvisor,
        );

        localStorage.setItem(
          conversationStorageKey(
            sessionId,
            selectedAdvisor,
          ),
          existingConversation.conversation_id,
        );

        try {
          const seenConversation =
            await markConversationSeen(
              existingConversation.conversation_id,
              "user",
            );

          setConversation(seenConversation);
        } catch (seenError) {
          console.error(
            "Unable to mark conversation as seen:",
            seenError,
          );
        }

        return;
      }

      /*
       * No conversation exists for this advisor,
       * so create one.
       */
      const newConversation =
        await requestAdvisor(
          sessionId,
          selectedAdvisor,
        );

      /*
       * Safety check:
       * Never put another advisor's conversation
       * into this chat.
       */
      if (
        newConversation.advisor_type !==
        selectedAdvisor
      ) {
        throw new Error(
          "The server returned the wrong advisor conversation.",
        );
      }

      setConversation(newConversation);

      localStorage.setItem(
        advisorStorageKey(sessionId),
        selectedAdvisor,
      );

      localStorage.setItem(
        conversationStorageKey(
          sessionId,
          selectedAdvisor,
        ),
        newConversation.conversation_id,
      );

      try {
        const seenConversation =
          await markConversationSeen(
            newConversation.conversation_id,
            "user",
          );

        setConversation(seenConversation);
      } catch (seenError) {
        console.error(
          "Unable to mark conversation as seen:",
          seenError,
        );
      }
    } catch (requestError) {
      console.error(
        "Unable to request advisor:",
        requestError,
      );

      setError(
        "Unable to connect you with this advisor. Please try again.",
      );
    } finally {
      setStartingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (
      !conversation ||
      !message.trim() ||
      loading
    ) {
      return;
    }

    const text = message.trim();

    setLoading(true);
    setError("");

    try {
      const updatedConversation =
        await sendMessage(
          conversation.conversation_id,
          "user",
          text,
        );

      if (
        updatedConversation.advisor_type !==
        selectedAdvisor
      ) {
        throw new Error(
          "The server returned the wrong advisor conversation.",
        );
      }

      setConversation(updatedConversation);
      setMessage("");
    } catch (sendError) {
      console.error(
        "Unable to send message:",
        sendError,
      );

      setError(
        "Unable to send your message. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (
    messageId: string,
  ) => {
    if (
      !conversation ||
      !editingText.trim()
    ) {
      return;
    }

    try {
      const updatedConversation =
        await editMessage(
          conversation.conversation_id,
          messageId,
          editingText.trim(),
        );

      if (
        updatedConversation.advisor_type !==
        selectedAdvisor
      ) {
        throw new Error(
          "The server returned the wrong advisor conversation.",
        );
      }

      setConversation(updatedConversation);
      setEditingMessageId(null);
      setEditingText("");
    } catch (editError) {
      console.error(
        "Unable to edit message:",
        editError,
      );

      setError("Unable to edit the message.");
    }
  };

  const handleDeleteMessage = async (
    messageId: string,
  ) => {
    if (!conversation) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) return;

    try {
      const updatedConversation =
        await deleteMessage(
          conversation.conversation_id,
          messageId,
        );

      if (
        updatedConversation.advisor_type !==
        selectedAdvisor
      ) {
        throw new Error(
          "The server returned the wrong advisor conversation.",
        );
      }

      setConversation(updatedConversation);
    } catch (deleteError) {
      console.error(
        "Unable to delete message:",
        deleteError,
      );

      setError(
        "Unable to delete the message.",
      );
    }
  };

  const startEditing = (
    messageId: string,
    text: string,
  ) => {
    setEditingMessageId(messageId);
    setEditingText(text);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!sessionId) {
    return null;
  }

  const currentAdvisor = advisorOptions.find(
    (advisor) =>
      advisor.type === selectedAdvisor,
  );

  return (
    <main className="min-h-screen bg-[#fbfcfc] text-[#0b4964]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-[250px] shrink-0 border-r border-[#e1eae7] bg-white lg:flex lg:flex-col">

          <div className="px-7 pt-8 pb-7">
            <button
              onClick={() =>
                navigate("/user/dashboard")
              }
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7f7f4]">
                <div className="h-6 w-6 rounded-full border-[5px] border-[#079b9d] border-r-[#16a38b]" />
              </div>

              <div className="text-left">
                <p className="text-[19px] font-bold tracking-tight text-[#0b4964]">
                  SafeLink
                </p>

                <p className="text-[10px] font-medium tracking-[0.15em] text-[#8a9ba0]">
                  PRIVATE SUPPORT
                </p>
              </div>
            </button>
          </div>

          <nav className="flex-1 px-4">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9aabad]">
              Workspace
            </p>

            <button
              onClick={() =>
                navigate("/user/dashboard")
              }
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#607d85] transition hover:bg-[#f1f8f6]"
            >
              <span className="text-base">⌂</span>
              Dashboard
            </button>

            <button
              onClick={() =>
                navigate("/user/dashboard/chat")
              }
              className="flex w-full items-center gap-3 rounded-xl bg-[#e7f7f4] px-4 py-3 text-sm font-semibold text-[#087f82]"
            >
              <span className="text-base">◌</span>
              Advisor Chat
            </button>

            <button
              onClick={() =>
                navigate("/awareness")
              }
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#607d85] transition hover:bg-[#f1f8f6]"
            >
              <span className="text-base">▣</span>
              Awareness
            </button>
          </nav>

          <div className="px-4 pb-5">
            <div className="rounded-2xl bg-[#075c72] p-4 text-white">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                !
              </div>

              <p className="text-sm font-semibold">
                Your safety matters
              </p>

              <p className="mt-1 text-[11px] leading-5 text-white/70">
                Your conversations are private.
              </p>

              <button
                onClick={() =>
                  navigate("/quick-exit")
                }
                className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-semibold transition hover:bg-white/20"
              >
                Quick Exit
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="flex min-h-screen min-w-0 flex-1 flex-col">

          <header className="flex min-h-[76px] items-center justify-between border-b border-[#e6eeec] bg-white px-5 sm:px-8">

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  navigate("/user/dashboard")
                }
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dce9e6] text-[#55757d] transition hover:bg-[#f1f8f6]"
                aria-label="Back to dashboard"
              >
                ←
              </button>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9aaeb1]">
                  Private Support
                </p>

                <h1 className="text-base font-bold text-[#0b4964] sm:text-lg">
                  Advisor Conversations
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-full bg-[#eaf8f5] px-3 py-1.5 text-[11px] font-semibold text-[#087f82] sm:block">
                Private session
              </div>

              <QuickExit />
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col">

            {/* ADVISOR SWITCHER */}
            <div className="border-b border-[#e4ecea] bg-white px-4 py-3 sm:px-8">
              <div className="mx-auto flex max-w-[1000px] gap-2 overflow-x-auto pb-1">

                {advisorOptions.map(
                  (advisor) => {
                    const active =
                      selectedAdvisor ===
                      advisor.type;

                    return (
                      <button
                        key={advisor.type}
                        onClick={() =>
                          handleAdvisorChange(
                            advisor.type,
                          )
                        }
                        className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          active
                            ? "border-[#0b9fa0] bg-[#eaf8f5] text-[#087f82]"
                            : "border-[#e1eae7] bg-white text-[#71888e] hover:bg-[#f5faf8]"
                        }`}
                      >
                        <span>
                          {advisor.icon}
                        </span>

                        <span>
                          {advisor.label.replace(
                            " Advisor",
                            "",
                          )}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {!conversation ? (
              /* START SELECTED ADVISOR CHAT */
              <div className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-8 sm:px-8 lg:items-center lg:py-10">
                <div className="w-full max-w-[850px]">

                  <div className="mb-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e7f7f4] text-2xl">
                      {currentAdvisor?.icon || "💬"}
                    </div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0b9fa0]">
                      {currentAdvisor?.label ||
                        "Advisor"}
                    </p>

                    <h2 className="max-w-[650px] text-3xl font-bold leading-tight tracking-tight text-[#0b4964] sm:text-4xl">
                      Your private{" "}
                      {currentAdvisor?.label ||
                        "advisor"}{" "}
                      chat.
                    </h2>

                    <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#71888e]">
                      This conversation is separate
                      from your conversations with
                      other advisors.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e1eae7] bg-white p-5">
                    <div className="flex items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e7f7f4] text-xl">
                        {currentAdvisor?.icon ||
                          "💬"}
                      </div>

                      <div>
                        <h3 className="font-bold text-[#0b4964]">
                          {currentAdvisor?.label ||
                            "Advisor"}
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-[#70888f]">
                          {currentAdvisor?.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-5 rounded-xl border border-[#f0d8dc] bg-[#fff5f6] px-4 py-3 text-sm text-[#a45c67]">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleStartChat}
                    disabled={startingChat}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#079b9d] px-6 py-3.5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(7,155,157,0.18)] transition hover:bg-[#07898b] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {startingChat
                      ? "Connecting..."
                      : `Open ${currentAdvisor?.label || "advisor"} conversation`}

                    {!startingChat && (
                      <span>→</span>
                    )}
                  </button>

                  <p className="mt-4 text-xs leading-5 text-[#91a2a5]">
                    Your{" "}
                    {currentAdvisor?.label?.toLowerCase() ||
                      "advisor"}{" "}
                    conversation is private and separate
                    from your other advisor chats.
                  </p>
                </div>
              </div>
            ) : (
              /* CHAT */
              <div className="flex min-h-0 flex-1 flex-col bg-[#fbfcfc]">

                {/* Chat header */}
                <div className="border-b border-[#e4ecea] bg-white px-5 py-4 sm:px-8">
                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e7f7f4] text-xl">
                        {currentAdvisor?.icon ||
                          "💬"}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-[#0b4964] sm:text-base">
                          {currentAdvisor?.label ||
                            "Advisor"}
                        </h2>

                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-[#1eae83]" />

                          <span className="text-xs text-[#7b9095]">
                            Private conversation
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden rounded-xl bg-[#f3f8f7] px-3 py-2 text-right sm:block">
                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9aabad]">
                        Advisor
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-[#55757d]">
                        {currentAdvisor?.label.replace(
                          " Advisor",
                          "",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                  <div className="mx-auto max-w-[850px]">

                    {conversation.messages.length ===
                      0 && (
                      <div className="flex min-h-[300px] items-center justify-center">
                        <div className="max-w-[420px] text-center">

                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7f7f4] text-2xl">
                            {currentAdvisor?.icon ||
                              "💬"}
                          </div>

                          <h3 className="mt-4 text-base font-bold text-[#0b4964]">
                            Your{" "}
                            {currentAdvisor?.label ||
                              "advisor"}{" "}
                            conversation is ready
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[#819398]">
                            Send your first message
                            below. This chat is separate
                            from your other advisor
                            conversations.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-5">
                      {conversation.messages.map(
                        (item) => {
                          const isUser =
                            item.sender ===
                            "user";

                          if (item.deleted) {
                            return (
                              <div
                                key={
                                  item.message_id
                                }
                                className={`flex ${
                                  isUser
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`rounded-2xl px-4 py-3 text-xs italic ${
                                    isUser
                                      ? "bg-[#f0f4f3] text-[#9aa8aa]"
                                      : "bg-white text-[#9aa8aa]"
                                  }`}
                                >
                                  This message was
                                  deleted.
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={
                                item.message_id
                              }
                              className={`flex ${
                                isUser
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div className="max-w-[82%] sm:max-w-[70%]">

                                <div
                                  className={`mb-1.5 flex items-center gap-2 ${
                                    isUser
                                      ? "justify-end"
                                      : "justify-start"
                                  }`}
                                >
                                  <span className="text-[10px] font-semibold text-[#94a4a7]">
                                    {isUser
                                      ? "You"
                                      : currentAdvisor?.label ||
                                        "Advisor"}
                                  </span>

                                  <span className="text-[10px] text-[#a6b3b5]">
                                    {new Date(
                                      item.timestamp,
                                    ).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute:
                                          "2-digit",
                                      },
                                    )}
                                  </span>
                                </div>

                                {editingMessageId ===
                                item.message_id ? (
                                  <div className="rounded-2xl border border-[#b9ddd6] bg-white p-3 shadow-sm">
                                    <textarea
                                      value={
                                        editingText
                                      }
                                      onChange={(
                                        event,
                                      ) =>
                                        setEditingText(
                                          event
                                            .target
                                            .value,
                                        )
                                      }
                                      rows={3}
                                      autoFocus
                                      className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-[#365c67] outline-none"
                                    />

                                    <div className="mt-2 flex justify-end gap-2">
                                      <button
                                        onClick={
                                          cancelEditing
                                        }
                                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#71888e] hover:bg-[#f2f6f5]"
                                      >
                                        Cancel
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleEditMessage(
                                            item.message_id,
                                          )
                                        }
                                        className="rounded-lg bg-[#079b9d] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#07898b]"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className={`rounded-2xl px-4 py-3.5 shadow-sm ${
                                      isUser
                                        ? "rounded-br-md bg-[#079b9d] text-white"
                                        : "rounded-bl-md border border-[#e1eae7] bg-white text-[#365c67]"
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap text-sm leading-6">
                                      {item.text}
                                    </p>

                                    <div className="mt-1 flex items-center justify-end gap-1">
                                      {item.edited && (
                                        <span
                                          className={`text-[9px] ${
                                            isUser
                                              ? "text-white/60"
                                              : "text-[#a0afb2]"
                                          }`}
                                        >
                                          edited
                                        </span>
                                      )}

                                      {isUser && (
                                        <span
                                          className={`text-[11px] font-semibold ${
                                            item.seen_at
                                              ? "text-white"
                                              : "text-white/60"
                                          }`}
                                          title={
                                            item.seen_at
                                              ? "Seen by advisor"
                                              : "Sent"
                                          }
                                        >
                                          {item.seen_at
                                            ? "✓✓"
                                            : "✓"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {isUser &&
                                  editingMessageId !==
                                    item.message_id && (
                                    <div className="mt-1.5 flex justify-end gap-2">
                                      <button
                                        onClick={() =>
                                          startEditing(
                                            item.message_id,
                                            item.text,
                                          )
                                        }
                                        className="text-[10px] font-medium text-[#8ca0a4] transition hover:text-[#079b9d]"
                                      >
                                        Edit
                                      </button>

                                      <button
                                        onClick={() =>
                                          handleDeleteMessage(
                                            item.message_id,
                                          )
                                        }
                                        className="text-[10px] font-medium text-[#8ca0a4] transition hover:text-[#c76c76]"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="px-4 sm:px-8">
                    <div className="mx-auto mb-2 max-w-[850px] rounded-xl border border-[#f0d8dc] bg-[#fff5f6] px-4 py-2.5 text-xs text-[#a45c67]">
                      {error}
                    </div>
                  </div>
                )}

                {/* Composer */}
                <div className="border-t border-[#e4ecea] bg-white px-4 py-4 sm:px-8">
                  <div className="mx-auto max-w-[850px]">

                    <div className="flex items-end gap-2 rounded-2xl border border-[#dce9e6] bg-[#fbfdfc] p-2 transition focus-within:border-[#8ccfca] focus-within:ring-2 focus-within:ring-[#e7f7f4]">

                      <textarea
                        value={message}
                        onChange={(event) =>
                          setMessage(
                            event.target.value,
                          )
                        }
                        onKeyDown={
                          handleComposerKeyDown
                        }
                        placeholder={`Write your message to the ${currentAdvisor?.label?.toLowerCase() || "advisor"}...`}
                        rows={1}
                        className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-5 text-[#365c67] outline-none placeholder:text-[#a3b2b4]"
                      />

                      <button
                        onClick={
                          handleSendMessage
                        }
                        disabled={
                          loading ||
                          !message.trim()
                        }
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#079b9d] text-white transition hover:bg-[#07898b] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send message"
                      >
                        {loading ? "…" : "↑"}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between px-1">
                      <p className="text-[10px] text-[#9aa8aa]">
                        Enter to send · Shift + Enter
                        for a new line
                      </p>

                      <p className="hidden text-[10px] text-[#9aa8aa] sm:block">
                        {currentAdvisor?.label ||
                          "Advisor"}{" "}
                        conversation is private
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Mobile navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#e1eae7] bg-white px-3 py-2 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">

          <button
            onClick={() =>
              navigate("/user/dashboard")
            }
            className="flex flex-col items-center gap-1 px-4 py-1 text-[#71888e]"
          >
            <span>⌂</span>
            <span className="text-[9px] font-semibold">
              Home
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/user/dashboard/chat")
            }
            className="flex flex-col items-center gap-1 px-4 py-1 text-[#079b9d]"
          >
            <span>◌</span>
            <span className="text-[9px] font-semibold">
              Chat
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/awareness")
            }
            className="flex flex-col items-center gap-1 px-4 py-1 text-[#71888e]"
          >
            <span>▣</span>
            <span className="text-[9px] font-semibold">
              Awareness
            </span>
          </button>

          <button
            onClick={() =>
              navigate("/quick-exit")
            }
            className="flex flex-col items-center gap-1 px-4 py-1 text-[#c76c76]"
          >
            <span>×</span>
            <span className="text-[9px] font-semibold">
              Exit
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}

