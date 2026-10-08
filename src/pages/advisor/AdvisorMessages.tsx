import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

const COLORS = {
  background: "#FAFBF7",
  surface: "#FFFFFF",
  mint: "#E7F1E3",
  leaf: "#2F8F4E",
  forest: "#176B3A",
  ink: "#173B28",
  muted: "#6B7D70",
  border: "#DCE8DD",
  soft: "#F3F7F1",
  danger: "#C94B4B",
};

interface Message {
  message_id: string;
  sender: "admin" | "advisor";
  text: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  deletedForAdmin?: boolean;
  deletedForAdvisor?: boolean;
  deletedForEveryone?: boolean;
  deliveredAt?: string;
  readAt?: string;
}

interface Conversation {
  conversation_id: string;
  admin_id: string;
  advisor_id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

interface ConversationResponse {
  conversation: Conversation;
}

type DeleteType = "me" | "everyone";

function AdvisorMessages() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [messageMenuId, setMessageMenuId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    message: Message;
    type: DeleteType;
  } | null>(null);

  const [deleteConversationModal, setDeleteConversationModal] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedConversation = useMemo(() => {
    return conversations.find(
      (conversation) => conversation.conversation_id === selectedConversationId,
    );
  }, [conversations, selectedConversationId]);

  /*
   * ------------------------------------------------------------
   * AUTH
   * ------------------------------------------------------------
   */

  const getToken = () => {
    return localStorage.getItem("advisor_token");
  };

  const logout = useCallback(() => {
    localStorage.removeItem("advisor_token");
    localStorage.removeItem("advisor_profile");
    navigate("/advisor/login");
  }, [navigate]);

  /*
   * ------------------------------------------------------------
   * LOAD CONVERSATIONS
   * ------------------------------------------------------------
   */

  const loadConversations = useCallback(async () => {
    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get<ConversationsResponse>(
        `${API_URL}/advisor/admin-conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setConversations(response.data.conversations || []);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout();
        return;
      }

      setError(
        err?.response?.data?.message ||
          "Unable to load your conversations. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /*
   * ------------------------------------------------------------
   * LOAD SELECTED CONVERSATION
   * ------------------------------------------------------------
   */

  const loadConversation = useCallback(
    async (conversationId: string) => {
      const token = getToken();

      if (!token) {
        logout();
        return;
      }

      try {
        setChatLoading(true);

        const response = await axios.get<ConversationResponse>(
          `${API_URL}/advisor/admin-conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const conversation = response.data.conversation;

        setConversations((previous) =>
          previous.map((item) =>
            item.conversation_id === conversation.conversation_id
              ? conversation
              : item,
          ),
        );
      } catch (err: any) {
        if (err?.response?.status === 401) {
          logout();
          return;
        }

        setError(
          err?.response?.data?.message || "Unable to open this conversation.",
        );
      } finally {
        setChatLoading(false);
      }
    },
    [logout],
  );

  /*
   * ------------------------------------------------------------
   * SELECT CONVERSATION
   * ------------------------------------------------------------
   */

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMessageMenuId(null);
    setEditingMessageId(null);
    setMessageText("");

    await loadConversation(conversationId);
  };

  /*
   * ------------------------------------------------------------
   * SOCKET CONNECTION
   * ------------------------------------------------------------
   */

  useEffect(() => {
    const token = getToken();

    if (!token) {
      logout();
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);

      if (selectedConversationId) {
        socket.emit("join_conversation", {
          conversation_id: selectedConversationId,
        });
      }
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setSocketConnected(false);
    });

    socket.on(
      "new_message",
      (
        message: Message & {
          conversation_id?: string;
        },
      ) => {
        const conversationId = message.conversation_id;

        if (!conversationId) return;

        setConversations((previous) =>
          previous.map((conversation) => {
            if (conversation.conversation_id !== conversationId) {
              return conversation;
            }

            const alreadyExists = conversation.messages.some(
              (item) => item.message_id === message.message_id,
            );

            if (alreadyExists) {
              return conversation;
            }

            return {
              ...conversation,
              messages: [...conversation.messages, message],
              updatedAt: message.timestamp,
            };
          }),
        );

        if (
          selectedConversationId === conversationId &&
          message.sender === "admin"
        ) {
          socket.emit("mark_message_delivered", {
            message_id: message.message_id,
            conversation_id: conversationId,
          });

          socket.emit("mark_message_read", {
            message_id: message.message_id,
            conversation_id: conversationId,
          });
        }
      },
    );

    socket.on("message_edited", (updatedMessage: Message) => {
      setConversations((previous) =>
        previous.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.message_id === updatedMessage.message_id
              ? updatedMessage
              : message,
          ),
        })),
      );
    });

    socket.on("message_deleted_for_me", (data: any) => {
      setConversations((previous) =>
        previous.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,
                  deleted: true,
                  deletedForAdvisor: true,
                }
              : message,
          ),
        })),
      );
    });

    socket.on("message_deleted_for_everyone", (data: any) => {
      setConversations((previous) =>
        previous.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,
                  deleted: true,
                  deletedForEveryone: true,
                  text: "",
                }
              : message,
          ),
        })),
      );
    });

    socket.on("message_deleted", (data: any) => {
      setConversations((previous) =>
        previous.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,
                  deleted: true,
                  text: "",
                }
              : message,
          ),
        })),
      );
    });

    socket.on("message_delivered", (data: any) => {
      setConversations((previous) =>
        previous.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,
                  deliveredAt: data.deliveredAt || new Date().toISOString(),
                }
              : message,
          ),
        })),
      );
    });

    socket.on("message_read", (data: any) => {
      setConversations((previous) =>
        previous.map((conversation) => ({
          ...conversation,
          messages: conversation.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,
                  readAt: data.readAt || new Date().toISOString(),
                }
              : message,
          ),
        })),
      );
    });

    socket.on("conversation_deleted", (data: any) => {
      const conversationId = data?.conversation_id;

      setConversations((previous) =>
        previous.filter(
          (conversation) => conversation.conversation_id !== conversationId,
        ),
      );

      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
      }
    });

    socket.on("message_error", (data: any) => {
      setError(data?.message || "Something went wrong with the message.");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [logout]);

  /*
   * ------------------------------------------------------------
   * JOIN CONVERSATION
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!selectedConversationId || !socketRef.current) return;

    socketRef.current.emit("join_conversation", {
      conversation_id: selectedConversationId,
    });
  }, [selectedConversationId, socketConnected]);

  /*
   * ------------------------------------------------------------
   * MARK ADMIN MESSAGES READ
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!selectedConversation) return;
    if (!socketRef.current) return;

    selectedConversation.messages.forEach((message) => {
      if (message.sender === "admin" && !message.readAt && !message.deleted) {
        socketRef.current?.emit("mark_message_delivered", {
          message_id: message.message_id,
          conversation_id: selectedConversation.conversation_id,
        });

        socketRef.current?.emit("mark_message_read", {
          message_id: message.message_id,
          conversation_id: selectedConversation.conversation_id,
        });
      }
    });
  }, [selectedConversation]);

  /*
   * ------------------------------------------------------------
   * AUTO SCROLL
   * ------------------------------------------------------------
   */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedConversation?.messages.length]);

  /*
   * ------------------------------------------------------------
   * FILTER CONVERSATIONS
   * ------------------------------------------------------------ */

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) => {
      const lastMessage =
        conversation.messages[conversation.messages.length - 1];

      return (
        "safelink administrator".includes(query) ||
        lastMessage?.text?.toLowerCase().includes(query)
      );
    });
  }, [conversations, search]);

  /*
   * ------------------------------------------------------------
   * MESSAGE HELPERS
   * ------------------------------------------------------------
   */

  const visibleMessages = useMemo(() => {
    if (!selectedConversation) return [];

    return selectedConversation.messages.filter((message) => {
      if (message.deletedForAdvisor) return false;
      return true;
    });
  }, [selectedConversation]);

  const unreadCount = (conversation: Conversation) => {
    return conversation.messages.filter(
      (message) =>
        message.sender === "admin" &&
        !message.readAt &&
        !message.deleted &&
        !message.deletedForAdvisor,
    ).length;
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "";

    return new Intl.DateTimeFormat([], {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const formatListTime = (timestamp?: string) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) {
      return formatTime(timestamp);
    }

    return new Intl.DateTimeFormat([], {
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  const formatDateLabel = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear();

    if (sameDay(date, today)) return "Today";
    if (sameDay(date, yesterday)) return "Yesterday";

    return new Intl.DateTimeFormat([], {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;

    const current = visibleMessages[index];
    const previous = visibleMessages[index - 1];

    const currentDate = new Date(current.timestamp);
    const previousDate = new Date(previous.timestamp);

    return (
      currentDate.getDate() !== previousDate.getDate() ||
      currentDate.getMonth() !== previousDate.getMonth() ||
      currentDate.getFullYear() !== previousDate.getFullYear()
    );
  };

  /*
   * ------------------------------------------------------------
   * SEND MESSAGE
   * ------------------------------------------------------------
   */

  const sendMessage = () => {
    const text = messageText.trim();

    if (!text) return;
    if (!selectedConversation) return;
    if (!socketRef.current) return;

    setSending(true);
    setError("");

    if (editingMessageId) {
      socketRef.current.emit("edit_message", {
        conversation_id: selectedConversation.conversation_id,
        message_id: editingMessageId,
        text,
      });

      setEditingMessageId(null);
      setMessageText("");
      setSending(false);
      return;
    }

    socketRef.current.emit("send_message", {
      conversation_id: selectedConversation.conversation_id,
      text,
    });

    setMessageText("");
    setSending(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  /*
   * ------------------------------------------------------------
   * KEYBOARD
   * ------------------------------------------------------------
   */

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  /*
   * ------------------------------------------------------------
   * EDIT
   * ------------------------------------------------------------
   */

  const startEditing = (message: Message) => {
    if (message.sender !== "advisor") return;
    if (message.deleted) return;

    setEditingMessageId(message.message_id);
    setMessageText(message.text);
    setMessageMenuId(null);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setMessageText("");
  };

  /*
   * ------------------------------------------------------------
   * DELETE MESSAGE
   * ------------------------------------------------------------
   */

  const deleteMessage = () => {
    if (!deleteTarget) return;
    if (!selectedConversation) return;
    if (!socketRef.current) return;

    socketRef.current.emit("delete_message", {
      conversation_id: selectedConversation.conversation_id,
      message_id: deleteTarget.message.message_id,
      delete_type: deleteTarget.type,
    });

    setDeleteTarget(null);
    setMessageMenuId(null);
  };

  /*
   * ------------------------------------------------------------
   * DELETE CONVERSATION
   * ------------------------------------------------------------
   */

  const deleteConversation = () => {
    if (!selectedConversation) return;
    if (!socketRef.current) return;

    socketRef.current.emit("delete_conversation", {
      conversation_id: selectedConversation.conversation_id,
    });

    setDeleteConversationModal(false);
  };

  /*
   * ------------------------------------------------------------
   * MESSAGE MENU
   * ------------------------------------------------------------
   */

  const handleMessageMenu = (messageId: string) => {
    setMessageMenuId((current) => (current === messageId ? null : messageId));
  };

  /*
   * ------------------------------------------------------------
   * LAST MESSAGE
   * ------------------------------------------------------------
   */

  const getLastMessage = (conversation: Conversation) => {
    const last = conversation.messages[conversation.messages.length - 1];

    if (!last) {
      return "Start a conversation";
    }

    if (last.deleted || last.deletedForAdvisor) {
      return "Message deleted";
    }

    return last.text;
  };

  /*
   * ------------------------------------------------------------
   * LOADING
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: COLORS.background }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
            style={{
              borderColor: COLORS.mint,
              borderTopColor: COLORS.leaf,
            }}
          />

          <p className="font-medium" style={{ color: COLORS.ink }}>
            Loading your messages...
          </p>

          <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
            Connecting you to SafeLink
          </p>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * MAIN UI
   * ------------------------------------------------------------
   */

  return (
    <div
      className="h-[calc(100vh-0px)] min-h-screen flex overflow-hidden"
      style={{ background: COLORS.background }}
      onClick={() => setMessageMenuId(null)}
    >
      {/* =====================================================
          LEFT SIDEBAR
      ===================================================== */}

      <aside
        className={`w-full md:w-[350px] lg:w-[380px] flex-shrink-0 border-r flex flex-col ${
          selectedConversation ? "hidden md:flex" : "flex"
        }`}
        style={{
          background: COLORS.surface,
          borderColor: COLORS.border,
        }}
      >
        {/* Sidebar Header */}

        <div
          className="px-5 pt-6 pb-4 border-b"
          style={{ borderColor: COLORS.border }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: COLORS.ink }}>
                Messages
              </h1>

              <p className="text-sm mt-1" style={{ color: COLORS.muted }}>
                Private communication with SafeLink
              </p>
            </div>

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: COLORS.mint }}
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.forest}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
              </svg>
            </div>
          </div>

          {/* Search */}

          {/* <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={COLORS.muted}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-3 rounded-xl outline-none text-sm border"
              style={{
                background: COLORS.soft,
                borderColor: COLORS.border,
                color: COLORS.ink,
              }}
            />
          </div> */}
        </div>

        {/* Connection status */}

        {/* Conversation List */}

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div
              className="mx-4 mt-4 p-3 rounded-xl text-sm"
              style={{
                background: "#FDECEC",
                color: COLORS.danger,
              }}
            >
              <div className="flex items-start gap-2">
                <span>!</span>
                <span>{error}</span>
              </div>

              <button
                onClick={loadConversations}
                className="mt-2 text-xs font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          {filteredConversations.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: COLORS.mint }}
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.forest}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                </svg>
              </div>

              <h3 className="font-semibold" style={{ color: COLORS.ink }}>
                {search ? "No conversations found" : "No conversations yet"}
              </h3>

              <p
                className="text-sm mt-2 leading-6"
                style={{ color: COLORS.muted }}
              >
                {search
                  ? "Try another search term."
                  : "Your administrator conversations will appear here."}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];

              const unread = unreadCount(conversation);

              const isSelected =
                selectedConversationId === conversation.conversation_id;

              return (
                <button
                  key={conversation.conversation_id}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleSelectConversation(conversation.conversation_id);
                  }}
                  className="w-full text-left px-4 py-3.5 flex gap-3 transition-all border-b"
                  style={{
                    background: isSelected ? COLORS.mint : COLORS.surface,
                    borderColor: COLORS.border,
                  }}
                >
                  {/* Avatar */}

                  <div className="relative flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                      style={{
                        background: COLORS.forest,
                        color: "#FFFFFF",
                      }}
                    >
                      SA
                    </div>

                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2"
                      style={{
                        background: socketConnected
                          ? COLORS.leaf
                          : COLORS.muted,
                        borderColor: COLORS.surface,
                      }}
                    />
                  </div>

                  {/* Content */}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="font-semibold truncate"
                          style={{ color: COLORS.ink }}
                        >
                          SafeLink Administrator
                        </span>

                        <span
                          title="Official SafeLink account"
                          className="flex-shrink-0"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill={COLORS.leaf}
                          >
                            <path d="M12 2l2.3 2.3 3.2-.1.8 3.1 2.7 1.7-1.5 2.8 1.1 3-2.9 1.4-.5 3.2-3.2-.4L12 22l-2.3-2.3-3.2.1-.8-3.1L3 15l1.5-2.8-1.1-3 2.9-1.4.5-3.2 3.2.4L12 2z" />
                            <path
                              d="m9 12 2 2 4-4"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                            />
                          </svg>
                        </span>
                      </div>

                      {lastMessage && (
                        <span
                          className="text-[11px] flex-shrink-0"
                          style={{ color: COLORS.muted }}
                        >
                          {formatListTime(lastMessage.timestamp)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p
                        className={`text-sm truncate ${
                          unread > 0 ? "font-semibold" : ""
                        }`}
                        style={{
                          color: unread > 0 ? COLORS.ink : COLORS.muted,
                        }}
                      >
                        {getLastMessage(conversation)}
                      </p>

                      {unread > 0 && (
                        <span
                          className="min-w-[21px] h-[21px] px-1.5 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                          style={{
                            background: COLORS.leaf,
                            color: "#FFFFFF",
                          }}
                        >
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
      </aside>

      {/* =====================================================
          RIGHT CHAT
      ===================================================== */}

      <main
        className={`flex-1 min-w-0 ${
          selectedConversation ? "flex" : "hidden md:flex"
        } flex-col`}
        style={{ background: COLORS.background }}
      >
        {!selectedConversation ? (
          /* =================================================
             WELCOME SCREEN
          ================================================= */

          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-md text-center">
              <div className="relative inline-block mb-6">
                <div
                  className="w-24 h-24 rounded-[28px] flex items-center justify-center"
                  style={{ background: COLORS.mint }}
                >
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={COLORS.forest}
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    <path d="M8 10h8" />
                    <path d="M8 14h5" />
                  </svg>
                </div>

                <div
                  className="absolute -right-2 -bottom-2 w-9 h-9 rounded-full border-4 flex items-center justify-center"
                  style={{
                    background: COLORS.leaf,
                    borderColor: COLORS.background,
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <h2 className="text-2xl font-bold" style={{ color: COLORS.ink }}>
                Your SafeLink Messages
              </h2>

              <p className="mt-3 leading-7" style={{ color: COLORS.muted }}>
                Select the SafeLink Administrator conversation to communicate
                privately with the administration team.
              </p>

              <div
                className="mt-7 p-4 rounded-2xl border text-left"
                style={{
                  background: COLORS.surface,
                  borderColor: COLORS.border,
                }}
              >
                <div className="flex gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: COLORS.mint }}
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={COLORS.forest}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="10" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                  </div>

                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: COLORS.ink }}
                    >
                      Private communication
                    </p>

                    <p
                      className="text-xs mt-1 leading-5"
                      style={{ color: COLORS.muted }}
                    >
                      Use this space for official communication, questions, and
                      support from SafeLink administration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
               CHAT HEADER
            ================================================= */}

            <header
              className="h-[78px] px-4 md:px-6 flex items-center justify-between border-b flex-shrink-0"
              style={{
                background: COLORS.surface,
                borderColor: COLORS.border,
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Mobile back */}

                <button
                  onClick={() => {
                    setSelectedConversationId(null);
                    setEditingMessageId(null);
                    setMessageText("");
                  }}
                  className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: COLORS.soft }}
                  aria-label="Back to conversations"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={COLORS.ink}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>

                <div className="relative">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{
                      background: COLORS.forest,
                      color: "#FFFFFF",
                    }}
                  >
                    SA
                  </div>

                  <span
                    className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2"
                    style={{
                      background: socketConnected ? COLORS.leaf : COLORS.muted,
                      borderColor: COLORS.surface,
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2
                      className="font-bold truncate"
                      style={{ color: COLORS.ink }}
                    >
                      SafeLink Administrator
                    </h2>

                    <span
                      className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        background: COLORS.mint,
                        color: COLORS.forest,
                      }}
                    >
                      OFFICIAL
                    </span>
                  </div>

                  <p className="text-xs mt-0.5" style={{ color: COLORS.muted }}>
                    {socketConnected
                      ? "Online • Secure communication"
                      : "Connecting..."}
                  </p>
                </div>
              </div>

              <button
                onClick={(event) => {
                  event.stopPropagation();
                  setDeleteConversationModal(true);
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-red-50"
                title="Delete conversation"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.muted}
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14H6L5 6" />
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                  <path d="M9 6V4h6v2" />
                </svg>
              </button>
            </header>

            {/* =================================================
               CHAT BODY
            ================================================= */}

            <div
              className="flex-1 overflow-y-auto px-3 md:px-8 py-5"
              onClick={() => setMessageMenuId(null)}
            >
              {/* Security notice */}

              <div className="flex justify-center mb-6">
                <div
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs"
                  style={{
                    background: COLORS.mint,
                    color: COLORS.forest,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  This is a private SafeLink conversation
                </div>
              </div>

              {chatLoading ? (
                <div className="flex justify-center py-10">
                  <div
                    className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin"
                    style={{
                      borderColor: COLORS.mint,
                      borderTopColor: COLORS.leaf,
                    }}
                  />
                </div>
              ) : visibleMessages.length === 0 ? (
                <div className="flex justify-center py-20">
                  <div className="text-center max-w-sm">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: COLORS.mint }}
                    >
                      <svg
                        width="27"
                        height="27"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={COLORS.forest}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                      </svg>
                    </div>

                    <h3 className="font-bold" style={{ color: COLORS.ink }}>
                      Start the conversation
                    </h3>

                    <p
                      className="text-sm mt-2 leading-6"
                      style={{ color: COLORS.muted }}
                    >
                      Send a message to the SafeLink Administrator. Your
                      communication will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {visibleMessages.map((message, index) => {
                    const isAdvisor = message.sender === "advisor";

                    return (
                      <div key={message.message_id}>
                        {shouldShowDate(index) && (
                          <div className="flex justify-center my-5">
                            <span
                              className="px-3 py-1.5 rounded-full text-[11px] font-medium"
                              style={{
                                background: COLORS.surface,
                                color: COLORS.muted,
                                border: `1px solid ${COLORS.border}`,
                              }}
                            >
                              {formatDateLabel(message.timestamp)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex mb-2 ${
                            isAdvisor ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`flex items-end gap-2 max-w-[88%] sm:max-w-[75%] ${
                              isAdvisor ? "flex-row-reverse" : "flex-row"
                            }`}
                          >
                            {/* Admin avatar */}

                            {!isAdvisor && (
                              <div
                                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold mb-1"
                                style={{
                                  background: COLORS.forest,
                                  color: "#FFFFFF",
                                }}
                              >
                                SA
                              </div>
                            )}

                            {/* Bubble */}

                            <div
                              className="relative group"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <div
                                className="px-4 py-2.5 rounded-2xl shadow-sm"
                                style={{
                                  background: isAdvisor
                                    ? COLORS.forest
                                    : COLORS.surface,
                                  color: isAdvisor ? "#FFFFFF" : COLORS.ink,
                                  border: isAdvisor
                                    ? "none"
                                    : `1px solid ${COLORS.border}`,
                                  borderBottomRightRadius: isAdvisor
                                    ? "5px"
                                    : undefined,
                                  borderBottomLeftRadius: !isAdvisor
                                    ? "5px"
                                    : undefined,
                                }}
                              >
                                {message.deleted ||
                                message.deletedForEveryone ? (
                                  <p
                                    className="text-sm italic"
                                    style={{
                                      color: isAdvisor
                                        ? "rgba(255,255,255,.65)"
                                        : COLORS.muted,
                                    }}
                                  >
                                    This message was deleted
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-sm whitespace-pre-wrap break-words leading-6">
                                      {message.text}
                                    </p>

                                    <div
                                      className={`flex items-center justify-end gap-1.5 mt-1 ${
                                        isAdvisor ? "text-white/60" : ""
                                      }`}
                                      style={{
                                        color: isAdvisor
                                          ? undefined
                                          : COLORS.muted,
                                      }}
                                    >
                                      {message.edited && (
                                        <span className="text-[10px]">
                                          edited
                                        </span>
                                      )}

                                      <span className="text-[10px]">
                                        {formatTime(message.timestamp)}
                                      </span>

                                      {isAdvisor && (
                                        <span className="inline-flex items-center">
                                          {message.readAt ? (
                                            <svg
                                              width="16"
                                              height="12"
                                              viewBox="0 0 24 18"
                                              fill="none"
                                            >
                                              <path
                                                d="M1 9l5 5L15 5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                              <path
                                                d="M9 9l5 5L23 5"
                                                stroke="#9BE7B0"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          ) : message.deliveredAt ? (
                                            <svg
                                              width="16"
                                              height="12"
                                              viewBox="0 0 24 18"
                                              fill="none"
                                            >
                                              <path
                                                d="M1 9l5 5L15 5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                              <path
                                                d="M9 9l5 5L23 5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          ) : (
                                            <svg
                                              width="15"
                                              height="12"
                                              viewBox="0 0 24 18"
                                              fill="none"
                                            >
                                              <path
                                                d="M1 9l5 5L15 5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                              />
                                            </svg>
                                          )}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>

                              {/* Message menu button */}

                              {!message.deleted &&
                                message.sender === "advisor" && (
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleMessageMenu(message.message_id);
                                    }}
                                    className="absolute -left-10 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center"
                                    style={{
                                      background: COLORS.surface,
                                      border: `1px solid ${COLORS.border}`,
                                    }}
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke={COLORS.muted}
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="5" cy="12" r="1" />
                                      <circle cx="12" cy="12" r="1" />
                                      <circle cx="19" cy="12" r="1" />
                                    </svg>
                                  </button>
                                )}

                              {/* Menu */}

                              {messageMenuId === message.message_id &&
                                message.sender === "advisor" && (
                                  <div
                                    className="absolute right-0 top-full mt-2 z-30 w-40 rounded-xl shadow-xl border overflow-hidden"
                                    style={{
                                      background: COLORS.surface,
                                      borderColor: COLORS.border,
                                    }}
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => startEditing(message)}
                                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50"
                                      style={{
                                        color: COLORS.ink,
                                      }}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M12 20h9" />
                                        <path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4Z" />
                                      </svg>
                                      Edit
                                    </button>

                                    <button
                                      onClick={() => {
                                        setDeleteTarget({
                                          message,
                                          type: "me",
                                        });
                                        setMessageMenuId(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50"
                                      style={{
                                        color: COLORS.ink,
                                      }}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                      </svg>
                                      Delete for me
                                    </button>

                                    <button
                                      onClick={() => {
                                        setDeleteTarget({
                                          message,
                                          type: "everyone",
                                        });
                                        setMessageMenuId(null);
                                      }}
                                      className="w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-red-50"
                                      style={{
                                        color: COLORS.danger,
                                      }}
                                    >
                                      <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M3 6h18" />
                                        <path d="M19 6l-1 14H6L5 6" />
                                        <path d="M10 11v5" />
                                        <path d="M14 11v5" />
                                      </svg>
                                      Delete for everyone
                                    </button>
                                  </div>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* =================================================
               COMPOSER
            ================================================= */}

            <div
              className="px-3 md:px-6 py-3 border-t flex-shrink-0"
              style={{
                background: COLORS.surface,
                borderColor: COLORS.border,
              }}
            >
              <div className="max-w-4xl mx-auto">
                {editingMessageId && (
                  <div
                    className="mb-2 px-3 py-2 rounded-xl flex items-center justify-between"
                    style={{
                      background: COLORS.mint,
                      color: COLORS.forest,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 013 3L8 18l-4 1 1-4Z" />
                      </svg>

                      <span className="text-xs font-semibold">
                        Editing message
                      </span>
                    </div>

                    <button
                      onClick={cancelEditing}
                      className="text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <div
                    className="flex-1 rounded-2xl border flex items-end"
                    style={{
                      background: COLORS.soft,
                      borderColor: COLORS.border,
                    }}
                  >
                    <textarea
                      ref={textareaRef}
                      value={messageText}
                      onChange={(event) => {
                        setMessageText(event.target.value);

                        event.target.style.height = "auto";
                        event.target.style.height = `${Math.min(
                          event.target.scrollHeight,
                          130,
                        )}px`;
                      }}
                      onKeyDown={handleTextareaKeyDown}
                      placeholder={
                        editingMessageId
                          ? "Edit your message..."
                          : "Write a message..."
                      }
                      rows={1}
                      className="flex-1 bg-transparent outline-none resize-none px-4 py-3 text-sm leading-6 max-h-[130px]"
                      style={{
                        color: COLORS.ink,
                      }}
                    />
                  </div>

                  <button
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sending}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                    style={{
                      background: COLORS.forest,
                      color: "#FFFFFF",
                    }}
                    title={editingMessageId ? "Save changes" : "Send message"}
                  >
                    {editingMessageId ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 2L11 13" />
                        <path d="M22 2l-7 20-4-9-9-4Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* =====================================================
          DELETE MESSAGE MODAL
      ===================================================== */}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(23, 59, 40, 0.25)" }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: COLORS.surface,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#FDECEC" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.danger}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            </div>

            <h3 className="text-lg font-bold" style={{ color: COLORS.ink }}>
              Delete message?
            </h3>

            <p
              className="text-sm mt-2 leading-6"
              style={{ color: COLORS.muted }}
            >
              {deleteTarget.type === "everyone"
                ? "This message will be removed for everyone in the conversation."
                : "This message will be removed from your view."}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.ink,
                  background: COLORS.surface,
                }}
              >
                Cancel
              </button>

              <button
                onClick={deleteMessage}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{
                  background: COLORS.danger,
                  color: "#FFFFFF",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DELETE CONVERSATION MODAL
      ===================================================== */}

      {deleteConversationModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(23, 59, 40, 0.25)" }}
          onClick={() => setDeleteConversationModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: COLORS.surface,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ background: "#FDECEC" }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke={COLORS.danger}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
            </div>

            <h3 className="text-lg font-bold" style={{ color: COLORS.ink }}>
              Delete conversation?
            </h3>

            <p
              className="text-sm mt-2 leading-6"
              style={{ color: COLORS.muted }}
            >
              This will remove the conversation from your messaging list. This
              action cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConversationModal(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm border"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.ink,
                  background: COLORS.surface,
                }}
              >
                Cancel
              </button>

              <button
                onClick={deleteConversation}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                style={{
                  background: COLORS.danger,
                  color: "#FFFFFF",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdvisorMessages;
