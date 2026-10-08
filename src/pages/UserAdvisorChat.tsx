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

const conversationStorageKey = (sessionId: string, advisorType: AdvisorType) =>
  `safelink_conversation_${sessionId}_${advisorType}`;

const isAdvisorType = (value: string | null): value is AdvisorType =>
  value === "medical" ||
  value === "legal" ||
  value === "psychological" ||
  value === "general";

export default function UserAdvisorChat() {
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [selectedAdvisor, setSelectedAdvisor] =
    useState<AdvisorType>("general");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [error, setError] = useState("");

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const savedSession = localStorage.getItem("safelink_session");

  let sessionId: string | null = null;

  try {
    sessionId = savedSession ? JSON.parse(savedSession).safelink_id : null;
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

    const savedAdvisor = localStorage.getItem(advisorStorageKey(sessionId));

    if (isAdvisorType(savedAdvisor)) {
      setSelectedAdvisor(savedAdvisor);
    }
  }, [sessionId, navigate]);

  /*
   * Load ONLY the conversation belonging to
   * the currently selected advisor.
   */
  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    const loadAdvisorConversation = async () => {
      setError("");
      setConversation(null);

      try {
        const conversations = await getUserConversations(sessionId);

        if (cancelled) return;

        const advisorConversations = conversations
          .filter(
            (item) =>
              item.advisor_type === selectedAdvisor && !item.hidden_for_user,
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          );

        const matchingConversation = advisorConversations[0] ?? null;

        if (!matchingConversation) {
          return;
        }

        setConversation(matchingConversation);

        localStorage.setItem(
          conversationStorageKey(sessionId, selectedAdvisor),
          matchingConversation.conversation_id,
        );

        /*
         * The user has opened this conversation.
         * Mark advisor messages as seen.
         */
        try {
          const seenConversation = await markConversationSeen(
            matchingConversation.conversation_id,
            "user",
          );

          if (!cancelled) {
            setConversation(seenConversation);
          }
        } catch (seenError) {
          console.error("Unable to mark conversation as seen:", seenError);
        }
      } catch (loadError) {
        if (cancelled) return;

        console.error("Unable to load advisor conversation:", loadError);

        setConversation(null);
        setError("Unable to load this advisor conversation.");
      }
    };

    loadAdvisorConversation();

    return () => {
      cancelled = true;
    };
  }, [sessionId, selectedAdvisor]);

  /*
   * Poll ONLY the currently selected advisor's conversation.
   *
   * IMPORTANT:
   * If the advisor sends a new message while the user
   * is already inside this chat, the new advisor message
   * is automatically marked as seen.
   */
  useEffect(() => {
    if (!conversation || !sessionId) return;

    const activeConversationId = conversation.conversation_id;

    const refreshConversation = async () => {
      try {
        const conversations = await getUserConversations(sessionId);

        const updatedConversation = conversations.find(
          (item) =>
            item.conversation_id === activeConversationId &&
            item.advisor_type === selectedAdvisor &&
            !item.hidden_for_user,
        );

            setConversation(seenConversation);
          } catch (seenError) {
            console.error(
              "Unable to mark advisor messages as seen:",
              seenError,
            );
          }
        }
      } catch (pollError) {
        console.error("Unable to refresh conversation:", pollError);
      }
    };

    /*
     * Check immediately.
     */
    refreshConversation();

    /*
     * Continue checking every 3 seconds.
     */
    const interval = window.setInterval(refreshConversation, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [conversation?.conversation_id, sessionId, selectedAdvisor]);

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
   */
  const handleAdvisorChange = (advisorType: AdvisorType) => {
    if (!sessionId) return;

    setSelectedAdvisor(advisorType);

    localStorage.setItem(advisorStorageKey(sessionId), advisorType);

    setConversation(null);
    setMessage("");
    setError("");
    setEditingMessageId(null);
    setEditingText("");
  };

  /*
   * Start/open the selected advisor conversation.
   */
  const handleStartChat = async () => {
    if (!sessionId) {
      setError("Your private session could not be found.");
      return;
    }

    setStartingChat(true);
    setError("");

    try {
      const conversations = await getUserConversations(sessionId);

      const existingConversation =
        conversations
          .filter(
            (item) =>
              item.advisor_type === selectedAdvisor && !item.hidden_for_user,
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0] ?? null;

      if (existingConversation) {
        setConversation(existingConversation);

        localStorage.setItem(advisorStorageKey(sessionId), selectedAdvisor);

        localStorage.setItem(
          conversationStorageKey(sessionId, selectedAdvisor),
          existingConversation.conversation_id,
        );

        /*
         * User opened the conversation.
         * Mark advisor messages as seen.
         */
        try {
          const seenConversation = await markConversationSeen(
            existingConversation.conversation_id,
            "user",
          );

          setConversation(seenConversation);
        } catch (seenError) {
          console.error("Unable to mark conversation as seen:", seenError);
        }

        return;
      }

      const newConversation = await requestAdvisor(sessionId, selectedAdvisor);

      if (newConversation.advisor_type !== selectedAdvisor) {
        throw new Error("The server returned the wrong advisor conversation.");
      }

      setConversation(newConversation);

      localStorage.setItem(advisorStorageKey(sessionId), selectedAdvisor);

      localStorage.setItem(
        conversationStorageKey(sessionId, selectedAdvisor),
        newConversation.conversation_id,
      );

      /*
       * Mark the newly opened conversation as seen.
       */
      try {
        const seenConversation = await markConversationSeen(
          newConversation.conversation_id,
          "user",
        );

        setConversation(seenConversation);
      } catch (seenError) {
        console.error("Unable to mark conversation as seen:", seenError);
      }
    } catch (requestError) {
      console.error("Unable to request advisor:", requestError);

      setError("Unable to connect you with this advisor. Please try again.");
    } finally {
      setStartingChat(false);
    }
  };

  /*
   * Send message.
   */
  const handleSendMessage = async () => {
    if (!conversation || !message.trim() || loading) {
      return;
    }

    const text = message.trim();

    setLoading(true);
    setError("");

    try {
      const updatedConversation = await sendMessage(
        conversation.conversation_id,
        "user",
        text,
      );

      if (updatedConversation.advisor_type !== selectedAdvisor) {
        throw new Error("The server returned the wrong advisor conversation.");
      }

      setConversation(updatedConversation);
      setMessage("");
    } catch (sendError) {
      console.error("Unable to send message:", sendError);

      setError("Unable to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!conversation || !editingText.trim()) {
      return;
    }

    try {
      const updatedConversation = await editMessage(
        conversation.conversation_id,
        messageId,
        editingText.trim(),
      );

      if (updatedConversation.advisor_type !== selectedAdvisor) {
        throw new Error("The server returned the wrong advisor conversation.");
      }

      setConversation(updatedConversation);
      setEditingMessageId(null);
      setEditingText("");
    } catch (editError) {
      console.error("Unable to edit message:", editError);

      setError("Unable to edit the message.");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!conversation) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) return;

    try {
      const updatedConversation = await deleteMessage(
        conversation.conversation_id,
        messageId,
      );

      if (updatedConversation.advisor_type !== selectedAdvisor) {
        throw new Error("The server returned the wrong advisor conversation.");
      }

      setConversation(updatedConversation);
    } catch (deleteError) {
      console.error("Unable to delete message:", deleteError);

      setError("Unable to delete the message.");
    }
  };

  const startEditing = (messageId: string, text: string) => {
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
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!sessionId) {
    return null;
  }

  const currentAdvisor = advisorOptions.find(
    (advisor) => advisor.type === selectedAdvisor,
  );

  return (
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-[250px] shrink-0 border-r border-[#a79093]/25 bg-[#f7f5f6] lg:flex lg:flex-col">
          {/* Logo */}
          <div className="px-7 pt-8 pb-8">
            <button
              onClick={() => navigate("/user/dashboard")}
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center bg-[#3e1919]">
                <span className="text-xl text-[#f0e2d6]">♡</span>
              </div>

              <div className="text-left">
                <p className="text-[19px] font-semibold tracking-tight text-[#3e1919]">
                  SafeLink
                </p>

                <p className="text-[9px] font-medium tracking-[0.18em] text-[#a79093]">
                  PRIVATE SUPPORT
                </p>
              </div>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-5">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a79093]">
              Workspace
            </p>

            <button
              onClick={() => navigate("/user/dashboard")}
              className="mb-1 flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-3 text-sm font-medium text-[#a79093] transition hover:border-[#3e1919] hover:text-[#3e1919]"
            >
              <span className="text-base">⌂</span>
              Dashboard
            </button>

            <button
              onClick={() => navigate("/user/dashboard/chat")}
              className="mb-1 flex w-full items-center gap-3 border-l-2 border-[#3e1919] bg-[#f0e2d6] px-3 py-3 text-sm font-semibold text-[#3e1919]"
            >
              <span className="text-base">◌</span>
              Advisor Chat
            </button>

            <button
              onClick={() => navigate("/awareness")}
              className="flex w-full items-center gap-3 border-l-2 border-transparent px-3 py-3 text-sm font-medium text-[#a79093] transition hover:border-[#3e1919] hover:text-[#3e1919]"
            >
              <span className="text-base">▣</span>
              Awareness
            </button>
          </nav>

          {/* Safety area */}
          <div className="px-5 pb-5">
            <div className="border-t border-[#a79093]/25 pt-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#f0e2d6] text-sm font-semibold text-[#3e1919]">
                  !
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#3e1919]">
                    Your safety matters
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-[#a79093]">
                    Your conversations are private.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/quick-exit")}
                className="mt-4 w-full border border-[#3e1919] py-2.5 text-xs font-semibold text-[#3e1919] transition hover:bg-[#3e1919] hover:text-white"
              >
                Quick Exit
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <section className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex min-h-[76px] items-center justify-between border-b border-[#a79093]/25 bg-[#f7f5f6] px-5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/user/dashboard")}
                className="flex h-9 w-9 items-center justify-center border border-[#a79093]/35 text-[#3e1919] transition hover:bg-[#f0e2d6]"
                aria-label="Back to dashboard"
              >
                ←
              </button>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#a79093]">
                  Private Support
                </p>

                <h1 className="text-base font-semibold text-[#3e1919] sm:text-lg">
                  Advisor Conversations
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden border border-[#a79093]/30 px-3 py-1.5 text-[11px] font-semibold text-[#3e1919] sm:block">
                Private session
              </div>

              <QuickExit />
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col">
            {/* ADVISOR SWITCHER */}
            <div className="border-b border-[#a79093]/25 bg-[#f7f5f6] px-4 py-3 sm:px-8">
              <div className="mx-auto flex max-w-[1000px] gap-1 overflow-x-auto pb-1">
                {advisorOptions.map((advisor) => {
                  const active = selectedAdvisor === advisor.type;

                  return (
                    <button
                      key={advisor.type}
                      onClick={() => handleAdvisorChange(advisor.type)}
                      className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                        active
                          ? "border-[#3e1919] bg-[#f0e2d6] text-[#3e1919]"
                          : "border-transparent text-[#a79093] hover:border-[#a79093] hover:text-[#3e1919]"
                      }`}
                    >
                      <span>{advisor.icon}</span>

                      <span>{advisor.label.replace(" Advisor", "")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!conversation ? (
              /* START SELECTED ADVISOR CHAT */
              <div className="flex flex-1 items-start justify-center overflow-y-auto px-5 py-10 sm:px-8 lg:items-center lg:py-12">
                <div className="w-full max-w-[850px]">
                  <div className="border-b border-[#a79093]/25 pb-8">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center bg-[#f0e2d6] text-2xl">
                      {currentAdvisor?.icon || "💬"}
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                      {currentAdvisor?.label || "Advisor"}
                    </p>

                    <h2 className="max-w-[650px] text-3xl font-semibold leading-tight tracking-tight text-[#3e1919] sm:text-4xl">
                      Your private {currentAdvisor?.label || "advisor"} chat.
                    </h2>

                    <p className="mt-3 max-w-[620px] text-sm leading-6 text-[#a79093]">
                      This conversation is separate from your conversations with
                      other advisors.
                    </p>
                  </div>

                  <div className="mt-7 border-y border-[#a79093]/25 py-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#f0e2d6] text-xl">
                        {currentAdvisor?.icon || "💬"}
                      </div>

                      <div>
                        <h3 className="font-semibold text-[#3e1919]">
                          {currentAdvisor?.label || "Advisor"}
                        </h3>

                        <p className="mt-1 text-sm leading-5 text-[#a79093]">
                          {currentAdvisor?.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-5 border-l-2 border-[#3e1919] bg-[#f0e2d6] px-4 py-3 text-sm text-[#3e1919]">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleStartChat}
                    disabled={startingChat}
                    className="mt-7 flex w-full items-center justify-center gap-2 bg-[#3e1919] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#2d1111] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {startingChat
                      ? "Connecting..."
                      : `Open ${currentAdvisor?.label || "advisor"} conversation`}

                    {!startingChat && <span>→</span>}
                  </button>

                  <p className="mt-4 text-xs leading-5 text-[#a79093]">
                    Your {currentAdvisor?.label?.toLowerCase() || "advisor"}{" "}
                    conversation is private and separate from your other advisor
                    chats.
                  </p>
                </div>
              </div>
            ) : (
              /* CHAT */
              <div className="flex min-h-0 flex-1 flex-col bg-[#f7f5f6]">
                {/* Chat header */}
                <div className="border-b border-[#a79093]/25 bg-[#f7f5f6] px-5 py-4 sm:px-8">
                  <div className="mx-auto flex max-w-[1000px] items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#f0e2d6] text-xl">
                        {currentAdvisor?.icon || "💬"}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-[#3e1919] sm:text-base">
                          {currentAdvisor?.label || "Advisor"}
                        </h2>

                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 bg-[#3e1919]" />

                          <span className="text-xs text-[#a79093]">
                            Private conversation
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden border-l border-[#a79093]/30 pl-4 text-right sm:block">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#a79093]">
                        Advisor
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-[#3e1919]">
                        {currentAdvisor?.label.replace(" Advisor", "")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">
                  <div className="mx-auto max-w-[850px]">
                    {conversation.messages.length === 0 && (
                      <div className="flex min-h-[300px] items-center justify-center">
                        <div className="max-w-[420px] text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center bg-[#f0e2d6] text-2xl">
                            {currentAdvisor?.icon || "💬"}
                          </div>

                          <h3 className="mt-4 text-base font-semibold text-[#3e1919]">
                            Your {currentAdvisor?.label || "advisor"}{" "}
                            conversation is ready
                          </h3>

                          <p className="mt-2 text-sm leading-6 text-[#a79093]">
                            Send your first message below. This chat is separate
                            from your other advisor conversations.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      {conversation.messages.map((item) => {
                        const isUser = item.sender === "user";

                        if (item.deleted) {
                          return (
                            <div
                              key={item.message_id}
                              className={`flex ${
                                isUser ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`border border-[#a79093]/20 px-4 py-3 text-xs italic text-[#a79093] ${
                                  isUser ? "bg-[#f0e2d6]" : "bg-white"
                                }`}
                              >
                                This message was deleted.
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={item.message_id}
                            className={`flex ${
                              isUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div className="max-w-[82%] sm:max-w-[70%]">
                              <div
                                className={`mb-1.5 flex items-center gap-2 ${
                                  isUser ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span className="text-[10px] font-semibold text-[#a79093]">
                                  {isUser
                                    ? "You"
                                    : currentAdvisor?.label || "Advisor"}
                                </span>

                                <span className="text-[10px] text-[#a79093]/80">
                                  {new Date(item.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>

                              {editingMessageId === item.message_id ? (
                                <div className="border border-[#a79093]/35 bg-white p-3">
                                  <textarea
                                    value={editingText}
                                    onChange={(event) =>
                                      setEditingText(event.target.value)
                                    }
                                    rows={3}
                                    autoFocus
                                    className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-[#3e1919] outline-none"
                                  />

                                  <div className="mt-2 flex justify-end gap-2">
                                    <button
                                      onClick={cancelEditing}
                                      className="px-3 py-1.5 text-xs font-semibold text-[#a79093] hover:text-[#3e1919]"
                                    >
                                      Cancel
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleEditMessage(item.message_id)
                                      }
                                      className="bg-[#3e1919] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d1111]"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className={`px-4 py-3.5 ${
                                    isUser
                                      ? "bg-[#3e1919] text-white"
                                      : "border border-[#a79093]/25 bg-white text-[#3e1919]"
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
                                            : "text-[#a79093]"
                                        }`}
                                      >
                                        edited
                                      </span>
                                    )}

                                    {isUser && (
                                      <span
                                        className={`text-[11px] font-semibold ${
                                          item.seen_at
                                            ? "text-[#f0e2d6]"
                                            : "text-white/60"
                                        }`}
                                        title={
                                          item.seen_at
                                            ? "Seen by advisor"
                                            : "Sent"
                                        }
                                      >
                                        {item.seen_at ? "✓✓" : "✓"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {isUser &&
                                editingMessageId !== item.message_id && (
                                  <div className="mt-1.5 flex justify-end gap-3">
                                    <button
                                      onClick={() =>
                                        startEditing(item.message_id, item.text)
                                      }
                                      className="text-[10px] font-medium text-[#a79093] transition hover:text-[#3e1919]"
                                    >
                                      Edit
                                    </button>

                                    <button
                                      onClick={() =>
                                        handleDeleteMessage(item.message_id)
                                      }
                                      className="text-[10px] font-medium text-[#a79093] transition hover:text-[#3e1919]"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="px-4 sm:px-8">
                    <div className="mx-auto mb-2 max-w-[850px] border-l-2 border-[#3e1919] bg-[#f0e2d6] px-4 py-2.5 text-xs text-[#3e1919]">
                      {error}
                    </div>
                  </div>
                )}

                {/* Composer */}
                <div className="border-t border-[#a79093]/25 bg-[#f7f5f6] px-4 py-4 sm:px-8">
                  <div className="mx-auto max-w-[850px]">
                    <div className="flex items-end gap-2 border border-[#a79093]/35 bg-white p-2 transition focus-within:border-[#3e1919]">
                      <textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyDown={handleComposerKeyDown}
                        placeholder={`Write your message to the ${currentAdvisor?.label?.toLowerCase() || "advisor"}...`}
                        rows={1}
                        className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm leading-5 text-[#3e1919] outline-none placeholder:text-[#a79093]"
                      />

                      <button
                        onClick={handleSendMessage}
                        disabled={loading || !message.trim()}
                        className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#3e1919] text-white transition hover:bg-[#2d1111] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Send message"
                      >
                        {loading ? "…" : "↑"}
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between px-1">
                      <p className="text-[10px] text-[#a79093]">
                        Enter to send · Shift + Enter for a new line
                      </p>

                      <p className="hidden text-[10px] text-[#a79093] sm:block">
                        {currentAdvisor?.label || "Advisor"} conversation is
                        private
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
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#a79093]/25 bg-[#f7f5f6] px-3 py-2 lg:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <button
            onClick={() => navigate("/user/dashboard")}
            className="flex flex-col items-center gap-1 px-4 py-1 text-[#a79093] transition hover:text-[#3e1919]"
          >
            <span>⌂</span>
            <span className="text-[9px] font-semibold">Home</span>
          </button>

          <button
            onClick={() => navigate("/user/dashboard/chat")}
            className="flex flex-col items-center gap-1 border-b-2 border-[#3e1919] px-4 py-1 text-[#3e1919]"
          >
            <span>◌</span>
            <span className="text-[9px] font-semibold">Chat</span>
          </button>

          <button
            onClick={() => navigate("/awareness")}
            className="flex flex-col items-center gap-1 px-4 py-1 text-[#a79093] transition hover:text-[#3e1919]"
          >
            <span>▣</span>
            <span className="text-[9px] font-semibold">Awareness</span>
          </button>

          <button
            onClick={() => navigate("/quick-exit")}
            className="flex flex-col items-center gap-1 px-4 py-1 text-[#3e1919]"
          >
            <span>×</span>
            <span className="text-[9px] font-semibold">Exit</span>
          </button>
        </div>
      </div>
    </main>
  );
}
