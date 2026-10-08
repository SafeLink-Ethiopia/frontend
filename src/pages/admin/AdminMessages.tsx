import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import axios from "axios";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Edit3,
  MoreVertical,
  Search,
  Send,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";

import socket from "../../services/socket";

/* =========================================================
   TYPES
========================================================= */

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

type ConfirmationType = "delete-message" | "delete-conversation" | null;

interface StatusMessage {
  type: "success" | "error" | "info";
  text: string;
}

const API_URL = "http://localhost:5000/api";

/* =========================================================
   COMPONENT
========================================================= */

export default function AdminMessages() {
  /* =======================================================
     STATE
  ======================================================= */

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const [socketConnected, setSocketConnected] = useState(socket.connected);

  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null,
  );

  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  const [deleteMessageTarget, setDeleteMessageTarget] =
    useState<Message | null>(null);

  const [confirmationType, setConfirmationType] =
    useState<ConfirmationType>(null);

  const [deletingMessage, setDeletingMessage] = useState(false);

  const [conversationMenuOpen, setConversationMenuOpen] = useState(false);

  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* =======================================================
     STATUS
  ======================================================= */

  const showStatus = (type: "success" | "error" | "info", text: string) => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }

    setStatusMessage({
      type,
      text,
    });

    statusTimerRef.current = setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  /* =======================================================
     SELECTED CONVERSATION
  ======================================================= */

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) {
      return null;
    }

    return (
      conversations.find(
        (conversation) =>
          conversation.conversation_id === selectedConversationId,
      ) || null
    );
  }, [conversations, selectedConversationId]);

  /* =======================================================
     ADVISOR HELPERS
  ======================================================= */

  const getAdvisor = (advisorId: string) => {
    return advisors.find((advisor) => advisor.advisor_id === advisorId);
  };

  const getAdvisorName = (advisorId: string) => {
    return getAdvisor(advisorId)?.name || "Advisor";
  };

  const getAdvisorEmail = (advisorId: string) => {
    return getAdvisor(advisorId)?.email || "";
  };

  const getInitials = (name: string) => {
    if (!name.trim()) {
      return "A";
    }

    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  /* =======================================================
     DATE HELPERS
  ======================================================= */

  const formatTime = (value: string | Date) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatConversationTime = (conversation: Conversation) => {
    const messages = conversation.messages || [];

    const visibleMessages = messages.filter(
      (message) => !message.deletedForAdmin,
    );

    const lastMessage = visibleMessages[visibleMessages.length - 1];

    if (lastMessage) {
      return formatTime(lastMessage.timestamp);
    }

    return formatTime(conversation.updatedAt);
  };

  /* =======================================================
     MESSAGE HELPERS
  ======================================================= */

  const isDeletedForAdmin = (message: Message) => {
    return Boolean(
      message.deletedForAdmin || message.deletedForEveryone || message.deleted,
    );
  };

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const advisorName = getAdvisorName(conversation.advisor_id).toLowerCase();

      const advisorEmail = getAdvisorEmail(
        conversation.advisor_id,
      ).toLowerCase();

      return advisorName.includes(query) || advisorEmail.includes(query);
    });
  }, [conversations, search, advisors]);

  /* =======================================================
     LOAD DATA
  ======================================================= */

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

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [conversationResponse, advisorResponse] = await Promise.all([
          axios.get<ConversationsResponse>(
            `${API_URL}/advisor-admin-conversations`,
            config,
          ),
          axios.get<AdvisorsResponse>(`${API_URL}/advisors`, config),
        ]);

        const loadedConversations =
          conversationResponse.data.conversations || [];

        const loadedAdvisors = advisorResponse.data.advisors || [];

        setConversations(loadedConversations);
        setAdvisors(loadedAdvisors);

        if (loadedConversations.length > 0) {
          setSelectedConversationId(loadedConversations[0].conversation_id);
        }
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

  /* =======================================================
     SOCKET CONNECTION
  ======================================================= */

  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected:", socket.id);

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
      setDeletingMessage(false);

      showStatus("error", data?.message || "Message operation failed.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("message_error", handleMessageError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message_error", handleMessageError);
    };
  }, [selectedConversationId]);

  /* =======================================================
     JOIN CONVERSATION
  ======================================================= */

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    if (socket.connected) {
      socket.emit("join_conversation", selectedConversationId);
    }
  }, [selectedConversationId, socketConnected]);

  /* =======================================================
     NEW MESSAGE
  ======================================================= */

  useEffect(() => {
    const handleNewMessage = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (!data?.conversation_id || !data?.message) {
        return;
      }

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.conversation_id !== data.conversation_id) {
            return conversation;
          }

          const exists = conversation.messages.some(
            (message) => message.message_id === data.message.message_id,
          );

          if (exists) {
            return {
              ...conversation,
              updatedAt:
                data.message.timestamp?.toString() || conversation.updatedAt,
              deletedForAdmin: false,
            };
          }

          return {
            ...conversation,
            messages: [...conversation.messages, data.message],
            updatedAt:
              data.message.timestamp?.toString() || conversation.updatedAt,
            deletedForAdmin: false,
          };
        }),
      );

      if (
        data.message.sender === "admin" &&
        data.conversation_id === selectedConversationId
      ) {
        setSending(false);
        setMessageText("");
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
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [selectedConversationId]);

  /* =======================================================
     MESSAGE EDITED
  ======================================================= */

  useEffect(() => {
    const handleMessageEdited = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (!data?.conversation_id || !data?.message) {
        return;
      }

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.conversation_id !== data.conversation_id) {
            return conversation;
          }

          return {
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.message_id === data.message.message_id
                ? {
                    ...message,
                    text: data.message.text ?? message.text,
                    edited: true,
                    timestamp: message.timestamp,
                    deliveredAt:
                      data.message.deliveredAt ?? message.deliveredAt,
                    readAt: data.message.readAt ?? message.readAt,
                    deleted: data.message.deleted ?? message.deleted,
                    deletedForAdmin:
                      data.message.deletedForAdmin ?? message.deletedForAdmin,
                    deletedForEveryone:
                      data.message.deletedForEveryone ??
                      message.deletedForEveryone,
                  }
                : message,
            ),
          };
        }),
      );

      setEditingMessageId(null);
      setEditingText("");

      showStatus("success", "Message edited.");
    };

    socket.on("message_edited", handleMessageEdited);

    return () => {
      socket.off("message_edited", handleMessageEdited);
    };
  }, []);

  /* =======================================================
     MESSAGE DELETED FOR ME
  ======================================================= */

  useEffect(() => {
    const handleDeletedForMe = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (!data?.conversation_id || !data?.message_id) {
        return;
      }

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.conversation_id !== data.conversation_id) {
            return conversation;
          }

          return {
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.message_id === data.message_id
                ? {
                    ...message,
                    deletedForAdmin: true,
                  }
                : message,
            ),
          };
        }),
      );

      setDeletingMessage(false);
      closeDeleteDialog();
      showStatus("success", "Message deleted for you.");
    };

    socket.on("message_deleted_for_me", handleDeletedForMe);

    return () => {
      socket.off("message_deleted_for_me", handleDeletedForMe);
    };
  }, []);

  /* =======================================================
     MESSAGE DELETED FOR EVERYONE
  ======================================================= */

  useEffect(() => {
    const handleDeletedForEveryone = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (!data?.conversation_id || !data?.message_id) {
        return;
      }

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.conversation_id !== data.conversation_id) {
            return conversation;
          }

          return {
            ...conversation,
            messages: conversation.messages.map((message) =>
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
        }),
      );

      setDeletingMessage(false);
      closeDeleteDialog();

      showStatus("success", "Message deleted for everyone.");
    };

    socket.on("message_deleted_for_everyone", handleDeletedForEveryone);

    return () => {
      socket.off("message_deleted_for_everyone", handleDeletedForEveryone);
    };
  }, []);

  /* =======================================================
     MESSAGE DELIVERED
  ======================================================= */

  useEffect(() => {
    const handleDelivered = (data: {
      conversation_id: string;
      message_id: string;
      deliveredAt: string | Date;
    }) => {
      if (!data?.conversation_id || !data?.message_id) {
        return;
      }

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.conversation_id !== data.conversation_id) {
            return conversation;
          }

          return {
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.message_id === data.message_id
                ? {
                    ...message,
                    deliveredAt: data.deliveredAt,
                  }
                : message,
            ),
          };
        }),
      );
    };

    socket.on("message_delivered", handleDelivered);

    return () => {
      socket.off("message_delivered", handleDelivered);
    };
  }, []);

  /* =======================================================
     MESSAGE READ
  ======================================================= */

  useEffect(() => {
    const handleRead = (data: {
      conversation_id: string;
      message_id: string;
      readAt: string | Date;
    }) => {
      if (!data?.conversation_id || !data?.message_id) {
        return;
      }

      setConversations((current) =>
        current.map((conversation) => {
          if (conversation.conversation_id !== data.conversation_id) {
            return conversation;
          }

          return {
            ...conversation,
            messages: conversation.messages.map((message) =>
              message.message_id === data.message_id
                ? {
                    ...message,
                    readAt: data.readAt,
                  }
                : message,
            ),
          };
        }),
      );
    };

    socket.on("message_read", handleRead);

    return () => {
      socket.off("message_read", handleRead);
    };
  }, []);

  /* =======================================================
     CONVERSATION DELETED
  ======================================================= */

  useEffect(() => {
    const handleConversationDeleted = (data: {
      conversation_id: string;
      deletedFor: "admin" | "advisor";
    }) => {
      if (!data?.conversation_id || data.deletedFor !== "admin") {
        return;
      }

      setConversations((current) =>
        current.filter(
          (conversation) =>
            conversation.conversation_id !== data.conversation_id,
        ),
      );

      setSelectedConversationId((current) =>
        current === data.conversation_id ? null : current,
      );

      setMobileChatOpen(false);

      showStatus("success", "Conversation removed.");
    };

    socket.on("conversation_deleted", handleConversationDeleted);

    return () => {
      socket.off("conversation_deleted", handleConversationDeleted);
    };
  }, []);

  /* =======================================================
     MARK EXISTING ADVISOR MESSAGES READ
  ======================================================= */

  useEffect(() => {
    if (!selectedConversation || !socket.connected) {
      return;
    }

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
  }, [selectedConversationId, socketConnected]);

  /* =======================================================
     AUTO SCROLL
  ======================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedConversation?.messages]);

  /* =======================================================
     ENSURE SOCKET
  ======================================================= */

  const ensureSocketConnected = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (socket.connected) {
        resolve();
        return;
      }

      const handleConnect = () => {
        clearTimeout(timeout);

        socket.off("connect", handleConnect);

        resolve();
      };

      const timeout = setTimeout(() => {
        socket.off("connect", handleConnect);

        reject(new Error("Socket connection timed out."));
      }, 5000);

      socket.once("connect", handleConnect);

      socket.connect();
    });
  };

  /* =======================================================
     SELECT CONVERSATION
  ======================================================= */

  const selectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);

    setMobileChatOpen(true);
    setActiveMessageId(null);
    setEditingMessageId(null);
    setEditingText("");
    setMessageText("");
    setConversationMenuOpen(false);

    if (socket.connected) {
      socket.emit("join_conversation", conversationId);
    }
  };

  /* =======================================================
     SEND MESSAGE
  ======================================================= */

  const sendMessage = async () => {
    const text = messageText.trim();

    if (!text) {
      return;
    }

    if (!selectedConversation) {
      showStatus("error", "Select a conversation first.");
      return;
    }

    if (sending) {
      return;
    }

    try {
      setSending(true);

      await ensureSocketConnected();

      socket.emit("send_message", {
        conversation_id: selectedConversation.conversation_id,
        sender: "admin",
        text,
      });
    } catch (error) {
      console.error("Send failed:", error);

      setSending(false);

      showStatus("error", "Could not connect to the messaging server.");
    }
  };

  /* =======================================================
     SEND KEY
  ======================================================= */

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const startEditingMessage = (message: Message) => {
    if (message.sender !== "admin") {
      return;
    }

    if (isDeletedForAdmin(message)) {
      return;
    }

    setEditingMessageId(message.message_id);

    setEditingText(message.text);
    setActiveMessageId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEditedMessage = async () => {
    const text = editingText.trim();

    if (!text || !selectedConversation || !editingMessageId) {
      return;
    }

    try {
      await ensureSocketConnected();

      socket.emit("edit_message", {
        conversation_id: selectedConversation.conversation_id,
        message_id: editingMessageId,
        sender: "admin",
        text,
      });
    } catch (error) {
      console.error("Edit failed:", error);

      showStatus("error", "Could not connect to the messaging server.");
    }
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void saveEditedMessage();
    }

    if (event.key === "Escape") {
      cancelEditing();
    }
  };

  /* =======================================================
     DELETE MESSAGE
  ======================================================= */

  const openDeleteMessageConfirmation = (message: Message) => {
    if (message.sender !== "admin") {
      return;
    }

    if (isDeletedForAdmin(message)) {
      return;
    }

    setDeleteMessageTarget(message);
    setConfirmationType("delete-message");
    setActiveMessageId(null);
  };

  const confirmDeleteMessage = async (type: DeleteType) => {
    if (!deleteMessageTarget || !selectedConversation || deletingMessage) {
      return;
    }

    try {
      setDeletingMessage(true);

      await ensureSocketConnected();

      socket.emit("delete_message", {
        conversation_id: selectedConversation.conversation_id,
        message_id: deleteMessageTarget.message_id,
        sender: "admin",
        deleteType: type,
      });
    } catch (error) {
      console.error("Delete failed:", error);

      setDeletingMessage(false);

      showStatus("error", "Could not connect to the messaging server.");
    }
  };

  const closeDeleteDialog = () => {
    setDeleteMessageTarget(null);
    setConfirmationType(null);
    setDeletingMessage(false);
  };

  /* =======================================================
     DELETE CONVERSATION
  ======================================================= */

  const openDeleteConversationConfirmation = () => {
    setConversationMenuOpen(false);
    setConfirmationType("delete-conversation");
  };

  const confirmDeleteConversation = async () => {
    if (!selectedConversation) {
      return;
    }

    try {
      await ensureSocketConnected();

      socket.emit("delete_conversation", {
        conversation_id: selectedConversation.conversation_id,
        sender: "admin",
      });

      setConfirmationType(null);
    } catch (error) {
      console.error("Delete conversation failed:", error);

      showStatus("error", "Could not connect to the messaging server.");
    }
  };

  /* =======================================================
     MESSAGE CLICK
  ======================================================= */

  const handleMessageClick = (
    message: Message,
    event: MouseEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();

    if (message.sender !== "admin") {
      setActiveMessageId(null);
      return;
    }

    if (isDeletedForAdmin(message)) {
      setActiveMessageId(null);
      return;
    }

    if (editingMessageId === message.message_id) {
      return;
    }

    setActiveMessageId((current) =>
      current === message.message_id ? null : message.message_id,
    );
  };

  /* =======================================================
     MESSAGE STATUS
  ======================================================= */

  const renderMessageStatus = (message: Message, mobile = false) => {
    if (message.sender !== "admin") {
      return null;
    }

    if (message.readAt) {
      return (
        <CheckCheck
          size={mobile ? 14 : 15}
          strokeWidth={2.8}
          className="text-[#FAFBF7]"
        />
      );
    }

    return (
      <Check
        size={mobile ? 14 : 15}
        strokeWidth={2.8}
        className="text-[#FAFBF7]"
      />
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#FAFBF7]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#E7F1E3] border-t-[#2F8F4E]" />

          <p className="text-sm font-medium text-[#176B3A]">
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div
      className="relative flex h-[calc(100dvh-80px)] overflow-hidden bg-[#FAFBF7] text-[#173B28]"
      onClick={() => {
        setActiveMessageId(null);
        setConversationMenuOpen(false);
      }}
    >
      {/* ===================================================
          SIDEBAR
      =================================================== */}

      <aside
        className={`
          flex
          w-full
          flex-col
          bg-[#FAFBF7]
          md:max-w-[360px]
          md:border-r
          md:border-[#E7F1E3]
          ${mobileChatOpen ? "hidden md:flex" : "flex"}
        `}
      >
        <div className="border-b border-[#E7F1E3] px-4 pb-4 pt-4 sm:px-5 sm:pt-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#176B3A]">Messages</h1>

              <p className="mt-1 text-xs text-[#2F8F4E]">
                Chat with your advisors
              </p>
            </div>
          </div>

          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2F8F4E]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search advisors..."
              className="w-full rounded-xl border border-[#E7F1E3] bg-white py-2.5 pl-10 pr-4 text-sm text-[#173B28] outline-none transition placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
            />
          </div>
        </div>

        {!socketConnected && (
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-xl border border-[#E7F1E3] bg-[#E7F1E3] px-3 py-2.5 text-xs font-medium text-[#176B3A] sm:mx-4">
            <WifiOff size={14} />
            Connecting...
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F1E3]">
                <Send size={25} className="text-[#2F8F4E]" />
              </div>

              <h3 className="font-semibold text-[#176B3A]">No conversations</h3>

              <p className="mt-1 text-sm text-[#2F8F4E]">
                {search
                  ? "No advisors match your search."
                  : "Start a conversation with an advisor."}
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const advisorName = getAdvisorName(conversation.advisor_id);

              const advisorEmail = getAdvisorEmail(conversation.advisor_id);

              const visibleMessages = conversation.messages.filter(
                (message) => !message.deletedForAdmin,
              );

              const lastMessage = visibleMessages[visibleMessages.length - 1];

              const isSelected =
                conversation.conversation_id === selectedConversationId;

              return (
                <button
                  key={conversation.conversation_id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    selectConversation(conversation.conversation_id);
                  }}
                  className={`
                      flex w-full items-center gap-3
                      border-b border-[#E7F1E3]
                      px-3 py-3.5 sm:px-4
                      text-left
                      transition
                      ${
                        isSelected
                          ? "bg-[#E7F1E3]"
                          : "bg-[#FAFBF7] hover:bg-[#F3F7F1]"
                      }
                    `}
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-bold text-[#176B3A]">
                    {getInitials(advisorName)}

                    {getAdvisor(conversation.advisor_id)?.active && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#FAFBF7] bg-[#2F8F4E]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-[#173B28]">
                        {advisorName}
                      </h3>

                      <span className="shrink-0 text-[10px] text-[#6B7D70]">
                        {formatConversationTime(conversation)}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-[#6B7D70]">
                      {lastMessage
                        ? isDeletedForAdmin(lastMessage)
                          ? "This message was deleted"
                          : lastMessage.sender === "admin"
                            ? `You: ${lastMessage.text}`
                            : lastMessage.text
                        : advisorEmail || "Start a conversation"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ===================================================
          DESKTOP CHAT
      =================================================== */}

      <main className="hidden min-w-0 flex-1 flex-col md:flex">
        {!selectedConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E7F1E3]">
              <Send size={32} className="text-[#2F8F4E]" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#176B3A]">
              Your messages
            </h2>

            <p className="mt-1 text-sm text-[#6B7D70]">
              Select an advisor to start chatting.
            </p>
          </div>
        ) : (
          <>
            {/* CHAT HEADER */}

            <header className="relative flex h-[72px] shrink-0 items-center justify-between border-b border-[#E7F1E3] bg-white px-5 shadow-sm">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-bold text-[#176B3A]">
                  {getInitials(getAdvisorName(selectedConversation.advisor_id))}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-[#173B28]">
                    {getAdvisorName(selectedConversation.advisor_id)}
                  </h2>

                  <p className="truncate text-xs text-[#6B7D70]">
                    {getAdvisorEmail(selectedConversation.advisor_id) ||
                      "Advisor"}
                  </p>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();

                    setConversationMenuOpen((current) => !current);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#173B28] transition hover:bg-[#F3F7F1]"
                >
                  <MoreVertical size={20} />
                </button>

                {conversationMenuOpen && (
                  <div
                    className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-[#DCE8DD] bg-white py-1 shadow-xl"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={openDeleteConversationConfirmation}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                      Delete conversation
                    </button>
                  </div>
                )}
              </div>
            </header>

            {/* MESSAGES */}

            <div
              className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6"
              style={{
                backgroundColor: "#FAFBF7",
                backgroundImage:
                  "radial-gradient(#E7F1E3 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              <div className="mx-auto flex max-w-4xl flex-col gap-2">
                {selectedConversation.messages.length === 0 ? (
                  <div className="flex min-h-[50vh] items-center justify-center">
                    <div className="rounded-2xl border border-[#E7F1E3] bg-white px-6 py-5 text-center shadow-sm">
                      <p className="text-sm font-semibold text-[#176B3A]">
                        No messages yet
                      </p>

                      <p className="mt-1 text-xs text-[#6B7D70]">
                        Send a message to start the conversation.
                      </p>
                    </div>
                  </div>
                ) : (
                  selectedConversation.messages.map((message) => {
                    if (
                      message.sender === "advisor" &&
                      message.deletedForAdmin
                    ) {
                      return null;
                    }

                    if (message.sender === "admin" && message.deletedForAdmin) {
                      return null;
                    }

                    const isAdmin = message.sender === "admin";

                    const deleted = isDeletedForAdmin(message);

                    const isEditing = editingMessageId === message.message_id;

                    const isActive = activeMessageId === message.message_id;

                    return (
                      <div
                        key={message.message_id}
                        className={`flex ${
                          isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div className="relative max-w-[88%] sm:max-w-[78%]">
                          <div
                            onClick={(event) =>
                              handleMessageClick(message, event)
                            }
                            className={`
                                relative
                                rounded-2xl
                                px-3.5 py-2.5
                                shadow-sm
                                ${
                                  isAdmin
                                    ? "rounded-br-md bg-[#E7F1E3] text-[#173B28]"
                                    : "rounded-bl-md border border-[#DCE8DD] bg-white text-[#173B28]"
                                }
                                ${isAdmin && !deleted ? "cursor-pointer" : ""}
                                ${isActive ? "ring-2 ring-[#2F8F4E]/30" : ""}
                              `}
                          >
                            {isEditing ? (
                              <div className="min-w-[230px] sm:min-w-[300px]">
                                <textarea
                                  autoFocus
                                  value={editingText}
                                  onChange={(event) =>
                                    setEditingText(event.target.value)
                                  }
                                  onKeyDown={handleEditKeyDown}
                                  rows={3}
                                  className="w-full resize-none rounded-xl border border-[#DCE8DD] bg-white px-3 py-2 text-sm text-[#173B28] outline-none"
                                />

                                <div className="mt-2 flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={cancelEditing}
                                    className="rounded-lg px-3 py-1.5 text-xs text-[#173B28] hover:bg-white/60"
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="button"
                                    disabled={!editingText.trim()}
                                    onClick={() => void saveEditedMessage()}
                                    className="rounded-lg bg-[#2F8F4E] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : deleted ? (
                              <div className="flex items-center gap-2 italic text-[#6B7D70]">
                                <Trash2 size={14} />

                                <span className="text-sm">
                                  This message was deleted
                                </span>
                              </div>
                            ) : (
                              <>
                                <p className="whitespace-pre-wrap break-words text-sm leading-5">
                                  {message.text}
                                </p>

                                <div className="mt-1 flex items-center justify-end gap-1.5">
                                  <span className="text-[10px] text-[#6B7D70]">
                                    {formatTime(message.timestamp)}
                                  </span>

                                  {message.edited === true && (
                                    <span className="text-[10px] text-[#6B7D70]">
                                      edited
                                    </span>
                                  )}

                                  {isAdmin && (
                                    <span className="inline-flex items-center">
                                      {renderMessageStatus(message)}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>

                          {isActive && isAdmin && !deleted && !isEditing && (
                            <div
                              className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-xl border border-[#DCE8DD] bg-white shadow-xl"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => startEditingMessage(message)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#173B28] hover:bg-[#F3F7F1]"
                              >
                                <Edit3 size={16} />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteMessageConfirmation(message)
                                }
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* INPUT */}

            <div className="shrink-0 border-t border-[#DCE8DD] bg-white px-4 py-3">
              <div className="mx-auto flex max-w-4xl items-end gap-2">
                <textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={`Message ${getAdvisorName(
                    selectedConversation.advisor_id,
                  )}...`}
                  rows={1}
                  disabled={sending}
                  className="max-h-32 min-h-[46px] flex-1 resize-none rounded-2xl border border-[#DCE8DD] bg-[#F3F7F1] px-4 py-3 text-sm text-[#173B28] outline-none transition placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
                />

                <button
                  type="button"
                  onClick={() => void sendMessage()}
                  disabled={!messageText.trim() || sending || !socketConnected}
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] text-white shadow-sm transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Send size={19} />
                  )}
                </button>
              </div>

              <p className="mx-auto mt-2 max-w-4xl text-[10px] text-[#8A968D]">
                {socketConnected
                  ? "Enter to send • Shift + Enter for a new line"
                  : "Connecting to messaging server..."}
              </p>
            </div>
          </>
        )}
      </main>

      {/* ===================================================
          MOBILE CHAT
      =================================================== */}

      {mobileChatOpen && selectedConversation && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#FAFBF7] md:hidden">
          <header className="flex h-[64px] shrink-0 items-center gap-2 border-b border-[#DCE8DD] bg-white px-2.5 shadow-sm">
            <button
              type="button"
              onClick={() => {
                setMobileChatOpen(false);
                setActiveMessageId(null);
                setEditingMessageId(null);
                setEditingText("");
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#173B28] hover:bg-[#F3F7F1]"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-bold text-[#176B3A]">
              {getInitials(getAdvisorName(selectedConversation.advisor_id))}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-[#173B28]">
                {getAdvisorName(selectedConversation.advisor_id)}
              </h2>

              <p className="truncate text-[10px] text-[#6B7D70]">
                {getAdvisorEmail(selectedConversation.advisor_id) || "Advisor"}
              </p>
            </div>

            <button
              type="button"
              onClick={openDeleteConversationConfirmation}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#173B28] hover:bg-[#F3F7F1]"
            >
              <MoreVertical size={19} />
            </button>
          </header>

          <div
            className="flex-1 overflow-y-auto px-2.5 py-4"
            style={{
              backgroundColor: "#FAFBF7",
              backgroundImage: "radial-gradient(#E7F1E3 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          >
            <div className="flex flex-col gap-2">
              {selectedConversation.messages.map((message) => {
                if (message.sender === "advisor" && message.deletedForAdmin) {
                  return null;
                }

                if (message.sender === "admin" && message.deletedForAdmin) {
                  return null;
                }

                const isAdmin = message.sender === "admin";

                const deleted = isDeletedForAdmin(message);

                const isEditing = editingMessageId === message.message_id;

                const isActive = activeMessageId === message.message_id;

                return (
                  <div
                    key={message.message_id}
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      onClick={(event) => handleMessageClick(message, event)}
                      className={`
                            relative
                            max-w-[88%]
                            rounded-2xl
                            px-3 py-2.5
                            ${
                              isAdmin
                                ? "rounded-br-md bg-[#E7F1E3] text-[#173B28]"
                                : "rounded-bl-md border border-[#DCE8DD] bg-white text-[#173B28] shadow-sm"
                            }
                            ${isActive ? "ring-2 ring-[#2F8F4E]/30" : ""}
                          `}
                    >
                      {isEditing ? (
                        <div className="min-w-[210px]">
                          <textarea
                            autoFocus
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            onKeyDown={handleEditKeyDown}
                            rows={3}
                            className="w-full resize-none rounded-xl bg-white p-2 text-sm text-[#173B28] outline-none"
                          />

                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="px-2 py-1 text-xs text-[#173B28]"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              disabled={!editingText.trim()}
                              onClick={() => void saveEditedMessage()}
                              className="rounded-lg bg-[#2F8F4E] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : deleted ? (
                        <div className="flex items-center gap-2 italic text-[#6B7D70]">
                          <Trash2 size={14} />

                          <span className="text-sm">
                            This message was deleted
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap break-words text-sm leading-5">
                            {message.text}
                          </p>

                          <div className="mt-1 flex items-center justify-end gap-1.5">
                            <span className="text-[10px] text-[#6B7D70]">
                              {formatTime(message.timestamp)}
                            </span>

                            {message.edited === true && (
                              <span className="text-[10px] text-[#6B7D70]">
                                edited
                              </span>
                            )}

                            {isAdmin && (
                              <span className="inline-flex">
                                {renderMessageStatus(message, true)}
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {isActive && isAdmin && !deleted && !isEditing && (
                        <div
                          className="absolute bottom-full right-0 z-50 mb-2 flex overflow-hidden rounded-xl border border-[#DCE8DD] bg-white shadow-xl"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => startEditingMessage(message)}
                            className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-[#173B28]"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openDeleteMessageConfirmation(message)
                            }
                            className="flex items-center gap-2 border-l border-[#DCE8DD] px-3 py-2.5 text-xs font-medium text-red-600"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-[#DCE8DD] bg-white p-2.5">
            <div className="flex items-end gap-2">
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder={`Message ${getAdvisorName(
                  selectedConversation.advisor_id,
                )}...`}
                rows={1}
                disabled={sending}
                className="min-h-[44px] flex-1 resize-none rounded-2xl border border-[#DCE8DD] bg-[#F3F7F1] px-3.5 py-2.5 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
              />

              <button
                type="button"
                disabled={!messageText.trim() || sending || !socketConnected}
                onClick={() => void sendMessage()}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] text-white disabled:opacity-40"
              >
                {sending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          STATUS
      =================================================== */}

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

            <button type="button" onClick={() => setStatusMessage(null)}>
              <X size={16} className="text-[#6B7D70]" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          SMALL DELETE MESSAGE MODAL
      =================================================== */}

      {confirmationType === "delete-message" && deleteMessageTarget && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!deletingMessage) {
              closeDeleteDialog();
            }
          }}
        >
          <div
            className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-4 pb-2 pt-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#173B28]">
                    Delete message
                  </h3>

                  <p className="mt-0.5 text-[11px] text-[#6B7D70]">
                    Choose how you want to delete this message.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={deletingMessage}
                  onClick={closeDeleteDialog}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6B7D70] hover:bg-[#F3F7F1]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="mx-4 mt-2 rounded-lg bg-[#F3F7F1] px-3 py-2">
              <p className="line-clamp-2 text-xs text-[#173B28]">
                {deleteMessageTarget.text}
              </p>
            </div>

            <div className="space-y-1.5 p-4">
              <button
                type="button"
                disabled={deletingMessage}
                onClick={() => void confirmDeleteMessage("me")}
                className="flex w-full items-center gap-3 rounded-lg border border-[#DCE8DD] px-3 py-2.5 text-left transition hover:bg-[#F3F7F1]"
              >
                <Trash2 size={16} className="shrink-0 text-[#6B7D70]" />

                <div>
                  <p className="text-xs font-semibold text-[#173B28]">
                    Delete for me
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#6B7D70]">
                    Remove it from your messages.
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={deletingMessage}
                onClick={() => void confirmDeleteMessage("everyone")}
                className="flex w-full items-center gap-3 rounded-lg border border-red-100 px-3 py-2.5 text-left transition hover:bg-red-50"
              >
                <Trash2 size={16} className="shrink-0 text-red-500" />

                <div>
                  <p className="text-xs font-semibold text-red-600">
                    Delete for everyone
                  </p>

                  <p className="mt-0.5 text-[10px] text-[#6B7D70]">
                    Remove it for both users.
                  </p>
                </div>
              </button>

              <button
                type="button"
                disabled={deletingMessage}
                onClick={closeDeleteDialog}
                className="w-full rounded-lg px-3 py-2 text-xs font-medium text-[#6B7D70] hover:bg-[#F3F7F1]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          SMALL DELETE CONVERSATION MODAL
      =================================================== */}

      {confirmationType === "delete-conversation" && selectedConversation && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/35 px-4 backdrop-blur-sm"
          onClick={() => setConfirmationType(null)}
        >
          <div
            className="w-full max-w-[340px] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#173B28]">
                  Delete conversation
                </h3>

                <button
                  type="button"
                  onClick={() => setConfirmationType(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7D70] hover:bg-[#F3F7F1]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3 rounded-lg bg-[#F3F7F1] p-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-xs font-bold text-[#176B3A]">
                  {getInitials(getAdvisorName(selectedConversation.advisor_id))}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#173B28]">
                    {getAdvisorName(selectedConversation.advisor_id)}
                  </p>

                  <p className="truncate text-[10px] text-[#6B7D70]">
                    {getAdvisorEmail(selectedConversation.advisor_id)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmationType(null)}
                  className="flex-1 rounded-lg border border-[#DCE8DD] px-3 py-2 text-xs font-semibold text-[#173B28] hover:bg-[#F3F7F1]"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void confirmDeleteConversation()}
                  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
