import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Edit3,
  LogOut,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import axios from "axios";
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

interface ConversationResponse {
  conversation: Conversation;
}

type DeleteType = "me" | "everyone";

export default function AdvisorAdminChat() {
  const navigate = useNavigate();

  const { conversationId } = useParams<{
    conversationId: string;
  }>();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [message, setMessage] = useState("");

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
  const [error, setError] = useState("");

  const [connected, setConnected] = useState(socket.connected);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const token = localStorage.getItem("advisor_token") ?? "";

  // ============================================================
  // LOAD CONVERSATION
  // ============================================================

  useEffect(() => {
    if (!token) {
      navigate("/advisor/login");
      return;
    }

    if (!conversationId) {
      navigate("/advisor/messages");
      return;
    }

    const loadConversation = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         *
         * The conversation ID is now included in the request.
         *
         * Example:
         *
         * GET
         * /api/advisor-admin-conversations/65abc123
         */

        const response = await axios.get<ConversationResponse>(
          `http://localhost:5000/api/advisor-admin-conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setConversation(response.data.conversation);
      } catch (err) {
        console.error("Failed to load conversation:", err);

        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            localStorage.removeItem("advisor_token");
            localStorage.removeItem("advisor_profile");

            navigate("/advisor/login");
            return;
          }

          setError(
            err.response?.data?.message || "Could not load the conversation.",
          );
        } else {
          setError("Could not load the conversation.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [token, conversationId, navigate]);

  // ============================================================
  // SOCKET CONNECTION
  // ============================================================

  useEffect(() => {
    const handleConnect = () => {
      console.log("[Socket] Connected:", socket.id);

      setConnected(true);
      setError("");
    };

    const handleDisconnect = () => {
      console.log("[Socket] Disconnected");

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

    const currentConversationId = conversation.conversation_id;

    // ==========================================================
    // JOIN
    // ==========================================================

    const joinConversation = () => {
      socket.emit("join_conversation", currentConversationId);

      console.log("[Socket] Joined conversation:", currentConversationId);
    };

    // ==========================================================
    // CONNECT
    // ==========================================================

    const handleConnect = () => {
      joinConversation();
    };

    // ==========================================================
    // NEW MESSAGE
    // ==========================================================

    const handleNewMessage = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (data.conversation_id !== currentConversationId) {
        return;
      }

      setConversation((current) => {
        if (!current) {
          return current;
        }

        const alreadyExists = current.messages.some(
          (msg) => msg.message_id === data.message.message_id,
        );

        if (alreadyExists) {
          return current;
        }

        return {
          ...current,

          messages: [...current.messages, data.message],

          updatedAt: data.message.timestamp,
        };
      });

      // Mark ADMIN messages as delivered.
      if (data.message.sender === "admin") {
        socket.emit("mark_message_delivered", {
          conversation_id: currentConversationId,

          message_id: data.message.message_id,
        });
      }

      // Our advisor message was accepted.
      if (data.message.sender === "advisor") {
        setSending(false);
      }
    };

    // ==========================================================
    // MESSAGE EDITED
    // ==========================================================

    const handleMessageEdited = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (data.conversation_id !== currentConversationId) {
        return;
      }

      setConversation((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          messages: current.messages.map((msg) =>
            msg.message_id === data.message.message_id ? data.message : msg,
          ),
        };
      });

      setEditingMessageId(null);
      setEditingText("");
      setSelectedMessageId(null);
    };

    // ==========================================================
    // DELETE FOR ME
    // ==========================================================

    const handleMessageDeletedForMe = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (data.conversation_id !== currentConversationId) {
        return;
      }

      setConversation((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          messages: current.messages.filter(
            (msg) => msg.message_id !== data.message_id,
          ),
        };
      });

      setSelectedMessageId(null);
      setConfirmDeleteMessageId(null);
    };

    // ==========================================================
    // DELETE FOR EVERYONE
    // ==========================================================

    const handleMessageDeletedForEveryone = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (data.conversation_id !== currentConversationId) {
        return;
      }

      setConversation((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          messages: current.messages.map((msg) =>
            msg.message_id === data.message_id
              ? {
                  ...msg,

                  deleted: true,
                  deletedForEveryone: true,
                  edited: false,
                }
              : msg,
          ),
        };
      });

      setSelectedMessageId(null);
      setConfirmDeleteMessageId(null);
      setEditingMessageId(null);
      setEditingText("");
    };

    // ==========================================================
    // BACKWARD COMPATIBILITY
    // ==========================================================

    const handleMessageDeleted = (data: {
      conversation_id: string;
      message_id: string;
    }) => {
      if (data.conversation_id !== currentConversationId) {
        return;
      }

      setConversation((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          messages: current.messages.map((msg) =>
            msg.message_id === data.message_id
              ? {
                  ...msg,

                  deleted: true,
                  deletedForEveryone: true,
                  edited: false,
                }
              : msg,
          ),
        };
      });

      setSelectedMessageId(null);
      setConfirmDeleteMessageId(null);
    };

    // ==========================================================
    // MESSAGE DELIVERED
    // ==========================================================

    const handleMessageDelivered = (data: {
      conversation_id: string;
      message_id: string;
      deliveredAt: string;
    }) => {
      if (data.conversation_id !== currentConversationId) {
        return;
      }

      setConversation((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          messages: current.messages.map((msg) =>
            msg.message_id === data.message_id
              ? {
                  ...msg,
                  deliveredAt: data.deliveredAt,
                }
              : msg,
          ),
        };
      });
    };

    // ==========================================================
    // MESSAGE READ
    // ==========================================================

    const handleMessageRead = (data: {
      conversation_id: string;
      message_id: string;
      readAt: string;
    }) => {
      if (data.conversation_id !== currentConversationId) {
        return;
      }

      setConversation((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,

          messages: current.messages.map((msg) =>
            msg.message_id === data.message_id
              ? {
                  ...msg,
                  readAt: data.readAt,
                }
              : msg,
          ),
        };
      });
    };

    // ==========================================================
    // CONVERSATION DELETED
    // ==========================================================

    const handleConversationDeleted = (data: {
      conversation_id: string;
      deletedFor: "admin" | "advisor";
    }) => {
      if (data.conversation_id !== currentConversationId) {
        return;
      }

      if (data.deletedFor === "advisor") {
        setConfirmDeleteConversation(false);

        navigate("/advisor/messages");
      }
    };

    // ==========================================================
    // MESSAGE ERROR
    // ==========================================================

    const handleMessageError = (data: { message?: string }) => {
      console.error("[Socket] Message error:", data.message);

      setError(data.message || "Message operation failed.");

      setSending(false);
      setConfirmDeleteMessageId(null);
      setConfirmDeleteConversation(false);
    };

    // ==========================================================
    // REGISTER EVENTS
    // ==========================================================

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

    // Join immediately if connected.
    if (socket.connected) {
      joinConversation();
    } else {
      socket.connect();
    }

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
  // MARK ADMIN MESSAGES AS READ
  // ============================================================

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const unreadAdminMessages = conversation.messages.filter(
      (msg) => msg.sender === "admin" && !msg.readAt && !msg.deletedForAdvisor,
    );

    unreadAdminMessages.forEach((msg) => {
      socket.emit("mark_message_read", {
        conversation_id: conversation.conversation_id,

        message_id: msg.message_id,
      });
    });
  }, [conversation?.messages.length]);

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation?.messages.length]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = message.trim();

    if (!text || !conversation || sending) {
      return;
    }

    if (!socket.connected) {
      setError("You are not connected to the messaging server.");

      return;
    }

    setError("");
    setSending(true);

    socket.emit("send_message", {
      conversation_id: conversation.conversation_id,

      sender: "advisor",

      text,
    });

    setMessage("");
  };

  // ============================================================
  // START EDIT
  // ============================================================

  const startEditing = (msg: Message) => {
    if (msg.sender !== "advisor" || msg.deleted || msg.deletedForEveryone) {
      return;
    }

    setEditingMessageId(msg.message_id);
    setEditingText(msg.text);

    setSelectedMessageId(null);
    setConfirmDeleteMessageId(null);
  };

  // ============================================================
  // CANCEL EDIT
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

      sender: "advisor",

      text: editingText.trim(),
    });
  };

  // ============================================================
  // REQUEST DELETE MESSAGE
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

      sender: "advisor",

      deleteType,
    });

    setConfirmDeleteMessageId(null);
    setSelectedMessageId(null);
  };

  // ============================================================
  // HIDE CONVERSATION
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

      sender: "advisor",
    });

    setConfirmDeleteConversation(false);
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const handleLogout = () => {
    socket.disconnect();

    localStorage.removeItem("advisor_token");

    localStorage.removeItem("advisor_profile");

    navigate("/advisor/login");
  };

  // ============================================================
  // MESSAGE STATUS
  // ============================================================

  const renderMessageStatus = (msg: Message) => {
    if (msg.sender !== "advisor") {
      return null;
    }

    if (msg.readAt) {
      return <CheckCheck size={14} className="text-white" />;
    }

    if (msg.deliveredAt) {
      return <CheckCheck size={14} className="text-white/60" />;
    }

    return <Check size={14} className="text-white/60" />;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#33484D] text-white">
        <p>Loading conversation...</p>
      </main>
    );
  }

  // ============================================================
  // NO CONVERSATION
  // ============================================================

  if (!conversation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#33484D] px-5 text-white">
        <div className="text-center">
          <p className="text-[#F3B9B9]">{error || "Conversation not found."}</p>

          <button
            type="button"
            onClick={() => navigate("/advisor/messages")}
            className="mt-4 rounded-full bg-[#5C838A] px-5 py-2 text-sm font-semibold"
          >
            Back to messages
          </button>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <main className="min-h-screen bg-[#33484D]">
      {/* HEADER */}

      <header className="flex items-center justify-between bg-[#5C838A] px-6 py-4">
        {/* BACK */}

        <button
          type="button"
          onClick={() => navigate("/advisor/messages")}
          className="flex items-center gap-2 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
        >
          <ArrowLeft size={16} />
          Messages
        </button>

        {/* TITLE */}

        <div className="text-center">
          <h1 className="text-lg font-semibold text-white">SafeLink Admin</h1>

          <div className="mt-1 flex items-center justify-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-[#A9CFBA]" : "bg-[#D96C6C]"
              }`}
            />

            <span className="text-xs text-white/70">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* RIGHT ACTIONS */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setConfirmDeleteConversation(true)}
            title="Hide conversation"
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
          >
            <Trash2 size={15} />
            Delete
          </button>

          <button
            type="button"
            onClick={() => navigate("/advisor/profile")}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
          >
            <User size={15} />
            Profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      {/* CHAT */}

      <section className="mx-auto max-w-3xl px-5 py-8">
        <div className="overflow-hidden rounded-3xl bg-[#F4F7F7] shadow-xl">
          {/* CHAT HEADER */}

          <div className="border-b border-[#33484D]/10 px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5C838A]">
              Administrator
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#33484D]">
              Admin Support
            </h2>

            <p className="mt-1 text-xs text-[#6B7A7C]">
              {conversation.conversation_id}
            </p>
          </div>

          {/* MESSAGES */}

          <div className="max-h-[520px] min-h-[400px] space-y-4 overflow-y-auto px-6 py-6">
            {conversation.messages.length === 0 ? (
              <div className="flex min-h-[350px] items-center justify-center text-center">
                <div>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#5C838A]/10 text-[#5C838A]">
                    <Send size={20} />
                  </div>

                  <p className="text-sm text-[#6B7A7C]">No messages yet.</p>

                  <p className="mt-1 text-xs text-[#8A9597]">
                    Send a message to the administrator.
                  </p>
                </div>
              </div>
            ) : (
              conversation.messages.map((msg) => {
                const isAdvisor = msg.sender === "advisor";

                const isSelected = selectedMessageId === msg.message_id;

                const isEditing = editingMessageId === msg.message_id;

                const isConfirmingDelete =
                  confirmDeleteMessageId === msg.message_id;

                const isDeleted = Boolean(
                  msg.deletedForEveryone || msg.deleted,
                );

                return (
                  <div
                    key={msg.message_id}
                    className={`flex ${
                      isAdvisor ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative flex max-w-[88%] sm:max-w-[78%] ${
                        isAdvisor ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* DELETE OPTIONS */}

                      {isConfirmingDelete && (
                        <div
                          className={`absolute bottom-full z-50 mb-2 w-72 rounded-xl border border-[#33484D]/10 bg-white p-4 shadow-2xl ${
                            isAdvisor ? "right-0" : "left-0"
                          }`}
                        >
                          <p className="text-sm font-semibold text-[#33484D]">
                            Delete message?
                          </p>

                          <p className="mt-1 text-xs leading-5 text-[#6B7A7C]">
                            Choose how you want to delete this message.
                          </p>

                          <div className="mt-4 space-y-2">
                            <button
                              type="button"
                              onClick={() =>
                                deleteMessage(msg.message_id, "me")
                              }
                              className="w-full rounded-lg border border-[#33484D]/10 px-3 py-2 text-left text-xs font-medium text-[#33484D] transition hover:bg-[#EEF2F2]"
                            >
                              <span className="block font-semibold">
                                Delete for me
                              </span>

                              <span className="mt-0.5 block text-[11px] text-[#8A9597]">
                                Remove it from your view only.
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteMessage(msg.message_id, "everyone")
                              }
                              className="w-full rounded-lg border border-[#D96C6C]/20 px-3 py-2 text-left text-xs font-medium text-[#D96C6C] transition hover:bg-[#FFF1F1]"
                            >
                              <span className="block font-semibold">
                                Delete for everyone
                              </span>

                              <span className="mt-0.5 block text-[11px] text-[#D96C6C]/70">
                                Replace it with a deleted message for both
                                sides.
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMessageId(null)}
                              className="w-full rounded-lg px-3 py-2 text-xs font-medium text-[#6B7A7C] transition hover:bg-[#EEF2F2]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACTION MENU */}

                      {isSelected && isAdvisor && !isDeleted && (
                        <div className="absolute bottom-full right-0 z-40 mb-2 flex overflow-hidden rounded-xl border border-[#33484D]/10 bg-white shadow-xl">
                          <button
                            type="button"
                            onClick={() => startEditing(msg)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#33484D] transition hover:bg-[#EEF2F2]"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDeleteMessage(msg.message_id)}
                            className="flex items-center gap-2 border-l border-[#33484D]/10 px-4 py-2.5 text-xs font-semibold text-[#D96C6C] transition hover:bg-[#FFF1F1]"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}

                      {/* EDIT */}

                      {isEditing ? (
                        <div className="w-[380px] max-w-[85vw] rounded-2xl bg-[#5C838A] p-3">
                          <textarea
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            autoFocus
                            rows={3}
                            className="w-full resize-none rounded-xl border-0 bg-white px-3 py-2 text-sm text-[#33484D] outline-none"
                          />

                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white transition hover:bg-white/10"
                            >
                              <X size={13} />
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={saveEdit}
                              disabled={!editingText.trim()}
                              className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-[#5C838A] transition disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* MESSAGE */

                        <div
                          className={`group relative ${
                            isAdvisor
                              ? "rounded-2xl rounded-br-md bg-[#5C838A] text-white"
                              : "rounded-2xl rounded-bl-md bg-[#E3EAEA] text-[#33484D]"
                          } px-4 py-3 shadow-sm`}
                        >
                          {isAdvisor && !isDeleted && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMessageId(
                                  isSelected ? null : msg.message_id,
                                );

                                setConfirmDeleteMessageId(null);
                              }}
                              className="absolute inset-0 z-10 cursor-pointer rounded-2xl"
                              aria-label="Message options"
                            />
                          )}

                          <p className="relative z-0 mb-1 text-[11px] font-semibold opacity-60">
                            {isAdvisor ? "You" : "Admin"}
                          </p>

                          {isDeleted ? (
                            <p className="relative z-0 pr-1 text-sm italic leading-6 opacity-70">
                              This message was deleted
                            </p>
                          ) : (
                            <p className="relative z-0 whitespace-pre-wrap break-words pr-1 text-sm leading-6">
                              {msg.text}
                            </p>
                          )}

                          <div className="relative z-20 mt-1 flex items-center justify-end gap-1">
                            {msg.edited && !isDeleted && (
                              <span className="text-[10px] opacity-60">
                                Edited
                              </span>
                            )}

                            <span
                              className={`text-[10px] ${
                                isAdvisor ? "text-white/50" : "text-[#6B7A7C]"
                              }`}
                            >
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {renderMessageStatus(msg)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ERROR */}

          {error && (
            <div className="border-t border-[#D96C6C]/20 bg-[#D96C6C]/10 px-5 py-3 text-center text-sm text-[#B94C4C]">
              {error}
            </div>
          )}

          {/* INPUT */}

          <form
            onSubmit={handleSend}
            className="border-t border-[#33484D]/10 bg-[#EEF2F2] p-5"
          >
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();

                    if (message.trim() && !sending && connected) {
                      event.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                placeholder="Type a message to the admin..."
                disabled={sending}
                className="min-w-0 flex-1 rounded-full border border-[#5C838A]/20 bg-white px-5 py-3 text-sm text-[#33484D] outline-none focus:border-[#5C838A] focus:ring-2 focus:ring-[#5C838A]/20 disabled:bg-[#EEF2F2]"
              />

              <button
                type="submit"
                disabled={!message.trim() || sending || !connected}
                className="flex items-center gap-2 rounded-full bg-[#5C838A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4C6F75] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={16} />

                {sending ? "Sending..." : "Send"}
              </button>
            </div>

            <p className="mt-2 text-center text-[11px] text-[#8A9597]">
              Press Enter to send. Click one of your messages to edit or delete
              it.
            </p>
          </form>
        </div>
      </section>

      {/* ========================================================
          DELETE CONVERSATION MODAL
      ======================================================== */}

      {confirmDeleteConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#D96C6C]/10">
              <Trash2 size={22} className="text-[#D96C6C]" />
            </div>

            <h2 className="mt-4 text-center text-lg font-semibold text-[#33484D]">
              Hide conversation?
            </h2>

            <p className="mt-2 text-center text-sm leading-5 text-[#6B7A7C]">
              This conversation will disappear from your messages, but the
              conversation and all messages will remain safely stored in
              MongoDB.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteConversation(false)}
                className="flex-1 rounded-xl border border-[#33484D]/15 px-4 py-2.5 text-sm font-semibold text-[#33484D] transition hover:bg-[#EEF2F2]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteConversation}
                className="flex-1 rounded-xl bg-[#D96C6C] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#C75B5B]"
              >
                Hide
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
