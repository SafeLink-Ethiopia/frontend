import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Edit3,
  MessageCircle,
  Reply,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import QuickExit from "../components/QuickExit";

import {
  requestAdvisor,
  getUserConversations,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationSeen,
} from "../api/conversationApi";

import type { AdvisorType, Conversation } from "../api/conversationApi";

interface UserAdvisorChatProps {
  onBack?: () => void;
}

const advisorLabels: Record<AdvisorType, string> = {
  medical: "Medical Advisor",
  legal: "Legal Advisor",
  psychological: "Psychological Advisor",
  general: "General Advisor",
};

const advisorDescriptions: Record<AdvisorType, string> = {
  medical: "Get support for health-related concerns.",
  legal: "Get guidance about legal concerns.",
  psychological: "Get confidential emotional support.",
  general: "Get general guidance and support.",
};

const advisorTypes: AdvisorType[] = [
  "medical",
  "legal",
  "psychological",
  "general",
];

function UserAdvisorChat({ onBack }: UserAdvisorChatProps) {
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState("");

  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [selectedAdvisor, setSelectedAdvisor] =
    useState<AdvisorType>("general");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [messageText, setMessageText] = useState("");

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const [replyingTo, setReplyingTo] = useState<{
    message_id: string;
    text: string;
    sender: "user" | "advisor";
  } | null>(null);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  /*
   * ============================================================
   * LOAD SESSION
   * ============================================================
   */

  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("safelink_session");

      if (!savedSession) {
        navigate("/");
        return;
      }

      const parsed = JSON.parse(savedSession);

      const id =
        parsed?.session_id ||
        parsed?.safelink_id ||
        parsed?.session?.session_id ||
        parsed?.session?.safelink_id ||
        "";

      if (!id) {
        navigate("/");
        return;
      }

      setSessionId(id);

      const savedAdvisor = localStorage.getItem("safelink_selected_advisor");

      if (
        savedAdvisor === "medical" ||
        savedAdvisor === "legal" ||
        savedAdvisor === "psychological" ||
        savedAdvisor === "general"
      ) {
        setSelectedAdvisor(savedAdvisor);
      }
    } catch (error) {
      console.error("Failed to load saved session:", error);

      navigate("/");
    }
  }, [navigate]);

  /*
   * ============================================================
   * LOAD CONVERSATIONS
   * ============================================================
   */

  const loadConversations = async (
    currentSessionId: string,
    keepCurrent = true,
  ) => {
    if (!currentSessionId) return;

    try {
      const data = await getUserConversations(currentSessionId);

      setConversations(data);

      if (data.length === 0) {
        if (!keepCurrent) {
          setConversation(null);
        }

        return;
      }

      const savedAdvisor = localStorage.getItem("safelink_selected_advisor");

      const advisorToUse =
        savedAdvisor === "medical" ||
        savedAdvisor === "legal" ||
        savedAdvisor === "psychological" ||
        savedAdvisor === "general"
          ? savedAdvisor
          : selectedAdvisor;

      if (keepCurrent && conversation) {
        const updatedCurrent = data.find(
          (item) => item.conversation_id === conversation.conversation_id,
        );

        if (updatedCurrent) {
          setConversation(updatedCurrent);
          return;
        }
      }

      const matchingConversation = data.find(
        (item) => item.advisor_type === advisorToUse,
      );

      if (matchingConversation) {
        setConversation(matchingConversation);
        setSelectedAdvisor(matchingConversation.advisor_type);
      } else {
        setConversation(null);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  /*
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */

  useEffect(() => {
    if (!sessionId) return;

    let mounted = true;

    const initialLoad = async () => {
      setLoading(true);

      try {
        if (!mounted) return;

        await loadConversations(sessionId, false);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialLoad();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  /*
   * ============================================================
   * POLLING
   * ============================================================
   */

  useEffect(() => {
    if (!sessionId) return;

    const interval = window.setInterval(async () => {
      try {
        const data = await getUserConversations(sessionId);

        setConversations(data);

        if (!conversation) return;

        const updatedConversation = data.find(
          (item) => item.conversation_id === conversation.conversation_id,
        );

        if (updatedConversation) {
          setConversation(updatedConversation);
        }
      } catch (error) {
        console.error("Conversation polling failed:", error);
      }
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [sessionId, conversation?.conversation_id]);

  /*
   * ============================================================
   * MARK ADVISOR MESSAGES AS SEEN
   * ============================================================
   */

  useEffect(() => {
    if (!conversation) return;

    const hasUnreadMessages = conversation.messages.some(
      (message) =>
        message.sender === "advisor" && !message.deleted && !message.seen_at,
    );

    if (!hasUnreadMessages) return;

    markConversationSeen(conversation.conversation_id, "user")
      .then((updatedConversation) => {
        setConversation(updatedConversation);

        setConversations((previous) =>
          previous.map((item) =>
            item.conversation_id === updatedConversation.conversation_id
              ? updatedConversation
              : item,
          ),
        );
      })
      .catch((error) => {
        console.error("Failed to mark conversation as seen:", error);
      });
  }, [conversation?.conversation_id, conversation?.messages]);

  /*
   * ============================================================
   * SELECT ADVISOR
   * ============================================================
   */

  const handleSelectAdvisor = async (advisorType: AdvisorType) => {
    setSelectedAdvisor(advisorType);

    localStorage.setItem("safelink_selected_advisor", advisorType);

    setEditingMessageId(null);
    setEditingText("");
    setReplyingTo(null);

    const existingConversation = conversations.find(
      (item) => item.advisor_type === advisorType,
    );

    if (existingConversation) {
      setConversation(existingConversation);
      setMobileSidebarOpen(false);
      return;
    }

    if (!sessionId) return;

    try {
      setLoading(true);

      const newConversation = await requestAdvisor(sessionId, advisorType);

      setConversation(newConversation);

      setConversations((previous) => {
        const exists = previous.some(
          (item) => item.conversation_id === newConversation.conversation_id,
        );

        if (exists) {
          return previous.map((item) =>
            item.conversation_id === newConversation.conversation_id
              ? newConversation
              : item,
          );
        }

        return [...previous, newConversation];
      });

      setMobileSidebarOpen(false);
    } catch (error) {
      console.error("Failed to select advisor:", error);
    } finally {
      setLoading(false);
    }
  };

  /*
   * ============================================================
   * REPLY
   * ============================================================
   */

  const handleReply = (
    messageId: string,
    text: string,
    sender: "user" | "advisor",
  ) => {
    setEditingMessageId(null);
    setEditingText("");

    setReplyingTo({
      message_id: messageId,
      text,
      sender,
    });

    window.setTimeout(() => {
      composerRef.current?.focus();
    }, 50);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    composerRef.current?.focus();
  };

  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  const handleSendMessage = async () => {
    const text = messageText.trim();

    if (!text || !conversation || sending) {
      return;
    }

    try {
      setSending(true);

      const updatedConversation = await sendMessage(
        conversation.conversation_id,
        "user",
        text,
        false,
        replyingTo?.message_id ?? null,
      );

      setConversation(updatedConversation);

      setConversations((previous) =>
        previous.map((item) =>
          item.conversation_id === updatedConversation.conversation_id
            ? updatedConversation
            : item,
        ),
      );

      setMessageText("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  /*
   * ============================================================
   * ENTER TO SEND
   * ============================================================
   */

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /*
   * ============================================================
   * EDIT MESSAGE
   * ============================================================
   */

  const startEditing = (messageId: string, text: string) => {
    setReplyingTo(null);
    setEditingMessageId(messageId);
    setEditingText(text);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const handleSaveEdit = async () => {
    if (!conversation || !editingMessageId || !editingText.trim()) {
      return;
    }

    try {
      const updatedConversation = await editMessage(
        conversation.conversation_id,
        editingMessageId,
        editingText.trim(),
      );

      setConversation(updatedConversation);

      setConversations((previous) =>
        previous.map((item) =>
          item.conversation_id === updatedConversation.conversation_id
            ? updatedConversation
            : item,
        ),
      );

      setEditingMessageId(null);
      setEditingText("");
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  /*
   * ============================================================
   * DELETE MESSAGE
   * ============================================================
   */

  const handleDeleteMessage = async (messageId: string) => {
    if (!conversation) return;

    const confirmed = window.confirm("Delete this message?");

    if (!confirmed) return;

    try {
      const updatedConversation = await deleteMessage(
        conversation.conversation_id,
        messageId,
      );

      setConversation(updatedConversation);

      setConversations((previous) =>
        previous.map((item) =>
          item.conversation_id === updatedConversation.conversation_id
            ? updatedConversation
            : item,
        ),
      );

      if (replyingTo?.message_id === messageId) {
        setReplyingTo(null);
      }

      if (editingMessageId === messageId) {
        setEditingMessageId(null);
        setEditingText("");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  /*
   * ============================================================
   * BACK
   * ============================================================
   */

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate("/dashboard");
  };

  /*
   * ============================================================
   * AUTO SCROLL
   * ============================================================
   */

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
  }, [conversation?.conversation_id]);

  /*
   * ============================================================
   * UNREAD COUNT
   * ============================================================
   */

  const getUnreadCount = (item: Conversation) => {
    return item.messages.filter(
      (message) =>
        message.sender === "advisor" && !message.deleted && !message.seen_at,
    ).length;
  };

  /*
   * ============================================================
   * GET REPLIED MESSAGE
   * ============================================================
   */

  const getRepliedMessage = (replyTo: string | null | undefined) => {
    if (!replyTo || !conversation) {
      return null;
    }

    return (
      conversation.messages.find((message) => message.message_id === replyTo) ||
      null
    );
  };

  /*
   * ============================================================
   * LOADING SCREEN
   * ============================================================
   */

  if (loading && !conversation && conversations.length === 0) {
    return (
      <div className="h-[100dvh] min-h-screen bg-[#FAFBF7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-[#E7F1E3] border-t-[#2F8F4E] animate-spin mx-auto" />

          <p className="mt-4 text-sm text-[#176B3A]">
            Loading your advisors...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN LAYOUT
   * ============================================================
   */

  return (
    <div className="h-[100dvh] min-h-screen bg-[#FAFBF7] flex overflow-hidden text-[#173B28]">
      {/* ======================================================
          MOBILE OVERLAY
          ====================================================== */}

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close advisor menu"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
        />
      )}

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={`
          fixed
          lg:relative
          z-40
          lg:z-auto
          left-0
          top-0
          h-[100dvh]
          w-[280px]
          sm:w-[300px]
          shrink-0
          bg-white
          border-r
          border-[#DCE8DD]
          flex
          flex-col
          overflow-hidden
          transition-transform
          duration-200
          ${
            mobileSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Sidebar top */}
        <div className="shrink-0 h-[72px] px-5 flex items-center justify-between border-b border-[#DCE8DD]">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 text-[#176B3A] hover:text-[#2F8F4E] transition"
          >
            <ArrowLeft size={19} />

            <span className="font-semibold text-sm">Back</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-[#176B3A] hover:bg-[#E7F1E3]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Advisor list */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-5">
          <div className="px-2 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F4E]">
              Advisors
            </p>

            <p className="mt-1 text-xs text-[#6B7C70]">
              Choose who you want to talk to.
            </p>
          </div>

          <div className="space-y-1.5">
            {advisorTypes.map((advisorType) => {
              const isSelected = selectedAdvisor === advisorType;

              const currentConversation = conversations.find(
                (item) => item.advisor_type === advisorType,
              );

              const unreadCount = currentConversation
                ? getUnreadCount(currentConversation)
                : 0;

              return (
                <button
                  key={advisorType}
                  type="button"
                  onClick={() => handleSelectAdvisor(advisorType)}
                  className={`
                      w-full
                      text-left
                      rounded-xl
                      px-3.5
                      py-3
                      border
                      transition
                      ${
                        isSelected
                          ? "bg-[#E7F1E3] border-[#BBD8C0]"
                          : "bg-white border-transparent hover:bg-[#F3F7F1] hover:border-[#DCE8DD]"
                      }
                    `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                          w-10
                          h-10
                          shrink-0
                          rounded-full
                          flex
                          items-center
                          justify-center
                          ${
                            isSelected
                              ? "bg-[#2F8F4E] text-white"
                              : "bg-[#E7F1E3] text-[#176B3A]"
                          }
                        `}
                    >
                      <UserRound size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`
                              text-sm
                              font-semibold
                              truncate
                              ${
                                isSelected ? "text-[#176B3A]" : "text-[#173B28]"
                              }
                            `}
                        >
                          {advisorLabels[advisorType]}
                        </p>

                        {unreadCount > 0 && (
                          <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#2F8F4E] text-white text-[10px] font-bold flex items-center justify-center">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-xs leading-4 text-[#6B7C70] line-clamp-2">
                        {advisorDescriptions[advisorType]}
                      </p>

                      {currentConversation && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2F8F4E]" />

                          <span className="text-[10px] text-[#6B7C70]">
                            Conversation active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar bottom */}
        <div className="shrink-0 border-t border-[#DCE8DD] p-4">
          <div className="rounded-xl bg-[#F3F7F1] border border-[#E7F1E3] p-3">
            <div className="flex items-start gap-2">
              <MessageCircle
                size={16}
                className="mt-0.5 text-[#2F8F4E] shrink-0"
              />

              <p className="text-[11px] leading-4 text-[#53685A]">
                Your conversation is private. Choose the advisor that best
                matches your needs.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ======================================================
          CHAT
          ====================================================== */}

      <section className="flex-1 min-w-0 h-[100dvh] flex flex-col overflow-hidden">
        {/* ====================================================
            CHAT HEADER
            ==================================================== */}

        <header className="shrink-0 h-[64px] sm:h-[72px] bg-white border-b border-[#DCE8DD] px-3 sm:px-5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center bg-[#E7F1E3] text-[#176B3A] hover:bg-[#DCECD9]"
            >
              <MessageCircle size={19} />
            </button>

            <div className="w-10 h-10 rounded-full bg-[#E7F1E3] text-[#176B3A] flex items-center justify-center shrink-0">
              <UserRound size={19} />
            </div>

            <div className="min-w-0">
              <h1 className="font-semibold text-[#173B28] text-sm sm:text-base truncate">
                {advisorLabels[selectedAdvisor]}
              </h1>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F8F4E]" />

                <span className="text-[11px] sm:text-xs text-[#6B7C70]">
                  Private conversation
                </span>
              </div>
            </div>
          </div>

          <QuickExit />
        </header>

        {/* ====================================================
            NO CONVERSATION
            ==================================================== */}

        {!conversation ? (
          <main className="flex-1 min-h-0 overflow-y-auto bg-[#FAFBF7] px-4 py-8 sm:px-6">
            <div className="w-full max-w-2xl mx-auto min-h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-[#E7F1E3] text-[#2F8F4E] flex items-center justify-center mx-auto">
                  <MessageCircle size={28} />
                </div>

                <h2 className="mt-5 text-xl font-semibold text-[#173B28]">
                  Choose an advisor
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#66786B]">
                  Select an advisor from the sidebar to start or continue a
                  private conversation.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {advisorTypes.map((advisorType) => (
                    <button
                      key={advisorType}
                      type="button"
                      onClick={() => handleSelectAdvisor(advisorType)}
                      className="text-left p-3 rounded-xl bg-white border border-[#DCE8DD] hover:border-[#BBD8C0] hover:bg-[#F3F7F1] transition"
                    >
                      <p className="text-sm font-semibold text-[#173B28]">
                        {advisorLabels[advisorType]}
                      </p>

                      <p className="mt-1 text-xs text-[#6B7C70]">
                        {advisorDescriptions[advisorType]}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        ) : (
          <>
            {/* ==================================================
                MESSAGE AREA
                ================================================== */}

            <main
              ref={messagesContainerRef}
              className="
                relative
                flex-1
                min-h-0
                overflow-y-auto
                overscroll-contain
                bg-[#FAFBF7]
                px-2.5
                sm:px-4
                md:px-6
                py-3
                sm:py-5
              "
            >
              <div className="w-full max-w-4xl mx-auto">
                {/* Conversation label */}
                <div className="flex justify-center mb-5">
                  <div className="rounded-full bg-[#E7F1E3] border border-[#DCE8DD] px-3 py-1.5">
                    <p className="text-[10px] sm:text-xs text-[#176B3A]">
                      Your conversation with {advisorLabels[selectedAdvisor]}
                    </p>
                  </div>
                </div>

                {/* No messages */}
                {conversation.messages.length === 0 ? (
                  <div className="py-20 text-center">
                    <div className="w-14 h-14 rounded-full bg-[#E7F1E3] text-[#2F8F4E] flex items-center justify-center mx-auto">
                      <MessageCircle size={24} />
                    </div>

                    <h2 className="mt-4 text-base font-semibold text-[#173B28]">
                      Start your conversation
                    </h2>

                    <p className="mt-1 text-sm text-[#6B7C70]">
                      Send a message to your advisor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* ==================================================
                        MESSAGES
                        ================================================== */}

                    {conversation.messages.map((item) => {
                      /*
                       * ----------------------------------------------
                       * DELETED MESSAGE
                       * ----------------------------------------------
                       */

                      if (item.deleted) {
                        return (
                          <div
                            key={item.message_id}
                            className={`flex w-full ${
                              item.sender === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div className="max-w-[85%] rounded-2xl px-4 py-2.5 bg-[#F3F7F1] border border-[#DCE8DD]">
                              <p className="text-xs italic text-[#7A897E]">
                                Message deleted
                              </p>
                            </div>
                          </div>
                        );
                      }

                      const isUser = item.sender === "user";

                      const repliedMessage = getRepliedMessage(item.reply_to);

                      const isEditing = editingMessageId === item.message_id;

                      /*
                       * ----------------------------------------------
                       * MESSAGE ROW
                       *
                       * USER    -> RIGHT
                       * ADVISOR -> LEFT
                       * ----------------------------------------------
                       */

                      return (
                        <div
                          key={item.message_id}
                          className={`
                              flex
                              w-full
                              ${isUser ? "justify-end" : "justify-start"}
                            `}
                        >
                          <div
                            className={`
                                group
                                flex
                                flex-col
                                max-w-[85%]
                                sm:max-w-[70%]
                                md:max-w-[60%]
                                ${isUser ? "items-end" : "items-start"}
                              `}
                          >
                            {/* ========================================
                                  TELEGRAM REPLY PREVIEW
                                  ======================================== */}

                            {item.reply_to && (
                              <div
                                className={`
                                    mb-1
                                    w-full
                                    rounded-xl
                                    overflow-hidden
                                    border
                                    ${
                                      isUser
                                        ? "bg-[#DCECD9] border-[#C5DCC8]"
                                        : "bg-white border-[#DCE8DD]"
                                    }
                                  `}
                              >
                                <div className="flex">
                                  {/* Green Telegram-like reply line */}
                                  <div className="w-1 bg-[#2F8F4E] shrink-0" />

                                  <div className="px-3 py-2 min-w-0">
                                    <p className="text-[11px] font-semibold text-[#2F8F4E]">
                                      {repliedMessage?.sender === "user"
                                        ? "You"
                                        : repliedMessage?.sender === "advisor"
                                          ? advisorLabels[selectedAdvisor]
                                          : "Original message"}
                                    </p>

                                    <p className="mt-0.5 text-[11px] text-[#65766A] truncate">
                                      {repliedMessage?.text ||
                                        "Original message unavailable"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ========================================
                                  MESSAGE BUBBLE
                                  ======================================== */}

                            <div
                              className={`
                                  relative
                                  rounded-2xl
                                  px-3.5
                                  py-2
                                  sm:px-4
                                  sm:py-2.5
                                  shadow-sm
                                  ${
                                    isUser
                                      ? "bg-[#E7F1E3] text-[#173B28] rounded-br-md"
                                      : "bg-white text-[#173B28] border border-[#DCE8DD] rounded-bl-md"
                                  }
                                `}
                            >
                              {/* EDIT MODE */}
                              {isEditing ? (
                                <div className="min-w-[240px] sm:min-w-[320px]">
                                  <textarea
                                    value={editingText}
                                    onChange={(event) =>
                                      setEditingText(event.target.value)
                                    }
                                    className="
                                        w-full
                                        min-h-[90px]
                                        resize-none
                                        rounded-xl
                                        border
                                        border-[#C8D9CB]
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        text-[#173B28]
                                        outline-none
                                        focus:border-[#2F8F4E]
                                        focus:ring-2
                                        focus:ring-[#E7F1E3]
                                      "
                                  />

                                  <div className="mt-2 flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={cancelEditing}
                                      className="
                                          px-3
                                          py-1.5
                                          rounded-lg
                                          text-xs
                                          font-medium
                                          text-[#607267]
                                          hover:bg-[#F3F7F1]
                                        "
                                    >
                                      Cancel
                                    </button>

                                    <button
                                      type="button"
                                      onClick={handleSaveEdit}
                                      className="
                                          px-3
                                          py-1.5
                                          rounded-lg
                                          text-xs
                                          font-semibold
                                          bg-[#2F8F4E]
                                          text-white
                                          hover:bg-[#176B3A]
                                        "
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {/* MESSAGE TEXT */}

                                  <p className="whitespace-pre-wrap break-words text-sm leading-5">
                                    {item.text}
                                  </p>

                                  {/* MESSAGE INFO */}

                                  <div
                                    className={`
                                        mt-1
                                        flex
                                        items-center
                                        justify-end
                                        gap-1
                                        ${
                                          isUser
                                            ? "text-[#5D8067]"
                                            : "text-[#87938A]"
                                        }
                                      `}
                                  >
                                    {item.edited && (
                                      <span className="text-[9px]">edited</span>
                                    )}

                                    <span className="text-[9px]">
                                      {new Date(
                                        item.timestamp,
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>

                                    {/* SENT / SEEN */}
                                    {isUser &&
                                      (item.seen_at ? (
                                        <CheckCheck
                                          size={14}
                                          className="text-[#2F8F4E]"
                                        />
                                      ) : (
                                        <Check
                                          size={14}
                                          className="text-[#6B8571]"
                                        />
                                      ))}
                                  </div>
                                </>
                              )}
                            </div>

                            {/* ========================================
                                  ACTIONS
                                  ======================================== */}

                            {!isEditing && (
                              <div
                                className={`
                                    mt-1
                                    flex
                                    items-center
                                    gap-1
                                    opacity-100
                                    sm:opacity-0
                                    sm:group-hover:opacity-100
                                    transition
                                    ${isUser ? "justify-end" : "justify-start"}
                                  `}
                              >
                                {/* Reply */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleReply(
                                      item.message_id!,
                                      item.text,
                                      item.sender,
                                    )
                                  }
                                  className="
                                      inline-flex
                                      items-center
                                      gap-1
                                      px-2
                                      py-1
                                      rounded-md
                                      text-[10px]
                                      font-medium
                                      text-[#176B3A]
                                      hover:bg-[#E7F1E3]
                                    "
                                >
                                  <Reply size={11} />
                                  Reply
                                </button>

                                {/* Edit + Delete */}
                                {isUser && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startEditing(
                                          item.message_id!,
                                          item.text,
                                        )
                                      }
                                      className="
                                          inline-flex
                                          items-center
                                          gap-1
                                          px-2
                                          py-1
                                          rounded-md
                                          text-[10px]
                                          font-medium
                                          text-[#176B3A]
                                          hover:bg-[#E7F1E3]
                                        "
                                    >
                                      <Edit3 size={11} />
                                      Edit
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteMessage(item.message_id!)
                                      }
                                      className="
                                          inline-flex
                                          items-center
                                          gap-1
                                          px-2
                                          py-1
                                          rounded-md
                                          text-[10px]
                                          font-medium
                                          text-red-600
                                          hover:bg-red-50
                                        "
                                    >
                                      <Trash2 size={11} />
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </main>

            {/* ==================================================
                REPLY COMPOSER PREVIEW
                ================================================== */}

            {replyingTo && (
              <div className="shrink-0 bg-white border-t border-[#DCE8DD] px-3 sm:px-5 py-2.5">
                <div className="w-full max-w-4xl mx-auto flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#E7F1E3] text-[#2F8F4E] flex items-center justify-center shrink-0">
                    <Reply size={15} />
                  </div>

                  <div className="min-w-0 flex-1 border-l-2 border-[#2F8F4E] pl-3">
                    <p className="text-[10px] font-semibold text-[#176B3A]">
                      Replying to{" "}
                      {replyingTo.sender === "user"
                        ? "your message"
                        : advisorLabels[selectedAdvisor]}
                    </p>

                    <p className="text-xs text-[#65766A] truncate mt-0.5">
                      {replyingTo.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelReply}
                    className="
                      w-8
                      h-8
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      text-[#6B7C70]
                      hover:bg-[#F3F7F1]
                      hover:text-[#173B28]
                    "
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>
            )}

            {/* ==================================================
                MESSAGE COMPOSER
                ================================================== */}

            <footer className="shrink-0 bg-white border-t border-[#DCE8DD] px-2.5 sm:px-4 md:px-6 py-2.5 sm:py-3">
              <div className="w-full max-w-4xl mx-auto">
                <div
                  className="
                  flex
                  items-end
                  gap-2
                  rounded-2xl
                  border
                  border-[#D5E2D7]
                  bg-[#F3F7F1]
                  p-1.5
                  sm:p-2
                  focus-within:border-[#A9C9AF]
                  focus-within:ring-2
                  focus-within:ring-[#E7F1E3]
                "
                >
                  <textarea
                    id="user-chat-composer"
                    ref={composerRef}
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    onKeyDown={handleComposerKeyDown}
                    placeholder={
                      replyingTo ? "Write your reply..." : "Write a message..."
                    }
                    rows={1}
                    className="
                      flex-1
                      resize-none
                      bg-transparent
                      outline-none
                      border-none
                      px-2
                      py-2
                      text-sm
                      text-[#173B28]
                      placeholder:text-[#829087]
                      max-h-28
                    "
                  />

                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={sending || !messageText.trim()}
                    className="
                      w-10
                      h-10
                      shrink-0
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      bg-[#2F8F4E]
                      text-white
                      hover:bg-[#176B3A]
                      disabled:opacity-40
                      disabled:cursor-not-allowed
                      transition
                    "
                    aria-label="Send message"
                  >
                    <Send size={17} />
                  </button>
                </div>

                <p className="text-[9px] sm:text-[10px] text-[#8A978E] mt-1.5 px-1">
                  Press Enter to send · Shift + Enter for a new line
                </p>
              </div>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}

export default UserAdvisorChat;