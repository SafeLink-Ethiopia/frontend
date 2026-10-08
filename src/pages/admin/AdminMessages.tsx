import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import axios from "axios";
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
  WifiOff,
  X,
} from "lucide-react";

import socket from "../../services/socket";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface ReplyInfo {
  message_id: string;
  text: string;
  sender: "admin" | "advisor";
}

interface Message {
  message_id: string;
  sender: "admin" | "advisor";
  text: string;
  timestamp: string | Date;

  edited?: boolean;

  deleted?: boolean;
  deletedForAdmin?: boolean;
  deletedForAdvisor?: boolean;
  deletedForEveryone?: boolean;

  deliveredAt?: string | Date | null;
  readAt?: string | Date | null;

  replyTo?: ReplyInfo;
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

interface Advisor {
  _id?: string;
  advisor_id: string;
  name: string;
  email?: string;
  active?: boolean;
  type?: string;
}

interface ConversationsResponse {
  conversations?: Conversation[];
}

interface AdvisorsResponse {
  advisors?: Advisor[];
}

type DeleteType = "me" | "everyone";

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

const API_URL = "http://localhost:5000/api";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const isGone = (message: Message) =>
  Boolean(
    message.deleted || message.deletedForAdmin || message.deletedForEveryone,
  );

const getInitials = (name: string) => {
  if (!name.trim()) return "A";

  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const formatTime = (value: string | Date) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (value: string | Date) => {
  const date = new Date(value);
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

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function AdminMessages() {
  /* Data */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  /* Status */
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null,
  );

  /* List */
  const [search, setSearch] = useState("");
  const [showListMenu, setShowListMenu] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  /* Chat delete mode (conversations) */
  const [chatDeleteMode, setChatDeleteMode] = useState(false);
  const [selectedConversationIds, setSelectedConversationIds] = useState<
    string[]
  >([]);
  const [showDeleteChatsModal, setShowDeleteChatsModal] = useState(false);

  /* Message delete mode */
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [deleteTargets, setDeleteTargets] = useState<Message[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /* Header menu / single conversation delete */
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showDeleteConversationModal, setShowDeleteConversationModal] =
    useState(false);

  /* Input */
  const [messageText, setMessageText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [openMessageMenu, setOpenMessageMenu] = useState<string | null>(null);

  /* Chat search */
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearch, setChatSearch] = useState("");

  /* Typing: conversation_id -> advisor is typing */
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});

  /* Scroll */
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  /* Refs */
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ================================================================ */
  /* Status toast                                                     */
  /* ================================================================ */

  const showStatus = (type: StatusMessage["type"], text: string) => {
    if (statusTimerRef.current) clearTimeout(statusTimerRef.current);

    setStatusMessage({ type, text });

    statusTimerRef.current = setTimeout(() => setStatusMessage(null), 3500);
  };

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
    };
  }, []);

  /* ================================================================ */
  /* Derived                                                          */
  /* ================================================================ */

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.conversation_id === selectedConversationId,
      ) || null,
    [conversations, selectedConversationId],
  );

  const getAdvisor = (advisorId: string) =>
    advisors.find((advisor) => advisor.advisor_id === advisorId);

  const getAdvisorName = (advisorId: string) =>
    getAdvisor(advisorId)?.name || "Advisor";

  const getAdvisorEmail = (advisorId: string) =>
    getAdvisor(advisorId)?.email || "";

  const visibleConversations = useMemo(
    () => conversations.filter((conversation) => !conversation.deletedForAdmin),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return visibleConversations;

    return visibleConversations.filter((conversation) => {
      const advisor = advisors.find(
        (item) => item.advisor_id === conversation.advisor_id,
      );

      return (
        (advisor?.name || "").toLowerCase().includes(query) ||
        (advisor?.email || "").toLowerCase().includes(query)
      );
    });
  }, [visibleConversations, search, advisors]);

  const visibleMessages = useMemo(() => {
    if (!selectedConversation) return [] as Message[];

    let list = selectedConversation.messages.filter(
      (message) => !message.deletedForAdmin,
    );

    const query = chatSearch.trim().toLowerCase();

    if (query) {
      list = list.filter(
        (message) =>
          !isGone(message) && message.text.toLowerCase().includes(query),
      );
    }

    return list;
  }, [selectedConversation, chatSearch]);

  const unreadFor = (conversation: Conversation) =>
    conversation.messages.filter(
      (message) =>
        message.sender === "advisor" &&
        !message.readAt &&
        !message.deletedForAdmin &&
        !message.deletedForEveryone &&
        !message.deleted,
    ).length;

  const lastMessageOf = (conversation: Conversation) => {
    const list = conversation.messages.filter(
      (message) => !message.deletedForAdmin,
    );
    return list[list.length - 1];
  };

  /* ================================================================ */
  /* Load data                                                        */
  /* ================================================================ */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("adminToken");

        if (!token) {
          showStatus("error", "Admin authentication required.");
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [conversationResponse, advisorResponse] = await Promise.all([
          axios.get<ConversationsResponse>(
            `${API_URL}/advisor-admin-conversations`,
            config,
          ),
          axios.get<AdvisorsResponse>(`${API_URL}/advisors`, config),
        ]);

        setConversations(conversationResponse.data.conversations || []);
        setAdvisors(advisorResponse.data.advisors || []);
      } catch (error) {
        console.error("Failed to load messages:", error);

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            localStorage.removeItem("adminToken");
            showStatus("error", "Your admin session has expired.");
            return;
          }

          showStatus(
            "error",
            error.response?.data?.message || "Failed to load conversations.",
          );
        } else {
          showStatus("error", "Failed to load conversations.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ================================================================ */
  /* Socket: connection                                               */
  /* ================================================================ */

  useEffect(() => {
    const handleConnect = () => {
      setSocketConnected(true);

      if (selectedConversationId) {
        socket.emit("join_conversation", selectedConversationId);
      }
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
      showStatus("info", "Connection lost. Reconnecting...");
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket error:", error);
      setSocketConnected(false);
    };

    const handleMessageError = (data: { message?: string }) => {
      setSending(false);
      showStatus("error", data?.message || "Message operation failed.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message_error", handleMessageError);

    if (!socket.connected) socket.connect();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message_error", handleMessageError);
    };
  }, [selectedConversationId]);

  /* Join the selected conversation room */
  useEffect(() => {
    if (selectedConversationId && socket.connected) {
      socket.emit("join_conversation", selectedConversationId);
    }
  }, [selectedConversationId, socketConnected]);

  /* ================================================================ */
  /* Socket: message events                                           */
  /* ================================================================ */

  useEffect(() => {
    const updateConversation = (
      conversationId: string,
      updater: (conversation: Conversation) => Conversation,
    ) => {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.conversation_id === conversationId
            ? updater(conversation)
            : conversation,
        ),
      );
    };

    const updateMessage = (
      conversationId: string,
      messageId: string,
      updater: (message: Message) => Message,
    ) =>
      updateConversation(conversationId, (conversation) => ({
        ...conversation,
        messages: conversation.messages.map((message) =>
          message.message_id === messageId ? updater(message) : message,
        ),
      }));

    const handleNewMessage = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (!data?.conversation_id || !data?.message) return;

      updateConversation(data.conversation_id, (conversation) => {
        const exists = conversation.messages.some(
          (message) => message.message_id === data.message.message_id,
        );

        return {
          ...conversation,
          messages: exists
            ? conversation.messages
            : [...conversation.messages, data.message],
          updatedAt:
            data.message.timestamp?.toString() || conversation.updatedAt,
          deletedForAdmin: false,
        };
      });

      if (data.message.sender === "admin") {
        setSending(false);
      }

      if (
        data.message.sender === "advisor" &&
        data.conversation_id === selectedConversationId
      ) {
        socket.emit("mark_message_delivered", {
          conversation_id: data.conversation_id,
          message_id: data.message.message_id,
        });

        socket.emit("mark_message_read", {
          conversation_id: data.conversation_id,
          message_id: data.message.message_id,
        });
      }

      if (data.message.sender === "advisor") {
        setTypingMap((current) => ({
          ...current,
          [data.conversation_id]: false,
        }));
      }
    };

    /* Edited: keep timestamp + ticks */
    const handleMessageEdited = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (!data?.conversation_id || !data?.message) return;

      updateMessage(
        data.conversation_id,
        data.message.message_id,
        (message) => ({
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
          deletedForEveryone:
            data.message.deletedForEveryone ?? message.deletedForEveryone,
        }),
      );

      setEditingMessageId(null);
      setEditingText("");
    };

    const handleDeletedForMe = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (!data?.conversation_id || !data?.message_id) return;

      updateMessage(data.conversation_id, data.message_id, (message) => ({
        ...message,
        deletedForAdmin: true,
      }));
    };

    /* Handles both event names the backend may emit */
    const handleDeletedForEveryone = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (!data?.conversation_id || !data?.message_id) return;

      updateMessage(data.conversation_id, data.message_id, (message) => ({
        ...message,
        deleted: true,
        deletedForEveryone: true,
        edited: false,
      }));
    };

    const handleDelivered = (data: {
      conversation_id: string;
      message_id: string;
      deliveredAt: string | Date;
    }) => {
      if (!data?.conversation_id || !data?.message_id) return;

      updateMessage(data.conversation_id, data.message_id, (message) => ({
        ...message,
        deliveredAt: data.deliveredAt,
      }));
    };

    const handleRead = (data: {
      conversation_id: string;
      message_id: string;
      readAt: string | Date;
    }) => {
      if (!data?.conversation_id || !data?.message_id) return;

      updateMessage(data.conversation_id, data.message_id, (message) => ({
        ...message,
        readAt: data.readAt,
      }));
    };

    const handleTyping = (data: {
      conversation_id: string;
      sender: "admin" | "advisor";
      isTyping: boolean;
    }) => {
      if (!data?.conversation_id || data.sender !== "advisor") return;

      setTypingMap((current) => ({
        ...current,
        [data.conversation_id]: Boolean(data.isTyping),
      }));
    };

    const handleConversationDeleted = (data: {
      conversation_id: string;
      deletedFor: "admin" | "advisor";
    }) => {
      if (!data?.conversation_id || data.deletedFor !== "admin") return;

      setConversations((current) =>
        current.filter(
          (conversation) =>
            conversation.conversation_id !== data.conversation_id,
        ),
      );

      setSelectedConversationId((current) =>
        current === data.conversation_id ? null : current,
      );

      setSelectedConversationIds((current) =>
        current.filter((id) => id !== data.conversation_id),
      );

      setMobileChatOpen(false);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted_for_me", handleDeletedForMe);
    socket.on("message_deleted_for_everyone", handleDeletedForEveryone);
    socket.on("message_deleted", handleDeletedForEveryone);
    socket.on("message_delivered", handleDelivered);
    socket.on("message_read", handleRead);
    socket.on("user_typing", handleTyping);
    socket.on("conversation_deleted", handleConversationDeleted);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted_for_me", handleDeletedForMe);
      socket.off("message_deleted_for_everyone", handleDeletedForEveryone);
      socket.off("message_deleted", handleDeletedForEveryone);
      socket.off("message_delivered", handleDelivered);
      socket.off("message_read", handleRead);
      socket.off("user_typing", handleTyping);
      socket.off("conversation_deleted", handleConversationDeleted);
    };
  }, [selectedConversationId]);

  /* ================================================================ */
  /* Mark advisor messages as read for the open conversation          */
  /* ================================================================ */

  useEffect(() => {
    if (!selectedConversation || !socket.connected) return;

    selectedConversation.messages.forEach((message) => {
      if (
        message.sender === "advisor" &&
        !message.readAt &&
        !message.deletedForAdmin &&
        !message.deletedForEveryone
      ) {
        socket.emit("mark_message_delivered", {
          conversation_id: selectedConversation.conversation_id,
          message_id: message.message_id,
        });

        socket.emit("mark_message_read", {
          conversation_id: selectedConversation.conversation_id,
          message_id: message.message_id,
        });
      }
    });
  }, [
    selectedConversationId,
    selectedConversation?.messages.length,
    socketConnected,
  ]);

  /* ================================================================ */
  /* Scroll                                                           */
  /* ================================================================ */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsNearBottom(true);
    setShowScrollButton(false);
  };

  useEffect(() => {
    if (!isNearBottom) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [
    selectedConversation?.messages.length,
    selectedConversationId,
    isNearBottom,
    selectedConversationId ? typingMap[selectedConversationId] : false,
  ]);

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
  /* Socket helper                                                    */
  /* ================================================================ */

  const ensureSocketConnected = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (socket.connected) {
        resolve();
        return;
      }

      const handleConnect = () => {
        clearTimeout(timeout);
        resolve();
      };

      const timeout = setTimeout(() => {
        socket.off("connect", handleConnect);
        reject(new Error("Socket connection timed out."));
      }, 5000);

      socket.once("connect", handleConnect);
      socket.connect();
    });

  /* ================================================================ */
  /* Conversation selection                                           */
  /* ================================================================ */

  const resetChatUi = () => {
    setOpenMessageMenu(null);
    setEditingMessageId(null);
    setEditingText("");
    setReplyingTo(null);
    setMessageText("");
    setShowHeaderMenu(false);
    setShowChatSearch(false);
    setChatSearch("");
    setDeleteMode(false);
    setSelectedMessageIds([]);
    setIsNearBottom(true);
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setMobileChatOpen(true);
    setShowListMenu(false);
    resetChatUi();

    if (socket.connected) {
      socket.emit("join_conversation", conversationId);
    }
  };

  const toggleConversationSelection = (conversationId: string) => {
    setSelectedConversationIds((current) =>
      current.includes(conversationId)
        ? current.filter((id) => id !== conversationId)
        : [...current, conversationId],
    );
  };

  const cancelChatDeleteMode = () => {
    setChatDeleteMode(false);
    setSelectedConversationIds([]);
  };

  /* ================================================================ */
  /* Send                                                             */
  /* ================================================================ */

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text || sending) return;

    if (!selectedConversation) {
      showStatus("error", "Select a conversation first.");
      return;
    }

    try {
      setSending(true);

      await ensureSocketConnected();

      socket.emit("send_message", {
        conversation_id: selectedConversation.conversation_id,
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

      socket.emit("user_typing", {
        conversation_id: selectedConversation.conversation_id,
        sender: "admin",
        isTyping: false,
      });

      setMessageText("");
      setReplyingTo(null);
      setIsNearBottom(true);

      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      console.error("Send failed:", error);
      showStatus("error", "Could not connect to the messaging server.");
    } finally {
      setSending(false);
    }
  };

  /* ================================================================ */
  /* Edit                                                             */
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

  const saveEdit = async () => {
    const text = editingText.trim();

    if (!text || !selectedConversation || !editingMessageId) return;

    const current = selectedConversation.messages.find(
      (message) => message.message_id === editingMessageId,
    );

    if (!current) return;

    if (current.text === text) {
      cancelEditing();
      return;
    }

    try {
      await ensureSocketConnected();

      /* Optimistic update (timestamp / ticks preserved) */
      setConversations((currentList) =>
        currentList.map((conversation) =>
          conversation.conversation_id !== selectedConversation.conversation_id
            ? conversation
            : {
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.message_id === editingMessageId
                    ? { ...message, text, edited: true }
                    : message,
                ),
              },
        ),
      );

      socket.emit("edit_message", {
        conversation_id: selectedConversation.conversation_id,
        message_id: editingMessageId,
        sender: "admin",
        text,
      });

      cancelEditing();
    } catch (error) {
      console.error("Edit failed:", error);
      showStatus("error", "Could not connect to the messaging server.");
    }
  };

  /* ================================================================ */
  /* Delete messages                                                  */
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

  const confirmDelete = async (deleteType: DeleteType) => {
    if (!selectedConversation || deleteTargets.length === 0) return;

    try {
      await ensureSocketConnected();
    } catch {
      showStatus("error", "Could not connect to the messaging server.");
      return;
    }

    const ids = deleteTargets.map((message) => message.message_id);

    ids.forEach((messageId) => {
      socket.emit("delete_message", {
        conversation_id: selectedConversation.conversation_id,
        message_id: messageId,
        sender: "admin",
        deleteType,
      });
    });

    /* Optimistic UI */
    setConversations((currentList) =>
      currentList.map((conversation) =>
        conversation.conversation_id !== selectedConversation.conversation_id
          ? conversation
          : {
              ...conversation,
              messages: conversation.messages.map((message) => {
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
            },
      ),
    );

    showStatus(
      "success",
      deleteType === "me" ? "Deleted for you." : "Deleted for everyone.",
    );

    closeDeleteModal();
    exitDeleteMode();
  };

  /* ================================================================ */
  /* Delete conversations                                             */
  /* ================================================================ */

  const confirmDeleteConversation = async () => {
    if (!selectedConversation) return;

    try {
      await ensureSocketConnected();

      socket.emit("delete_conversation", {
        conversation_id: selectedConversation.conversation_id,
        sender: "admin",
      });

      setShowDeleteConversationModal(false);
      showStatus("success", "Conversation removed.");
    } catch (error) {
      console.error("Delete conversation failed:", error);
      showStatus("error", "Could not connect to the messaging server.");
    }
  };

  const confirmDeleteSelectedChats = async () => {
    if (selectedConversationIds.length === 0) return;

    try {
      await ensureSocketConnected();

      selectedConversationIds.forEach((conversationId) => {
        socket.emit("delete_conversation", {
          conversation_id: conversationId,
          sender: "admin",
        });
      });

      showStatus(
        "success",
        `${selectedConversationIds.length} chat${
          selectedConversationIds.length === 1 ? "" : "s"
        } removed.`,
      );

      setShowDeleteChatsModal(false);
      cancelChatDeleteMode();
    } catch (error) {
      console.error("Delete chats failed:", error);
      showStatus("error", "Could not connect to the messaging server.");
    }
  };

  /* ================================================================ */
  /* Reply / copy                                                     */
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
  /* Input                                                            */
  /* ================================================================ */

  const handleInputChange = (value: string) => {
    if (editingMessageId) {
      setEditingText(value);
      return;
    }

    setMessageText(value);

    if (selectedConversation && socket.connected) {
      socket.emit("user_typing", {
        conversation_id: selectedConversation.conversation_id,
        sender: "admin",
        isTyping: value.trim().length > 0,
      });
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (editingMessageId) {
        void saveEdit();
      } else {
        void sendMessage();
      }
    }

    if (event.key === "Escape" && editingMessageId) {
      cancelEditing();
    }
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
  /* Loading                                                          */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#FAFBF7]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#DCE8DD] border-t-[#2F8F4E]" />
          <p className="text-sm text-[#6B7D70]">Loading messages...</p>
        </div>
      </div>
    );
  }

  const selectedAdvisorName = selectedConversation
    ? getAdvisorName(selectedConversation.advisor_id)
    : "";

  const selectedAdvisorEmail = selectedConversation
    ? getAdvisorEmail(selectedConversation.advisor_id)
    : "";

  const selectedTyping = selectedConversationId
    ? Boolean(typingMap[selectedConversationId])
    : false;

  const allTargetsOwn = deleteTargets.every(
    (message) => message.sender === "admin",
  );

  /* ================================================================ */
  /* UI                                                               */
  /* ================================================================ */

  return (
    <div className="relative flex h-[calc(100dvh-80px)] overflow-hidden bg-[#FAFBF7] text-[#173B28]">
      {/* ============================================================
          CONVERSATION LIST
      ============================================================ */}

      <aside
        className={`${
          mobileChatOpen ? "hidden" : "flex"
        } h-full w-full flex-col border-r border-[#DCE8DD] bg-[#FAFBF7] md:flex md:w-[350px] lg:w-[390px]`}
      >
        {/* Title */}
        <div className="shrink-0 px-6 pb-4 pt-7">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-[#176B3A]">
                Messages
              </h1>

              <p className="mt-1 text-sm text-[#2F8F4E]">
                Chat with your advisors
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowListMenu((current) => !current)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#173B28] transition hover:bg-[#E7F1E3]"
                aria-label="Conversation list menu"
              >
                <MoreVertical size={19} />
              </button>

              {showListMenu && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowListMenu(false)}
                  />

                  <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-xl border border-[#DCE8DD] bg-white shadow-xl">
                    {!chatDeleteMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setChatDeleteMode(true);
                            setSelectedConversationIds([]);
                            setShowListMenu(false);
                            exitDeleteMode();
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                        >
                          Delete chats
                        </button>

                        <button
                          type="button"
                          disabled={!selectedConversation}
                          onClick={() => {
                            setShowListMenu(false);
                            setDeleteMode(true);
                            setSelectedMessageIds([]);
                            cancelChatDeleteMode();
                            setMobileChatOpen(true);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete messages
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          cancelChatDeleteMode();
                          setShowListMenu(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                      >
                        Cancel selection
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-5">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2F8F4E]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search advisors..."
              className="h-12 w-full rounded-2xl border border-[#DCE8DD] bg-white pl-11 pr-4 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
            />
          </div>
        </div>

        {/* Connection */}
        {!socketConnected && (
          <div className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-[#E7F1E3] px-3 py-2.5 text-xs font-medium text-[#176B3A]">
            <WifiOff size={14} />
            Connecting...
          </div>
        )}

        {/* Chat selection bar */}
        {chatDeleteMode && (
          <div className="flex shrink-0 items-center justify-between border-y border-[#DCE8DD] bg-[#E7F1E3] px-5 py-3">
            <span className="text-sm font-medium text-[#173B28]">
              {selectedConversationIds.length} selected
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelChatDeleteMode}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-[#173B28] hover:bg-white"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={selectedConversationIds.length === 0}
                onClick={() => setShowDeleteChatsModal(true)}
                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete selected
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F1E3] text-[#176B3A]">
                <Send size={22} />
              </div>

              <p className="font-semibold text-[#173B28]">
                {search ? "No advisors found" : "No conversations yet"}
              </p>

              <p className="mt-1 text-sm leading-6 text-[#6B7D70]">
                {search
                  ? "Try another search term."
                  : "Conversations with advisors will appear here."}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const advisorName = getAdvisorName(conversation.advisor_id);
              const advisorEmail = getAdvisorEmail(conversation.advisor_id);
              const lastMessage = lastMessageOf(conversation);
              const unread = unreadFor(conversation);

              const isSelected =
                conversation.conversation_id === selectedConversationId;

              const isChatSelected = selectedConversationIds.includes(
                conversation.conversation_id,
              );

              const typing = Boolean(typingMap[conversation.conversation_id]);

              return (
                <button
                  key={conversation.conversation_id}
                  type="button"
                  onClick={() => {
                    if (chatDeleteMode) {
                      toggleConversationSelection(conversation.conversation_id);
                      return;
                    }

                    selectConversation(conversation.conversation_id);
                  }}
                  className={`flex w-full items-center gap-3 border-b border-[#DCE8DD] px-5 py-4 text-left transition ${
                    isChatSelected || (isSelected && !chatDeleteMode)
                      ? "bg-[#E7F1E3]"
                      : "bg-[#FAFBF7] hover:bg-[#F3F7F1]"
                  }`}
                >
                  {chatDeleteMode && (
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        isChatSelected
                          ? "border-[#2F8F4E] bg-[#2F8F4E] text-white"
                          : "border-[#DCE8DD] bg-white text-transparent"
                      }`}
                    >
                      <Check size={13} strokeWidth={3} />
                    </div>
                  )}

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-semibold text-[#176B3A]">
                      {getInitials(advisorName)}
                    </div>

                    {getAdvisor(conversation.advisor_id)?.active && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#2F8F4E]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-semibold text-[#173B28]">
                        {advisorName}
                      </p>

                      <span className="shrink-0 text-[11px] text-[#6B7D70]">
                        {lastMessage
                          ? formatTime(lastMessage.timestamp)
                          : formatTime(conversation.updatedAt)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <p
                        className={`min-w-0 flex-1 truncate text-sm ${
                          typing ? "text-[#2F8F4E]" : "text-[#6B7D70]"
                        }`}
                      >
                        {typing
                          ? "typing..."
                          : lastMessage
                            ? isGone(lastMessage)
                              ? "This message was deleted"
                              : lastMessage.sender === "admin"
                                ? `You: ${lastMessage.text}`
                                : lastMessage.text
                            : advisorEmail || "Start a conversation"}
                      </p>

                      {unread > 0 && !isSelected && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] px-1.5 text-[10px] font-semibold text-white">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ============================================================
          CHAT
      ============================================================ */}

      <main
        className={`${
          mobileChatOpen ? "flex" : "hidden"
        } relative h-full min-w-0 flex-1 flex-col bg-[#FAFBF7] md:flex`}
      >
        {!selectedConversation ? (
          <div className="hidden h-full flex-col items-center justify-center md:flex">
            <div className="max-w-sm px-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F1E3] text-[#176B3A]">
                <Send size={26} />
              </div>

              <h2 className="text-xl font-semibold text-[#173B28]">
                Your messages
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6B7D70]">
                Select an advisor to start chatting.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <header className="relative z-20 flex h-[76px] shrink-0 items-center gap-3 border-b border-[#DCE8DD] bg-white px-4 shadow-sm sm:px-6">
              <button
                type="button"
                onClick={() => {
                  setMobileChatOpen(false);
                  resetChatUi();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#173B28] transition hover:bg-[#F3F7F1] md:hidden"
                aria-label="Back to conversations"
              >
                <ArrowLeft size={19} />
              </button>

              <div className="relative shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-semibold text-[#176B3A]">
                  {getInitials(selectedAdvisorName)}
                </div>

                {getAdvisor(selectedConversation.advisor_id)?.active && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#2F8F4E]" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[#173B28]">
                  {selectedAdvisorName}
                </p>

                <p className="truncate text-sm text-[#6B7D70]">
                  {selectedTyping ? (
                    <span className="text-[#2F8F4E]">typing...</span>
                  ) : (
                    selectedAdvisorEmail || "Advisor"
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowChatSearch((current) => !current);
                  if (showChatSearch) setChatSearch("");
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#173B28] transition hover:bg-[#F3F7F1]"
                aria-label="Search messages"
              >
                <Search size={19} />
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowHeaderMenu((current) => !current)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#173B28] transition hover:bg-[#F3F7F1]"
                  aria-label="Conversation menu"
                >
                  <MoreVertical size={19} />
                </button>

                {showHeaderMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowHeaderMenu(false)}
                    />

                    <div className="absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-xl border border-[#DCE8DD] bg-white shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setShowHeaderMenu(false);
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
                          setShowHeaderMenu(false);
                          setShowDeleteConversationModal(true);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                        Delete conversation
                      </button>
                    </div>
                  </>
                )}
              </div>
            </header>

            {/* Message selection bar */}
            {deleteMode && (
              <div className="flex shrink-0 items-center justify-between border-b border-[#DCE8DD] bg-[#E7F1E3] px-4 py-3 sm:px-6">
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
                        selectedConversation.messages.filter((message) =>
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
            )}

            {/* Chat search bar */}
            {showChatSearch && (
              <div className="shrink-0 border-b border-[#DCE8DD] bg-white px-4 py-3 sm:px-6">
                <div className="relative mx-auto w-full max-w-4xl">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2F8F4E]"
                  />

                  <input
                    autoFocus
                    value={chatSearch}
                    onChange={(event) => setChatSearch(event.target.value)}
                    placeholder="Search messages..."
                    className="h-11 w-full rounded-2xl border border-[#DCE8DD] bg-[#FAFBF7] pl-10 pr-10 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
                  />

                  {chatSearch && (
                    <button
                      type="button"
                      onClick={() => setChatSearch("")}
                      className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full hover:bg-[#F3F7F1]"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="relative min-h-0 flex-1 bg-[#F3F7F1]/60">
              <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
                <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#2F8F4E_1px,transparent_1px)] [background-size:24px_24px]" />
              </div>

              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                className="relative h-full overflow-y-auto overscroll-contain px-3 py-5 sm:px-8"
              >
                <div className="mx-auto flex max-w-4xl flex-col">
                  <div className="mb-4 flex justify-center px-2 sm:mb-6">
                    <span className="max-w-full rounded-full bg-[#E7F1E3] px-3 py-1.5 text-center text-[10px] text-[#176B3A] sm:px-4 sm:py-2 sm:text-xs">
                      Messages between SafeLink administrators and advisors are
                      private.
                    </span>
                  </div>

                  {visibleMessages.length === 0 ? (
                    <div className="flex min-h-[40vh] items-center justify-center px-4">
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F1E3] text-[#176B3A]">
                          <Send size={23} />
                        </div>

                        <h2 className="text-sm font-semibold text-[#173B28]">
                          {chatSearch ? "No messages found" : "No messages yet"}
                        </h2>

                        <p className="mx-auto mt-1 max-w-xs text-sm text-[#6B7D70]">
                          {chatSearch
                            ? "Try another search term."
                            : `Start a conversation with ${selectedAdvisorName}.`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    visibleMessages.map((message, index) => {
                      const isAdmin = message.sender === "admin";
                      const deleted = isGone(message);
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
                            <div className="my-4 flex justify-center">
                              <span className="rounded-full border border-[#DCE8DD] bg-white px-3 py-1 text-[10px] text-[#6B7D70] shadow-sm sm:text-xs">
                                {formatDate(message.timestamp)}
                              </span>
                            </div>
                          )}

                          <div
                            className={`group mb-2 flex ${
                              isAdmin ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex max-w-[92%] items-end gap-2 sm:max-w-[75%] ${
                                isAdmin ? "flex-row-reverse" : "flex-row"
                              }`}
                            >
                              {deleteMode && isAdmin && !deleted && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleMessageSelection(message)
                                  }
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
                                  <div className="w-[340px] max-w-[78vw] rounded-2xl bg-[#2F8F4E] p-3 shadow-sm">
                                    <div className="mb-2 text-xs font-semibold text-white/90">
                                      Editing message
                                    </div>

                                    <textarea
                                      value={editingText}
                                      onChange={(event) =>
                                        setEditingText(event.target.value)
                                      }
                                      onKeyDown={handleInputKeyDown}
                                      autoFocus
                                      rows={3}
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
                                        type="button"
                                        disabled={!editingText.trim()}
                                        onClick={() => void saveEdit()}
                                        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#2F8F4E] transition disabled:opacity-50"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                                      isAdmin
                                        ? "rounded-br-md bg-[#E7F1E3] text-[#173B28]"
                                        : "rounded-bl-md border border-[#DCE8DD] bg-white text-[#173B28]"
                                    } ${deleted ? "opacity-75" : ""} ${
                                      isSelectedForDelete
                                        ? "ring-2 ring-[#2F8F4E]/40"
                                        : ""
                                    }`}
                                  >
                                    {message.replyTo && !deleted && (
                                      <div className="mb-2 min-w-0 border-l-2 border-[#2F8F4E] pl-3">
                                        <div className="text-[11px] font-semibold text-[#2F8F4E]">
                                          {message.replyTo.sender === "admin"
                                            ? "You"
                                            : selectedAdvisorName}
                                        </div>

                                        <div className="max-w-[200px] truncate text-xs text-[#6B7D70] sm:max-w-[280px]">
                                          {message.replyTo.text}
                                        </div>
                                      </div>
                                    )}

                                    <p
                                      className={`whitespace-pre-wrap break-words text-[15px] leading-relaxed ${
                                        deleted ? "italic text-[#6B7D70]" : ""
                                      }`}
                                    >
                                      {deleted
                                        ? "This message was deleted"
                                        : message.text}
                                    </p>

                                    {!deleted && (
                                      <div className="mt-1 flex min-h-[14px] items-center justify-end gap-1.5">
                                        <span className="whitespace-nowrap text-[11px] leading-none text-[#6B7D70]">
                                          {formatTime(message.timestamp)}
                                        </span>

                                        {message.edited === true && (
                                          <span className="whitespace-nowrap text-[10px] leading-none text-slate-400">
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
                                  !deleted && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setOpenMessageMenu(null)}
                                      />

                                      <div
                                        className={`absolute top-full z-40 mt-1 w-40 overflow-hidden rounded-xl border border-[#DCE8DD] bg-white shadow-xl ${
                                          isAdmin ? "right-0" : "left-0"
                                        }`}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleReply(message)}
                                          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                                        >
                                          <Reply size={16} />
                                          Reply
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            void handleCopy(message)
                                          }
                                          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                                        >
                                          <Copy size={16} />
                                          Copy
                                        </button>

                                        {isAdmin && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              startEditing(message)
                                            }
                                            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                                          >
                                            <Edit3 size={16} />
                                            Edit
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            openDeleteModal([message])
                                          }
                                          className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                                        >
                                          <Trash2 size={16} />
                                          Delete
                                        </button>
                                      </div>
                                    </>
                                  )}
                              </div>

                              {!deleteMode && !deleted && !isEditing && (
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

                  {selectedTyping && (
                    <div className="mt-2 flex justify-start">
                      <div className="rounded-2xl rounded-bl-md border border-[#DCE8DD] bg-white px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B7D70]" />
                          <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B7D70]"
                            style={{ animationDelay: "150ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#6B7D70]"
                            style={{ animationDelay: "300ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {showScrollButton && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute bottom-4 right-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-[#DCE8DD] bg-white text-[#173B28] shadow-lg transition hover:bg-[#F3F7F1]"
                  aria-label="Scroll to bottom"
                >
                  <ArrowDown size={19} />
                </button>
              )}
            </div>

            {/* Reply bar */}
            {replyingTo && (
              <div className="flex shrink-0 items-center gap-3 border-t border-[#DCE8DD] bg-white px-4 py-3 sm:px-6">
                <div className="h-10 w-1 shrink-0 rounded-full bg-[#2F8F4E]" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#2F8F4E]">
                    Replying to{" "}
                    {replyingTo.sender === "admin"
                      ? "yourself"
                      : selectedAdvisorName}
                  </p>

                  <p className="truncate text-sm text-[#6B7D70]">
                    {replyingTo.text}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#F3F7F1]"
                  aria-label="Cancel reply"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* Edit bar */}
            {editingMessageId && (
              <div className="flex shrink-0 items-center gap-3 border-t border-[#DCE8DD] bg-white px-4 py-3 sm:px-6">
                <div className="h-10 w-1 shrink-0 rounded-full bg-[#2F8F4E]" />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#2F8F4E]">
                    Editing message
                  </p>

                  <p className="truncate text-sm text-[#6B7D70]">
                    {editingText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cancelEditing}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#F3F7F1]"
                  aria-label="Cancel editing"
                >
                  <X size={17} />
                </button>
              </div>
            )}

            {/* Composer */}
            <footer className="shrink-0 border-t border-[#DCE8DD] bg-white px-4 py-4 sm:px-6">
              <div className="mx-auto flex max-w-4xl items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={editingMessageId ? editingText : messageText}
                  onChange={(event) => handleInputChange(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  rows={1}
                  placeholder={
                    editingMessageId
                      ? "Edit message..."
                      : `Message ${selectedAdvisorName}...`
                  }
                  className="max-h-32 min-h-[48px] flex-1 resize-none rounded-3xl border border-[#DCE8DD] bg-[#FAFBF7] px-5 py-3 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
                />

                <button
                  type="button"
                  onClick={() =>
                    editingMessageId ? void saveEdit() : void sendMessage()
                  }
                  disabled={
                    !socketConnected ||
                    sending ||
                    !(editingMessageId
                      ? editingText.trim()
                      : messageText.trim())
                  }
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={editingMessageId ? "Save edit" : "Send message"}
                >
                  {editingMessageId ? (
                    <Check size={19} />
                  ) : (
                    <Send size={19} className="-ml-0.5" />
                  )}
                </button>
              </div>

              <p className="mx-auto mt-2 hidden max-w-4xl text-[11px] text-[#6B7D70] sm:block">
                {socketConnected
                  ? `Enter to ${
                      editingMessageId ? "save" : "send"
                    } • Shift + Enter for a new line`
                  : "Connecting to messaging server..."}
              </p>
            </footer>
          </>
        )}
      </main>

      {/* ============================================================
          STATUS TOAST
      ============================================================ */}

      {statusMessage && (
        <div className="fixed bottom-5 left-1/2 z-[200] w-[calc(100%-24px)] max-w-[420px] -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-xl border border-[#DCE8DD] bg-white px-4 py-3 shadow-xl">
            {statusMessage.type === "error" ? (
              <WifiOff size={18} className="shrink-0 text-red-500" />
            ) : (
              <Check size={18} className="shrink-0 text-[#2F8F4E]" />
            )}

            <p className="flex-1 text-sm font-medium text-[#173B28]">
              {statusMessage.text}
            </p>

            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              aria-label="Dismiss"
            >
              <X size={16} className="text-[#6B7D70]" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          DELETE MESSAGE(S) MODAL
      ============================================================ */}

      {showDeleteModal && deleteTargets.length > 0 && (
        <div
          className="fixed inset-0 z-[300] flex items-end justify-center bg-black/30 backdrop-blur-[1px] sm:items-center"
          onClick={closeDeleteModal}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full overflow-hidden rounded-t-2xl border border-[#DCE8DD] bg-white shadow-2xl sm:max-w-sm sm:rounded-2xl"
          >
            <div className="border-b border-[#DCE8DD] p-4 sm:p-5">
              <h3 className="text-base font-semibold text-[#173B28]">
                Delete{" "}
                {deleteTargets.length === 1
                  ? "message"
                  : `${deleteTargets.length} messages`}
              </h3>

              <p className="mt-1 text-xs text-[#6B7D70] sm:text-sm">
                Choose how you want to delete{" "}
                {deleteTargets.length === 1 ? "this message" : "these messages"}
                .
              </p>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={() => void confirmDelete("me")}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[#F3F7F1]"
              >
                <Trash2 size={18} className="shrink-0 text-[#6B7D70]" />

                <div>
                  <p className="text-sm font-medium text-[#173B28]">
                    Delete for me
                  </p>
                  <p className="text-xs text-[#6B7D70]">
                    Remove it from your messages.
                  </p>
                </div>
              </button>

              {allTargetsOwn && (
                <button
                  type="button"
                  onClick={() => void confirmDelete("everyone")}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-red-50"
                >
                  <Trash2 size={18} className="shrink-0 text-red-500" />

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

            <div className="flex justify-end border-t border-[#DCE8DD] p-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#173B28] hover:bg-[#F3F7F1]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DELETE CONVERSATION MODAL
      ============================================================ */}

      {showDeleteConversationModal && selectedConversation && (
        <div
          className="fixed inset-0 z-[300] flex items-end justify-center bg-black/30 backdrop-blur-[1px] sm:items-center"
          onClick={() => setShowDeleteConversationModal(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full overflow-hidden rounded-t-2xl border border-[#DCE8DD] bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
          >
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Trash2 size={22} />
              </div>

              <h3 className="text-lg font-semibold text-[#173B28]">
                Hide conversation?
              </h3>

              <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#F3F7F1] p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-semibold text-[#176B3A]">
                  {getInitials(selectedAdvisorName)}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#173B28]">
                    {selectedAdvisorName}
                  </p>
                  <p className="truncate text-xs text-[#6B7D70]">
                    {selectedAdvisorEmail}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-[#6B7D70]">
                This removes the conversation from your admin messages. It does
                not permanently remove the stored conversation from the
                database.
              </p>

              <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowDeleteConversationModal(false)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-[#173B28] hover:bg-[#F3F7F1] sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void confirmDeleteConversation()}
                  className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 sm:w-auto"
                >
                  Hide conversation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          DELETE SELECTED CHATS MODAL
      ============================================================ */}

      {showDeleteChatsModal && (
        <div
          className="fixed inset-0 z-[300] flex items-end justify-center bg-black/30 backdrop-blur-[1px] sm:items-center"
          onClick={() => setShowDeleteChatsModal(false)}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className="w-full overflow-hidden rounded-t-2xl border border-[#DCE8DD] bg-white shadow-2xl sm:max-w-md sm:rounded-2xl"
          >
            <div className="p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
                <Trash2 size={22} />
              </div>

              <h3 className="text-lg font-semibold text-[#173B28]">
                Hide {selectedConversationIds.length} chat
                {selectedConversationIds.length === 1 ? "" : "s"}?
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#6B7D70]">
                The selected chats will be removed from your admin messages. The
                conversations stay stored in the database.
              </p>

              <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowDeleteChatsModal(false)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-[#173B28] hover:bg-[#F3F7F1] sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void confirmDeleteSelectedChats()}
                  className="w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 sm:w-auto"
                >
                  Hide chats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
