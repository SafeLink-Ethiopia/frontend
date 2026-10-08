import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  Check,
  CheckCheck,
  Copy,
  Edit3,
  MoreVertical,
  Reply,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";

import socket from "../../services/socket";

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

  replyTo?: {
    message_id: string;
    text: string;
    sender: "admin" | "advisor";
  };
}

interface Conversation {
  conversation_id: string;
  admin_id: string;
  advisor_id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;

  deletedForAdmin?: boolean;
  deletedForAdvisor?: boolean;
}

interface AdvisorInfo {
  advisor_id: string;
  name: string;
  email?: string;
  active?: boolean;
}

interface ConversationResponse {
  conversation: Conversation;
  advisor?: AdvisorInfo;
}

type DeleteType = "me" | "everyone";

const API_URL = "http://localhost:5000/api";

const getInitials = (name?: string, fallback = "A") => {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const isGone = (message: Message) =>
  Boolean(
    message.deleted || message.deletedForAdmin || message.deletedForEveryone,
  );

export default function AdminAdvisorChat() {
  const { advisorId } = useParams<{ advisorId: string }>();
  const navigate = useNavigate();

  const adminToken = localStorage.getItem("adminToken");

  /* Refs */
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  /* Conversation */
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [advisor, setAdvisor] = useState<AdvisorInfo | null>(null);

  /* Input */
  const [messageText, setMessageText] = useState("");

  /* Editing */
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  /* Reply */
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  /* Per-message menu */
  const [openMessageMenu, setOpenMessageMenu] = useState<string | null>(null);

  /* Select-to-delete mode (same as advisor page) */
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  /* Delete modal (one or many messages) */
  const [deleteTargets, setDeleteTargets] = useState<Message[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* Header menu */
  const [showConversationMenu, setShowConversationMenu] = useState(false);
  const [showDeleteConversationModal, setShowDeleteConversationModal] =
    useState(false);

  /* Search */
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  /* Status */
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState("");

  /* Typing */
  const [typing, setTyping] = useState(false);

  /* Scroll */
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  /* ================================================================ */
  /* LOAD CONVERSATION                                                */
  /* ================================================================ */

  useEffect(() => {
    const fetchConversation = async () => {
      if (!advisorId) {
        setError("Advisor ID is missing.");
        setLoading(false);
        return;
      }

      if (!adminToken) {
        setError("Admin authentication required.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await axios.get<ConversationResponse>(
          `${API_URL}/admin-advisor-conversations/advisor/${advisorId}`,
          { headers: { Authorization: `Bearer ${adminToken}` } },
        );

        setConversation(response.data.conversation);

        if (response.data.advisor) {
          setAdvisor(response.data.advisor);
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
            return;
          }

          setError(
            err.response?.data?.message || "Failed to load conversation.",
          );
        } else {
          setError("Something went wrong while loading the conversation.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [advisorId, adminToken, navigate]);

  /* ================================================================ */
  /* SOCKET CONNECTION STATUS                                         */
  /* ================================================================ */

  useEffect(() => {
    const handleConnect = () => {
      setConnected(true);
      setError("");
    };

    const handleDisconnect = () => setConnected(false);

    const handleConnectError = (socketError: Error) => {
      console.error("Socket connection error:", socketError);
      setConnected(false);
      setError("Could not connect to the messaging server.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  /* ================================================================ */
  /* JOIN CONVERSATION + SOCKET EVENTS                                */
  /* ================================================================ */

  useEffect(() => {
    if (!conversation?.conversation_id) {
      return;
    }

    const conversationId = conversation.conversation_id;

    const joinConversation = () => {
      socket.emit("join_conversation", conversationId);
    };

    const handleNewMessage = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (data.conversation_id !== conversationId) return;

      setConversation((current) => {
        if (!current) return current;

        if (
          current.messages.some(
            (message) => message.message_id === data.message.message_id,
          )
        ) {
          return current;
        }

        return {
          ...current,
          messages: [...current.messages, data.message],
          updatedAt: data.message.timestamp,
        };
      });

      if (data.message.sender === "advisor") {
        socket.emit("mark_message_delivered", {
          conversation_id: conversationId,
          message_id: data.message.message_id,
        });
      }

      if (data.message.sender === "admin") {
        setSending(false);
      }
    };

    /* Edited: only text + edited flag change; timestamp / ticks preserved */
    const handleMessageEdited = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (data.conversation_id !== conversationId) return;

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((message) =>
            message.message_id !== data.message.message_id
              ? message
              : {
                  ...message,
                  text: data.message.text ?? message.text,
                  edited: true,
                  timestamp: message.timestamp,
                  deliveredAt: data.message.deliveredAt ?? message.deliveredAt,
                  readAt: data.message.readAt ?? message.readAt,
                  replyTo: data.message.replyTo ?? message.replyTo,
                  deleted: data.message.deleted ?? message.deleted,
                  deletedForAdmin:
                    data.message.deletedForAdmin ?? message.deletedForAdmin,
                  deletedForAdvisor:
                    data.message.deletedForAdvisor ?? message.deletedForAdvisor,
                  deletedForEveryone:
                    data.message.deletedForEveryone ??
                    message.deletedForEveryone,
                },
          ),
        };
      });

      setEditingMessageId(null);
      setEditingText("");
      setOpenMessageMenu(null);
    };

    const handleMessageDeletedForMe = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (data.conversation_id !== conversationId) return;

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((message) =>
            message.message_id === data.message_id
              ? { ...message, deletedForAdmin: true }
              : message,
          ),
        };
      });

      setOpenMessageMenu(null);
    };

    /* Used for both "message_deleted_for_everyone" and "message_deleted" */
    const handleMessageDeletedForEveryone = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (data.conversation_id !== conversationId) return;

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,
                  deleted: true,
                  deletedForEveryone: true,
                  edited: false,
                }
              : message,
          ),
        };
      });

      setOpenMessageMenu(null);
    };

    const handleMessageDelivered = (data: {
      conversation_id: string;
      message_id: string;
      deliveredAt?: string;
    }) => {
      if (data.conversation_id !== conversationId) return;

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,
                  deliveredAt: data.deliveredAt ?? message.deliveredAt,
                }
              : message,
          ),
        };
      });
    };

    const handleMessageRead = (data: {
      conversation_id: string;
      message_id: string;
      readAt?: string;
    }) => {
      if (data.conversation_id !== conversationId) return;

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((message) =>
            message.message_id === data.message_id
              ? { ...message, readAt: data.readAt ?? message.readAt }
              : message,
          ),
        };
      });
    };

    const handleTyping = (data: {
      conversation_id: string;
      sender: "admin" | "advisor";
      isTyping: boolean;
    }) => {
      if (data.conversation_id !== conversationId) return;

      if (data.sender === "advisor") {
        setTyping(data.isTyping);
      }
    };

    const handleConversationDeleted = (data: {
      conversation_id: string;
      deletedFor: "admin" | "advisor";
    }) => {
      if (data.conversation_id !== conversationId) return;

      if (data.deletedFor === "admin") {
        navigate("/admin/messages");
      }
    };

    const handleMessageError = (data: { message?: string }) => {
      console.error("Message error:", data.message);
      setError(data.message || "Message operation failed.");
      setSending(false);
    };

    socket.on("connect", joinConversation);
    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted_for_me", handleMessageDeletedForMe);
    socket.on("message_deleted_for_everyone", handleMessageDeletedForEveryone);
    socket.on("message_deleted", handleMessageDeletedForEveryone);
    socket.on("message_delivered", handleMessageDelivered);
    socket.on("message_read", handleMessageRead);
    socket.on("user_typing", handleTyping);
    socket.on("conversation_deleted", handleConversationDeleted);
    socket.on("message_error", handleMessageError);

    if (socket.connected) {
      joinConversation();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", joinConversation);
      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted_for_me", handleMessageDeletedForMe);
      socket.off(
        "message_deleted_for_everyone",
        handleMessageDeletedForEveryone,
      );
      socket.off("message_deleted", handleMessageDeletedForEveryone);
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("message_read", handleMessageRead);
      socket.off("user_typing", handleTyping);
      socket.off("conversation_deleted", handleConversationDeleted);
      socket.off("message_error", handleMessageError);
    };
  }, [conversation?.conversation_id, navigate]);

  /* ================================================================ */
  /* MARK ADVISOR MESSAGES AS READ                                    */
  /* ================================================================ */

  useEffect(() => {
    if (!conversation || !socket.connected) return;

    conversation.messages
      .filter(
        (message) =>
          message.sender === "advisor" &&
          !message.readAt &&
          !message.deletedForAdmin &&
          !message.deletedForEveryone,
      )
      .forEach((message) => {
        socket.emit("mark_message_read", {
          conversation_id: conversation.conversation_id,
          message_id: message.message_id,
        });
      });
  }, [conversation?.conversation_id, conversation?.messages.length, connected]);

  /* ================================================================ */
  /* DERIVED                                                          */
  /* ================================================================ */

  const visibleMessages = useMemo(() => {
    if (!conversation) return [];

    const query = searchText.trim().toLowerCase();

    if (!query) return conversation.messages;

    return conversation.messages.filter(
      (message) =>
        !isGone(message) && message.text.toLowerCase().includes(query),
    );
  }, [conversation, searchText]);

  const unreadCount = useMemo(() => {
    if (!conversation) return 0;

    return conversation.messages.filter(
      (message) =>
        message.sender === "advisor" &&
        !message.readAt &&
        !message.deletedForAdmin &&
        !message.deletedForEveryone,
    ).length;
  }, [conversation]);

  /* ================================================================ */
  /* SEND                                                             */
  /* ================================================================ */

  const handleSendMessage = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!conversation) return;

    if (!socket.connected) {
      setError("Chat connection is not available.");
      return;
    }

    const text = messageText.trim();
    if (!text) return;

    setSending(true);
    setError("");

    socket.emit("send_message", {
      conversation_id: conversation.conversation_id,
      sender: "admin",
      text,
      ...(replyingTo
        ? {
            reply_to: {
              message_id: replyingTo.message_id,
              text: replyingTo.text,
              sender: replyingTo.sender,
            },
          }
        : {}),
    });

    setMessageText("");
    setReplyingTo(null);

    socket.emit("user_typing", {
      conversation_id: conversation.conversation_id,
      sender: "admin",
      isTyping: false,
    });

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  /* ================================================================ */
  /* EDIT                                                             */
  /* ================================================================ */

  const startEditing = (message: Message) => {
    if (message.sender !== "admin" || isGone(message)) return;

    setEditingMessageId(message.message_id);
    setEditingText(message.text);
    setReplyingTo(null);
    setOpenMessageMenu(null);

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEdit = (event?: FormEvent) => {
    event?.preventDefault();

    if (!conversation || !editingMessageId) return;

    const newText = editingText.trim();
    if (!newText) return;

    if (!socket.connected) {
      setError("Chat connection is not available.");
      return;
    }

    const currentMessage = conversation.messages.find(
      (message) => message.message_id === editingMessageId,
    );

    if (!currentMessage) return;

    if (currentMessage.text === newText) {
      cancelEditing();
      return;
    }

    setConversation((current) => {
      if (!current) return current;

      return {
        ...current,
        messages: current.messages.map((message) =>
          message.message_id === editingMessageId
            ? { ...message, text: newText, edited: true }
            : message,
        ),
      };
    });

    socket.emit("edit_message", {
      conversation_id: conversation.conversation_id,
      message_id: editingMessageId,
      sender: "admin",
      text: newText,
    });

    cancelEditing();
    setOpenMessageMenu(null);
  };

  /* ================================================================ */
  /* DELETE (single or selected)                                      */
  /* ================================================================ */

  const openDeleteModal = (targets: Message[]) => {
    const valid = targets.filter((message) => !isGone(message));
    if (valid.length === 0) return;

    setDeleteTargets(valid);
    setShowDeleteModal(true);
    setOpenMessageMenu(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTargets([]);
  };

  const exitDeleteMode = () => {
    setDeleteMode(false);
    setSelectedMessageIds([]);
  };

  const toggleMessageSelection = (message: Message) => {
    if (message.sender !== "admin" || isGone(message)) return;

    setSelectedMessageIds((current) =>
      current.includes(message.message_id)
        ? current.filter((id) => id !== message.message_id)
        : [...current, message.message_id],
    );
  };

  const confirmDelete = (deleteType: DeleteType) => {
    if (!conversation || deleteTargets.length === 0) return;

    if (!socket.connected) {
      setError("Chat connection is not available.");
      return;
    }

    const ids = deleteTargets.map((message) => message.message_id);

    ids.forEach((messageId) => {
      socket.emit("delete_message", {
        conversation_id: conversation.conversation_id,
        message_id: messageId,
        sender: "admin",
        deleteType,
      });
    });

    /* Optimistic UI */
    setConversation((current) => {
      if (!current) return current;

      return {
        ...current,
        messages: current.messages.map((message) => {
          if (!ids.includes(message.message_id)) return message;

          return deleteType === "me"
            ? { ...message, deletedForAdmin: true }
            : {
                ...message,
                deleted: true,
                deletedForEveryone: true,
                edited: false,
              };
        }),
      };
    });

    closeDeleteModal();
    exitDeleteMode();
  };

  const deleteConversation = () => {
    if (!conversation) return;

    if (!socket.connected) {
      setError("Chat connection is not available.");
      return;
    }

    socket.emit("delete_conversation", {
      conversation_id: conversation.conversation_id,
      sender: "admin",
    });

    setShowDeleteConversationModal(false);
  };

  /* ================================================================ */
  /* REPLY / COPY                                                     */
  /* ================================================================ */

  const handleReply = (message: Message) => {
    if (isGone(message)) return;

    setReplyingTo(message);
    setOpenMessageMenu(null);

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleCopy = async (message: Message) => {
    if (isGone(message)) return;

    try {
      await navigator.clipboard.writeText(message.text);
    } catch (copyError) {
      console.error("Copy failed:", copyError);
    }

    setOpenMessageMenu(null);
  };

  /* ================================================================ */
  /* INPUT                                                            */
  /* ================================================================ */

  const handleInputChange = (value: string) => {
    if (editingMessageId) {
      setEditingText(value);
      return;
    }

    setMessageText(value);

    if (conversation && socket.connected) {
      socket.emit("user_typing", {
        conversation_id: conversation.conversation_id,
        sender: "admin",
        isTyping: value.trim().length > 0,
      });
    }
  };

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (editingMessageId) {
        saveEdit();
      } else {
        handleSendMessage();
      }
    }
  };

  /* ================================================================ */
  /* FORMATTING                                                       */
  /* ================================================================ */

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const shouldShowDateSeparator = (messages: Message[], index: number) => {
    if (index === 0) return true;

    return (
      new Date(messages[index].timestamp).toDateString() !==
      new Date(messages[index - 1].timestamp).toDateString()
    );
  };

  /* ✓ = sent, ✓✓ = read (readAt) */
  const renderMessageStatus = (message: Message) => {
    if (message.sender !== "admin") return null;

    if (message.readAt) {
      return (
        <CheckCheck size={15} strokeWidth={2.8} className="text-sky-500" />
      );
    }

    return <Check size={15} strokeWidth={2.8} className="text-slate-400" />;
  };

  /* ================================================================ */
  /* SCROLL                                                           */
  /* ================================================================ */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsNearBottom(true);
    setShowScrollButton(false);
  };

  useEffect(() => {
    if (!isNearBottom) return;

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length, typing, isNearBottom]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distance =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    const nearBottom = distance < 120;

    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom);
  };

  /* ================================================================ */
  /* LOADING / ERROR                                                  */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="h-[100dvh] min-h-screen bg-[#FAFBF7] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-[#DCE8DD] border-t-[#2F8F4E] animate-spin" />
          <p className="text-sm text-[#6B7D70]">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !conversation) {
    return (
      <div className="min-h-screen bg-[#FAFBF7] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-5 sm:p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            <X size={23} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-[#173B28]">
            Unable to load conversation
          </h2>

          <p className="mt-2 text-sm text-[#6B7D70]">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/admin/messages")}
            className="mt-5 w-full rounded-xl bg-[#2F8F4E] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#176B3A]"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  const advisorName = advisor?.name || "Advisor";
  const allTargetsOwn = deleteTargets.every(
    (message) => message.sender === "admin",
  );

  /* ================================================================ */
  /* UI                                                               */
  /* ================================================================ */

  return (
    <div className="h-[100dvh] min-h-screen bg-[#FAFBF7] flex flex-col overflow-hidden text-[#173B28]">
      {/* HEADER */}
      <header className="relative z-20 shrink-0 h-[72px] sm:h-[76px] bg-white border-b border-[#DCE8DD] shadow-sm px-3 sm:px-6">
        <div className="h-full w-full max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/admin/messages")}
              className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center text-[#173B28] transition hover:bg-[#F3F7F1] active:bg-[#E7F1E3]"
              aria-label="Back"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="relative shrink-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E7F1E3] text-[#176B3A] flex items-center justify-center text-sm font-semibold">
                {getInitials(
                  advisor?.name,
                  conversation.advisor_id.charAt(0).toUpperCase() || "A",
                )}
              </div>

              {advisor?.active && (
                <span className="absolute right-0 bottom-0 w-3 h-3 rounded-full bg-[#2F8F4E] border-2 border-white" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-semibold text-[15px] sm:text-base text-[#173B28] truncate max-w-[150px] sm:max-w-[300px] md:max-w-[400px]">
                  {advisorName}
                </h1>

                {unreadCount > 0 && (
                  <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#2F8F4E] text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-[#6B7D70] flex items-center gap-1.5 min-w-0">
                {typing ? (
                  <span className="text-[#2F8F4E]">typing...</span>
                ) : (
                  <span className="truncate">
                    {advisor?.email || (advisor?.active ? "Online" : "Advisor")}
                  </span>
                )}

                {!connected && (
                  <span className="text-red-500 shrink-0">• Connecting...</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowSearch((current) => !current);
                if (showSearch) setSearchText("");
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#173B28] transition hover:bg-[#F3F7F1] active:bg-[#E7F1E3]"
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowConversationMenu((current) => !current)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[#173B28] transition hover:bg-[#F3F7F1] active:bg-[#E7F1E3]"
                aria-label="More"
              >
                <MoreVertical size={19} />
              </button>

              {showConversationMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowConversationMenu(false)}
                  />

                  <div className="absolute right-0 top-11 sm:top-12 z-50 w-52 rounded-xl border border-[#DCE8DD] bg-white shadow-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setShowConversationMenu(false);
                        setDeleteMode(true);
                        setSelectedMessageIds([]);
                        setOpenMessageMenu(null);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                    >
                      Delete messages
                    </button>

                    <div className="border-t border-[#DCE8DD]" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowConversationMenu(false);
                        setShowDeleteConversationModal(true);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-600 transition hover:bg-red-50 active:bg-red-100"
                    >
                      <Trash2 size={17} />
                      Delete conversation
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SELECTION BAR */}
      {deleteMode && (
        <div className="shrink-0 border-b border-[#DCE8DD] bg-[#E7F1E3] px-3 sm:px-6 py-3">
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-[#173B28]">
              {selectedMessageIds.length} message
              {selectedMessageIds.length === 1 ? "" : "s"} selected
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exitDeleteMode}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-[#173B28] hover:bg-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={selectedMessageIds.length === 0}
                onClick={() =>
                  openDeleteModal(
                    conversation.messages.filter((message) =>
                      selectedMessageIds.includes(message.message_id),
                    ),
                  )
                }
                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH BAR */}
      {showSearch && (
        <div className="shrink-0 bg-white border-b border-[#DCE8DD] px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="relative w-full max-w-4xl mx-auto">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2F8F4E]"
            />

            <input
              autoFocus
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search messages..."
              className="w-full h-10 sm:h-11 pl-10 pr-10 rounded-2xl bg-[#FAFBF7] text-sm text-[#173B28] outline-none border border-[#DCE8DD] placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
            />

            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F3F7F1]"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div className="relative flex-1 min-h-0 bg-[#F3F7F1]/60">
        <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#2F8F4E_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <main
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="relative h-full overflow-y-auto overscroll-contain px-3 sm:px-8 py-4 sm:py-5"
        >
          <div className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center mb-4 sm:mb-6 px-2">
              <span className="max-w-full text-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#E7F1E3] text-[#176B3A] text-[10px] sm:text-xs">
                Messages between SafeLink administrators and advisors are
                private.
              </span>
            </div>

            {visibleMessages.length === 0 ? (
              <div className="min-h-[45vh] flex items-center justify-center px-4">
                <div className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E7F1E3] text-[#176B3A] flex items-center justify-center mx-auto mb-4">
                    <Send size={23} />
                  </div>

                  <h2 className="font-semibold text-[#173B28] text-sm sm:text-base">
                    {searchText ? "No messages found" : "No messages yet"}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#6B7D70] mt-1 max-w-xs mx-auto">
                    {searchText
                      ? "Try another search term."
                      : `Start a conversation with ${advisorName}.`}
                  </p>
                </div>
              </div>
            ) : (
              visibleMessages.map((message, index) => {
                const isAdmin = message.sender === "admin";
                const isDeleted = isGone(message);
                const isEditing = editingMessageId === message.message_id;
                const isSelectedForDelete = selectedMessageIds.includes(
                  message.message_id,
                );
                const showDate = shouldShowDateSeparator(
                  visibleMessages,
                  index,
                );

                return (
                  <div key={message.message_id}>
                    {showDate && (
                      <div className="flex justify-center my-4 sm:my-5">
                        <span className="px-3 py-1 sm:py-1.5 rounded-full bg-white border border-[#DCE8DD] text-[#6B7D70] text-[10px] sm:text-xs shadow-sm">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`group flex mb-2.5 sm:mb-2 ${
                        isAdmin ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex items-end gap-2 max-w-[94%] sm:max-w-[82%] md:max-w-[72%] ${
                          isAdmin ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        {/* Select checkbox */}
                        {deleteMode && isAdmin && !isDeleted && (
                          <button
                            type="button"
                            onClick={() => toggleMessageSelection(message)}
                            className={`mb-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                              isSelectedForDelete
                                ? "border-[#2F8F4E] bg-[#2F8F4E] text-white"
                                : "border-[#DCE8DD] bg-white text-transparent"
                            }`}
                            aria-label="Select message"
                          >
                            <Check size={14} strokeWidth={3} />
                          </button>
                        )}

                        <div className="relative min-w-0">
                          {isEditing ? (
                            <form
                              onSubmit={saveEdit}
                              className="w-[360px] max-w-[80vw] rounded-2xl bg-[#2F8F4E] p-3 shadow-sm"
                            >
                              <div className="mb-2 text-xs font-semibold text-white/90">
                                Editing message
                              </div>

                              <textarea
                                value={editingText}
                                onChange={(event) =>
                                  setEditingText(event.target.value)
                                }
                                autoFocus
                                rows={3}
                                onKeyDown={(event) => {
                                  if (
                                    event.key === "Enter" &&
                                    !event.shiftKey
                                  ) {
                                    event.preventDefault();
                                    saveEdit();
                                  }
                                }}
                                className="w-full resize-none rounded-xl bg-white px-3 py-2 text-sm text-[#173B28] outline-none"
                              />

                              <div className="mt-2 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="flex items-center gap-1 rounded-full border border-white/30 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                                >
                                  <X size={13} />
                                  Cancel
                                </button>

                                <button
                                  type="submit"
                                  disabled={!editingText.trim()}
                                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#2F8F4E] transition disabled:opacity-50"
                                >
                                  Save
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div
                              className={`rounded-2xl px-3.5 py-2.5 sm:px-4 shadow-sm ${
                                isAdmin
                                  ? "bg-[#E7F1E3] text-[#173B28] rounded-br-md"
                                  : "bg-white text-[#173B28] border border-[#DCE8DD] rounded-bl-md"
                              } ${isDeleted ? "opacity-75" : ""} ${
                                isSelectedForDelete
                                  ? "ring-2 ring-[#2F8F4E]/40"
                                  : ""
                              }`}
                            >
                              {message.replyTo && !isDeleted && (
                                <div className="mb-2 pl-2.5 sm:pl-3 border-l-2 border-[#2F8F4E] min-w-0">
                                  <div className="text-[10px] sm:text-[11px] font-semibold text-[#2F8F4E]">
                                    {message.replyTo.sender === "admin"
                                      ? "You"
                                      : advisorName}
                                  </div>

                                  <div className="text-[10px] sm:text-xs text-[#6B7D70] truncate max-w-[180px] sm:max-w-[280px]">
                                    {message.replyTo.text}
                                  </div>
                                </div>
                              )}

                              <div
                                className={`whitespace-pre-wrap break-words text-sm sm:text-[15px] leading-relaxed ${
                                  isDeleted ? "italic text-[#6B7D70]" : ""
                                }`}
                              >
                                {isDeleted
                                  ? "This message was deleted"
                                  : message.text}
                              </div>

                              {!isDeleted && (
                                <div className="flex items-center justify-end gap-1.5 mt-1 min-h-[14px]">
                                  <span className="text-[10px] sm:text-[11px] leading-none whitespace-nowrap text-[#6B7D70]">
                                    {formatMessageTime(message.timestamp)}
                                  </span>

                                  {message.edited === true && (
                                    <span className="text-[10px] text-slate-400 leading-none whitespace-nowrap">
                                      edited
                                    </span>
                                  )}

                                  {isAdmin && (
                                    <span className="inline-flex items-center justify-center leading-none">
                                      {renderMessageStatus(message)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Per-message menu */}
                          {openMessageMenu === message.message_id &&
                            !isDeleted && (
                              <>
                                <div
                                  className="fixed inset-0 z-30"
                                  onClick={() => setOpenMessageMenu(null)}
                                />

                                <div
                                  className={`absolute top-full mt-1 z-40 w-40 rounded-xl border border-[#DCE8DD] bg-white shadow-xl overflow-hidden ${
                                    isAdmin ? "right-0" : "left-0"
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleReply(message)}
                                    className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                                  >
                                    <Reply size={16} />
                                    Reply
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleCopy(message)}
                                    className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                                  >
                                    <Copy size={16} />
                                    Copy
                                  </button>

                                  {isAdmin && (
                                    <button
                                      type="button"
                                      onClick={() => startEditing(message)}
                                      className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                                    >
                                      <Edit3 size={16} />
                                      Edit
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => openDeleteModal([message])}
                                    className="w-full px-3 py-2.5 flex items-center gap-3 text-sm text-red-600 transition hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                        </div>

                        {/* Hover actions button (always visible on mobile) */}
                        {!deleteMode && !isDeleted && !isEditing && (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMessageMenu((current) =>
                                current === message.message_id
                                  ? null
                                  : message.message_id,
                              )
                            }
                            className="mb-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6B7D70] transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label="Message actions"
                          >
                            <MoreVertical size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {typing && (
              <div className="flex justify-start mt-2">
                <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 bg-white border border-[#DCE8DD] rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B7D70] animate-bounce" />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#6B7D70] animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-[#6B7D70] animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {showScrollButton && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-4 right-3 sm:right-6 md:right-8 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-[#DCE8DD] shadow-lg flex items-center justify-center text-[#173B28] hover:bg-[#F3F7F1] transition z-20"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={19} />
          </button>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="shrink-0 bg-white border-t border-[#DCE8DD] px-3 sm:px-6 pt-2">
          <div className="w-full max-w-4xl mx-auto flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* REPLY BAR */}
      {replyingTo && (
        <div className="shrink-0 bg-white border-t border-[#DCE8DD] px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="w-full max-w-4xl mx-auto flex items-center gap-2.5 sm:gap-3">
            <div className="w-1 h-9 sm:h-10 shrink-0 rounded-full bg-[#2F8F4E]" />

            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-[#2F8F4E]">
                Replying to{" "}
                {replyingTo.sender === "admin" ? "yourself" : advisorName}
              </p>

              <p className="text-xs sm:text-sm text-[#6B7D70] truncate">
                {replyingTo.text}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center hover:bg-[#F3F7F1]"
              aria-label="Cancel reply"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* EDIT BAR */}
      {editingMessageId && (
        <div className="shrink-0 bg-white border-t border-[#DCE8DD] px-3 sm:px-6 py-2.5 sm:py-3">
          <div className="w-full max-w-4xl mx-auto flex items-center gap-2.5 sm:gap-3">
            <div className="w-1 h-9 sm:h-10 shrink-0 rounded-full bg-[#2F8F4E]" />

            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-semibold text-[#2F8F4E]">
                Editing message
              </p>

              <p className="text-xs sm:text-sm text-[#6B7D70] truncate">
                {editingText}
              </p>
            </div>

            <button
              type="button"
              onClick={cancelEditing}
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center hover:bg-[#F3F7F1]"
              aria-label="Cancel editing"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* INPUT */}
      <footer className="shrink-0 bg-white border-t border-[#DCE8DD] px-3 sm:px-6 py-3 sm:py-4">
        <form
          onSubmit={editingMessageId ? saveEdit : handleSendMessage}
          className="w-full max-w-4xl mx-auto"
        >
          <div className="flex items-end gap-2.5 sm:gap-3">
            <textarea
              ref={inputRef}
              value={editingMessageId ? editingText : messageText}
              onChange={(event) => handleInputChange(event.target.value)}
              onKeyDown={handleInputKeyDown}
              rows={1}
              placeholder={
                editingMessageId
                  ? "Edit message..."
                  : `Message ${advisorName}...`
              }
              className="flex-1 min-w-0 max-h-32 min-h-[46px] sm:min-h-[48px] resize-none rounded-3xl border border-[#DCE8DD] bg-[#FAFBF7] px-5 py-3 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
            />

            <button
              type="submit"
              disabled={
                !connected ||
                sending ||
                !(editingMessageId ? editingText.trim() : messageText.trim())
              }
              className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-full bg-[#2F8F4E] text-white flex items-center justify-center transition hover:bg-[#176B3A] active:bg-[#176B3A] disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={editingMessageId ? "Save edit" : "Send message"}
            >
              {editingMessageId ? (
                <Check size={19} />
              ) : (
                <Send size={19} className="-ml-0.5" />
              )}
            </button>
          </div>

          <p className="hidden sm:block mt-2 text-[11px] text-[#6B7D70]">
            Enter to {editingMessageId ? "save" : "send"} • Shift + Enter for a
            new line
          </p>
        </form>
      </footer>

      {/* DELETE MESSAGE(S) MODAL */}
      {showDeleteModal && deleteTargets.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[1px] flex items-end sm:items-center justify-center"
          onClick={closeDeleteModal}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-[#DCE8DD] overflow-hidden"
          >
            <div className="p-4 sm:p-5 border-b border-[#DCE8DD]">
              <h3 className="font-semibold text-[#173B28] text-base">
                Delete{" "}
                {deleteTargets.length === 1
                  ? "message"
                  : `${deleteTargets.length} messages`}
              </h3>

              <p className="text-xs sm:text-sm text-[#6B7D70] mt-1">
                Choose how you want to delete{" "}
                {deleteTargets.length === 1 ? "this message" : "these messages"}
                .
              </p>
            </div>

            <div className="p-2.5 sm:p-3">
              <button
                type="button"
                onClick={() => confirmDelete("me")}
                className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition hover:bg-[#F3F7F1]"
              >
                <Trash2 size={18} className="text-[#6B7D70] shrink-0" />

                <div>
                  <p className="text-sm font-medium text-[#173B28]">
                    Delete for me
                  </p>
                  <p className="text-xs text-[#6B7D70]">
                    Remove it from your chat.
                  </p>
                </div>
              </button>

              {allTargetsOwn && (
                <button
                  type="button"
                  onClick={() => confirmDelete("everyone")}
                  className="w-full p-3 rounded-xl flex items-center gap-3 text-left transition hover:bg-red-50"
                >
                  <Trash2 size={18} className="text-red-500 shrink-0" />

                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Delete for everyone
                    </p>
                    <p className="text-xs text-[#6B7D70]">
                      Remove it for both users.
                    </p>
                  </div>
                </button>
              )}
            </div>

            <div className="p-3 border-t border-[#DCE8DD] flex justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-[#173B28] hover:bg-[#F3F7F1]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONVERSATION MODAL */}
      {showDeleteConversationModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[1px] flex items-end sm:items-center justify-center"
          onClick={() => setShowDeleteConversationModal(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl border border-[#DCE8DD] overflow-hidden"
          >
            <div className="p-5 sm:p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
                <Trash2 size={22} />
              </div>

              <h3 className="text-lg font-semibold text-[#173B28]">
                Hide conversation?
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#6B7D70]">
                This will hide the conversation from your admin messages. The
                conversation and its messages will remain stored in MongoDB.
              </p>

              <div className="mt-5 flex flex-col-reverse sm:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConversationModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-medium text-[#173B28] hover:bg-[#F3F7F1]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={deleteConversation}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700"
                >
                  Hide conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
