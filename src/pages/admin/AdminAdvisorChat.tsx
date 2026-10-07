import { FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Edit3,
  MoreVertical,
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
}

interface Conversation {
  conversation_id: string;
  admin_id: string;
  advisor_id: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface AdvisorInfo {
  advisor_id: string;
  name: string;
  email?: string;
  active?: boolean;
}

interface ConversationResponse {
  conversation: Conversation;
  advisor: AdvisorInfo;
}

type DeleteType = "me" | "everyone";

export default function AdminAdvisorChat() {
  const { advisorId } = useParams<{ advisorId: string }>();

  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [advisor, setAdvisor] = useState<AdvisorInfo | null>(null);

  const [messageText, setMessageText] = useState("");

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null,
  );

  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<
    string | null
  >(null);

  const [confirmDeleteConversation, setConfirmDeleteConversation] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [connected, setConnected] = useState(socket.connected);

  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ============================================================
  // SCROLL TO BOTTOM
  // ============================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  // ============================================================
  // LOAD CONVERSATION
  // ============================================================

  useEffect(() => {
    const fetchConversation = async () => {
      if (!advisorId) {
        setError("Advisor ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken");

        if (!token) {
          setError("Admin authentication required.");
          setLoading(false);
          return;
        }

        console.log("Loading admin conversation for advisor:", advisorId);

        const response = await axios.get<ConversationResponse>(
          `http://localhost:5000/api/advisor-admin-conversations/advisor/${advisorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log("Conversation response:", response.data);

        setConversation(response.data.conversation);
        setAdvisor(response.data.advisor);
      } catch (error) {
        console.error("Failed to load conversation:", error);

        if (axios.isAxiosError(error)) {
          console.error("Status:", error.response?.status);

          console.error("Response:", error.response?.data);

          setError(
            error.response?.data?.message || "Failed to load conversation.",
          );
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [advisorId]);

  // ============================================================
  // SOCKET CONNECTION
  // ============================================================

  useEffect(() => {
    const handleConnect = () => {
      console.log("[Socket] Connected:", socket.id);

      setConnected(true);

      setError("");
    };

    const handleDisconnect = (reason: string) => {
      console.log("[Socket] Disconnected:", reason);

      setConnected(false);
    };

    const handleConnectError = (socketError: Error) => {
      console.error("[Socket] Connection error:", socketError);

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

  // ============================================================
  // JOIN CONVERSATION + SOCKET EVENTS
  // ============================================================

  useEffect(() => {
    if (!conversation?.conversation_id) {
      return;
    }

    const conversationId = conversation.conversation_id;

    // ----------------------------------------------------------
    // JOIN
    // ----------------------------------------------------------

    const joinConversation = () => {
      socket.emit("join_conversation", conversationId);

      console.log("[Socket] Joined conversation:", conversationId);
    };

    const handleConnect = () => {
      joinConversation();
    };

    // ----------------------------------------------------------
    // NEW MESSAGE
    // ----------------------------------------------------------

    const handleNewMessage = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      setConversation((currentConversation) => {
        if (!currentConversation) {
          return currentConversation;
        }

        const alreadyExists = currentConversation.messages.some(
          (message) => message.message_id === data.message.message_id,
        );

        if (alreadyExists) {
          return currentConversation;
        }

        return {
          ...currentConversation,

          messages: [...currentConversation.messages, data.message],

          updatedAt: data.message.timestamp,
        };
      });

      // Mark advisor message as delivered.
      if (data.message.sender === "advisor") {
        socket.emit("mark_message_delivered", {
          conversation_id: conversationId,

          message_id: data.message.message_id,
        });
      }

      // Our own message was accepted.
      if (data.message.sender === "admin") {
        setSending(false);
      }
    };

    // ----------------------------------------------------------
    // MESSAGE EDITED
    // ----------------------------------------------------------

    const handleMessageEdited = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      setConversation((currentConversation) => {
        if (!currentConversation) {
          return currentConversation;
        }

        return {
          ...currentConversation,

          messages: currentConversation.messages.map((message) =>
            message.message_id === data.message.message_id
              ? data.message
              : message,
          ),
        };
      });

      setEditingMessageId(null);
      setEditingText("");
      setSelectedMessageId(null);
    };

    // ----------------------------------------------------------
    // DELETE FOR ME
    // ----------------------------------------------------------

    const handleMessageDeletedForMe = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      setConversation((currentConversation) => {
        if (!currentConversation) {
          return currentConversation;
        }

        return {
          ...currentConversation,

          messages: currentConversation.messages.filter(
            (message) => message.message_id !== data.message_id,
          ),
        };
      });

      setSelectedMessageId(null);
      setConfirmDeleteMessageId(null);
    };

    // ----------------------------------------------------------
    // DELETE FOR EVERYONE
    // ----------------------------------------------------------

    const handleMessageDeletedForEveryone = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      setConversation((currentConversation) => {
        if (!currentConversation) {
          return currentConversation;
        }

        return {
          ...currentConversation,

          messages: currentConversation.messages.map((message) =>
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

      setSelectedMessageId(null);
      setConfirmDeleteMessageId(null);

      setEditingMessageId(null);
      setEditingText("");
    };

    // ----------------------------------------------------------
    // BACKWARD COMPATIBILITY
    // ----------------------------------------------------------

    const handleMessageDeleted = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      setConversation((currentConversation) => {
        if (!currentConversation) {
          return currentConversation;
        }

        return {
          ...currentConversation,

          messages: currentConversation.messages.map((message) =>
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

      setSelectedMessageId(null);
      setConfirmDeleteMessageId(null);
    };

    // ----------------------------------------------------------
    // MESSAGE DELIVERED
    // ----------------------------------------------------------

    const handleMessageDelivered = (data: {
      conversation_id: string;
      message_id: string;
      deliveredAt: string;
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      setConversation((currentConversation) => {
        if (!currentConversation) {
          return currentConversation;
        }

        return {
          ...currentConversation,

          messages: currentConversation.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,

                  deliveredAt: data.deliveredAt,
                }
              : message,
          ),
        };
      });
    };

    // ----------------------------------------------------------
    // MESSAGE READ
    // ----------------------------------------------------------

    const handleMessageRead = (data: {
      conversation_id: string;
      message_id: string;
      readAt: string;
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      setConversation((currentConversation) => {
        if (!currentConversation) {
          return currentConversation;
        }

        return {
          ...currentConversation,

          messages: currentConversation.messages.map((message) =>
            message.message_id === data.message_id
              ? {
                  ...message,

                  readAt: data.readAt,
                }
              : message,
          ),
        };
      });
    };

    // ----------------------------------------------------------
    // CONVERSATION HIDDEN
    // ----------------------------------------------------------

    const handleConversationDeleted = (data: {
      conversation_id: string;
      deletedFor: "admin" | "advisor";
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      if (data.deletedFor === "admin") {
        navigate("/admin/messages");
      }
    };

    // ----------------------------------------------------------
    // SOCKET ERROR
    // ----------------------------------------------------------

    const handleMessageError = (data: { message?: string }) => {
      console.error("Message error:", data.message);

      setError(data.message || "Message operation failed.");

      setSending(false);
    };

    // ----------------------------------------------------------
    // REGISTER EVENTS
    // ----------------------------------------------------------

    socket.on("connect", handleConnect);

    socket.on("new_message", handleNewMessage);

    socket.on("message_edited", handleMessageEdited);

    socket.on("message_deleted_for_me", handleMessageDeletedForMe);

    socket.on("message_deleted_for_everyone", handleMessageDeletedForEveryone);

    socket.on("message_deleted", handleMessageDeleted);

    socket.on("message_delivered", handleMessageDelivered);

    socket.on("message_read", handleMessageRead);

    socket.on("conversation_deleted", handleConversationDeleted);

    socket.on("message_error", handleMessageError);

    // ----------------------------------------------------------
    // CONNECT / JOIN
    // ----------------------------------------------------------

    if (socket.connected) {
      joinConversation();
    } else {
      socket.connect();
    }

    // ----------------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------------

    return () => {
      socket.off("connect", handleConnect);

      socket.off("new_message", handleNewMessage);

      socket.off("message_edited", handleMessageEdited);

      socket.off("message_deleted_for_me", handleMessageDeletedForMe);

      socket.off(
        "message_deleted_for_everyone",
        handleMessageDeletedForEveryone,
      );

      socket.off("message_deleted", handleMessageDeleted);

      socket.off("message_delivered", handleMessageDelivered);

      socket.off("message_read", handleMessageRead);

      socket.off("conversation_deleted", handleConversationDeleted);

      socket.off("message_error", handleMessageError);
    };
  }, [conversation?.conversation_id, navigate]);

  // ============================================================
  // MARK ADVISOR MESSAGES AS READ
  // ============================================================

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const unreadAdvisorMessages = conversation.messages.filter(
      (message) =>
        message.sender === "advisor" &&
        !message.readAt &&
        !message.deletedForAdmin,
    );

    unreadAdvisorMessages.forEach((message) => {
      socket.emit("mark_message_read", {
        conversation_id: conversation.conversation_id,

        message_id: message.message_id,
      });
    });
  }, [conversation?.messages.length]);

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages.length]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!conversation) {
      return;
    }

    const text = messageText.trim();

    if (!text) {
      return;
    }

    if (!socket.connected) {
      setError("Chat connection is not available.");
      return;
    }

    setSending(true);
    setError("");

    socket.emit("send_message", {
      conversation_id: conversation.conversation_id,

      sender: "admin",

      text,
    });

    setMessageText("");
  };

  // ============================================================
  // START EDITING
  // ============================================================

  const startEditing = (message: Message) => {
    if (
      message.sender !== "admin" ||
      message.deleted ||
      message.deletedForEveryone
    ) {
      return;
    }

    setEditingMessageId(message.message_id);

    setEditingText(message.text);

    setSelectedMessageId(null);

    setConfirmDeleteMessageId(null);
  };

  // ============================================================
  // CANCEL EDITING
  // ============================================================

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  // ============================================================
  // SAVE EDIT
  // ============================================================

  const saveEdit = () => {
    if (!conversation || !editingMessageId || !editingText.trim()) {
      return;
    }

    if (!socket.connected) {
      setError("Chat connection is not available.");
      return;
    }

    socket.emit("edit_message", {
      conversation_id: conversation.conversation_id,

      message_id: editingMessageId,

      sender: "admin",

      text: editingText.trim(),
    });
  };

  // ============================================================
  // REQUEST DELETE
  // ============================================================

  const requestDeleteMessage = (messageId: string) => {
    setSelectedMessageId(null);

    setConfirmDeleteMessageId(messageId);
  };

  // ============================================================
  // DELETE MESSAGE
  // ============================================================

  const deleteMessage = (messageId: string, deleteType: DeleteType) => {
    if (!conversation) {
      return;
    }

    if (!socket.connected) {
      setError("Chat connection is not available.");
      return;
    }

    socket.emit("delete_message", {
      conversation_id: conversation.conversation_id,

      message_id: messageId,

      sender: "admin",

      deleteType,
    });

    setConfirmDeleteMessageId(null);
    setSelectedMessageId(null);
  };

  // ============================================================
  // HIDE WHOLE CONVERSATION
  // ============================================================

  const deleteConversation = () => {
    if (!conversation) {
      return;
    }

    if (!socket.connected) {
      setError("Chat connection is not available.");
      return;
    }

    socket.emit("delete_conversation", {
      conversation_id: conversation.conversation_id,

      sender: "admin",
    });

    setConfirmDeleteConversation(false);
  };

  // ============================================================
  // MESSAGE STATUS
  // ============================================================

  const renderMessageStatus = (message: Message) => {
    if (message.sender !== "admin") {
      return null;
    }

    if (message.readAt) {
      return <CheckCheck size={15} className="text-sky-400" />;
    }

    if (message.deliveredAt) {
      return <CheckCheck size={15} className="text-white/60" />;
    }

    return <Check size={15} className="text-white/60" />;
  };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efeae2]">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />

          <p className="mt-4 text-sm text-slate-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR WITHOUT CONVERSATION
  // ============================================================

  if (error && !conversation) {
    return (
      <div className="min-h-screen bg-[#efeae2] p-6">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/admin/messages")}
            className="mb-6 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <ArrowLeft size={18} />
            Back to Messages
          </button>

          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  const advisorName = advisor?.name || "Advisor";

  return (
    <div className="flex min-h-screen flex-col bg-[#efeae2]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-[72px] w-full max-w-6xl items-center px-4">
          <button
            type="button"
            onClick={() => navigate("/admin/messages")}
            className="mr-3 rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Back to messages"
          >
            <ArrowLeft size={22} />
          </button>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            {advisorName.charAt(0).toUpperCase()}
          </div>

          <div className="ml-3 min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-900">
              {advisorName}
            </h1>

            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              <p className="text-xs text-slate-500">
                {connected ? "Online" : "Disconnected"}
              </p>
            </div>
          </div>

          <div className="relative ml-auto">
            <button
              type="button"
              onClick={() =>
                setConfirmDeleteConversation((current) => !current)
              }
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Conversation options"
            >
              <MoreVertical size={21} />
            </button>

            {confirmDeleteConversation && (
              <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <p className="text-sm font-semibold text-slate-900">
                  Hide conversation?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  The conversation and its messages will remain safely stored in
                  MongoDB.
                </p>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteConversation(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={deleteConversation}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                  >
                    Hide
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mx-auto mt-3 w-full max-w-6xl px-4">
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button type="button" onClick={() => setError("")} className="ml-4">
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          CHAT AREA
      ===================================================== */}

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-0 sm:px-4 sm:py-4">
        <div className="flex flex-1 flex-col overflow-hidden bg-[#efeae2] sm:rounded-xl sm:shadow-sm">
          {/* Messages */}

          <div className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
            {conversation.messages.length === 0 ? (
              <div className="flex min-h-[500px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                    <div className="text-2xl">💬</div>
                  </div>

                  <h2 className="mt-4 font-semibold text-slate-700">
                    No messages yet
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Send a message to {advisorName}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {conversation.messages.map((message) => {
                  const isAdmin = message.sender === "admin";

                  const isSelected = selectedMessageId === message.message_id;

                  const isEditing = editingMessageId === message.message_id;

                  const isConfirmingDelete =
                    confirmDeleteMessageId === message.message_id;

                  const isDeleted = Boolean(
                    message.deletedForEveryone || message.deleted,
                  );

                  return (
                    <div
                      key={message.message_id}
                      className={`flex ${
                        isAdmin ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`relative flex max-w-[88%] sm:max-w-[70%] ${
                          isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* DELETE OPTIONS */}

                        {isConfirmingDelete && (
                          <div
                            className={`absolute bottom-full z-50 mb-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-2xl ${
                              isAdmin ? "right-0" : "left-0"
                            }`}
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              Delete message?
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              Choose how you want to delete this message.
                            </p>

                            <div className="mt-4 space-y-2">
                              <button
                                type="button"
                                onClick={() =>
                                  deleteMessage(message.message_id, "me")
                                }
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                <span className="block font-semibold">
                                  Delete for me
                                </span>

                                <span className="mt-0.5 block text-[11px] text-slate-400">
                                  Remove it from your view only.
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteMessage(message.message_id, "everyone")
                                }
                                className="w-full rounded-lg border border-red-100 px-3 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
                              >
                                <span className="block font-semibold">
                                  Delete for everyone
                                </span>

                                <span className="mt-0.5 block text-[11px] text-red-400">
                                  Replace it with a deleted message for both
                                  sides.
                                </span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setConfirmDeleteMessageId(null)}
                                className="w-full rounded-lg px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* ACTION MENU */}

                        {isSelected && isAdmin && !isDeleted && (
                          <div className="absolute bottom-full right-0 z-40 mb-2 flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                            <button
                              type="button"
                              onClick={() => startEditing(message)}
                              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Edit3 size={14} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                requestDeleteMessage(message.message_id)
                              }
                              className="flex items-center gap-2 border-l border-slate-200 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}

                        {/* EDIT MODE */}

                        {isEditing ? (
                          <div className="w-[380px] max-w-[85vw] rounded-2xl bg-emerald-600 p-3 shadow-md">
                            <textarea
                              value={editingText}
                              onChange={(event) =>
                                setEditingText(event.target.value)
                              }
                              autoFocus
                              rows={3}
                              className="w-full resize-none rounded-xl bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                            />

                            <div className="mt-2 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="flex items-center gap-1 rounded-full border border-white/30 px-3 py-1.5 text-xs text-white hover:bg-white/10"
                              >
                                <X size={13} />
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={saveEdit}
                                disabled={!editingText.trim()}
                                className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`group relative ${
                              isAdmin
                                ? "rounded-2xl rounded-br-md bg-[#d9fdd3]"
                                : "rounded-2xl rounded-bl-md bg-white"
                            } px-3 py-2 shadow-sm`}
                          >
                            {/* Click admin message */}

                            {isAdmin && !isDeleted && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedMessageId(
                                    isSelected ? null : message.message_id,
                                  );

                                  setConfirmDeleteMessageId(null);
                                }}
                                className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
                                aria-label="Message options"
                              />
                            )}

                            {/* Sender */}

                            <p className="relative z-0 mb-0.5 text-[10px] font-semibold text-slate-500">
                              {isAdmin ? "You" : advisorName}
                            </p>

                            {/* Content */}

                            {isDeleted ? (
                              <p className="relative z-0 pr-1 text-sm italic leading-5 text-slate-500">
                                This message was deleted
                              </p>
                            ) : (
                              <p className="relative z-0 whitespace-pre-wrap break-words pr-1 text-sm leading-5 text-slate-800">
                                {message.text}
                              </p>
                            )}

                            {/* Time + status */}

                            <div className="relative z-20 mt-1 flex items-center justify-end gap-1">
                              {message.edited && !isDeleted && (
                                <span className="text-[9px] text-slate-400">
                                  edited
                                </span>
                              )}

                              <span className="text-[9px] text-slate-400">
                                {formatMessageTime(message.timestamp)}
                              </span>

                              {renderMessageStatus(message)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}

          <form
            onSubmit={handleSendMessage}
            className="border-t border-slate-200 bg-[#f0f2f5] px-3 py-3 sm:px-4"
          >
            <div className="flex items-end gap-2">
              <textarea
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();

                    if (messageText.trim() && !sending) {
                      event.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                rows={1}
                placeholder={`Message ${advisorName}...`}
                disabled={sending}
                className="min-h-[46px] flex-1 resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
              />

              <button
                type="submit"
                disabled={!messageText.trim() || sending || !connected}
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={19} />
              </button>
            </div>

            <p className="mt-1.5 px-2 text-[10px] text-slate-400">
              Enter to send · Shift + Enter for a new line
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
