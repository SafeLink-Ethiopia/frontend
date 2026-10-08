import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Check, CheckCheck, Edit3, Send, Trash2, X } from "lucide-react";
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

        const response = await axios.get<ConversationResponse>(
          `http://localhost:5000/api/advisor/admin-conversations/${conversationId}`,
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

    const joinConversation = () => {
      socket.emit("join_conversation", currentConversationId);

      console.log("[Socket] Joined conversation:", currentConversationId);
    };

    const handleConnect = () => {
      joinConversation();
    };

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

      if (data.message.sender === "admin") {
        socket.emit("mark_message_delivered", {
          conversation_id: currentConversationId,
          message_id: data.message.message_id,
        });
      }

      if (data.message.sender === "advisor") {
        setSending(false);
      }
    };

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

    const handleMessageError = (data: { message?: string }) => {
      console.error("[Socket] Message error:", data.message);

      setError(data.message || "Message operation failed.");

      setSending(false);
      setConfirmDeleteMessageId(null);
      setConfirmDeleteConversation(false);
    };

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
      return <CheckCheck size={14} className="text-[#f0e2d6]" />;
    }

    if (msg.deliveredAt) {
      return <CheckCheck size={14} className="text-[#f0e2d6]/60" />;
    }

    return <Check size={14} className="text-[#f0e2d6]/60" />;
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f6] text-[#3e1919]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#a79093]/30 border-t-[#3e1919]" />

          <p className="text-sm text-[#a79093]">Loading conversation...</p>
        </div>
      </main>
    );
  }

  // ============================================================
  // NO CONVERSATION
  // ============================================================

  if (!conversation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f5f6] px-5 text-[#3e1919]">
        <div className="w-full max-w-md border-t-4 border-[#3e1919] bg-[#f0e2d6] px-6 py-8 text-center">
          <p className="text-sm text-[#3e1919]">
            {error || "Conversation not found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/advisor/messages")}
            className="mt-5 bg-[#3e1919] px-5 py-2.5 text-sm font-semibold text-[#f0e2d6] transition hover:opacity-90"
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
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      <section className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border border-[#a79093]/30 bg-[#f7f5f6]">
          {/* CHAT HEADER */}
          <header className="border-b border-[#a79093]/30 bg-[#f7f5f6]">
            <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/advisor/messages")}
                  className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#a79093]/40 text-[#3e1919] transition hover:bg-[#f0e2d6]"
                  aria-label="Back to messages"
                >
                  ←
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                      Administrator
                    </span>

                    <span className="text-[#a79093]">·</span>

                    <span
                      className={`text-xs font-medium ${
                        connected ? "text-[#3e1919]" : "text-[#a79093]"
                      }`}
                    >
                      {connected ? "Connected" : "Disconnected"}
                    </span>
                  </div>

                  <h2 className="mt-1 text-xl font-bold tracking-tight text-[#3e1919]">
                    Admin Support
                  </h2>

                  <p className="mt-1 max-w-[260px] truncate font-mono text-[10px] text-[#a79093] sm:max-w-none">
                    {conversation.conversation_id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setConfirmDeleteConversation(true)}
                title="Hide conversation"
                className="flex items-center justify-center gap-2 border border-[#a79093]/40 px-4 py-2 text-sm font-semibold text-[#a79093] transition hover:border-[#3e1919] hover:bg-[#f0e2d6] hover:text-[#3e1919]"
              >
                <Trash2 size={15} />
                Hide conversation
              </button>
            </div>
          </header>

          {/* MESSAGES */}
          <div className="min-h-[440px] flex-1 space-y-5 overflow-y-auto bg-[#f7f5f6] px-4 py-6 sm:px-7">
            {conversation.messages.length === 0 ? (
              <div className="flex min-h-[380px] items-center justify-center text-center">
                <div>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e2d6] text-[#3e1919]">
                    <Send size={20} />
                  </div>

                  <p className="font-semibold text-[#3e1919]">
                    No messages yet
                  </p>

                  <p className="mt-1 text-sm text-[#a79093]">
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
                      className={`relative flex max-w-[92%] sm:max-w-[75%] ${
                        isAdvisor ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* DELETE OPTIONS */}
                      {isConfirmingDelete && (
                        <div
                          className={`absolute bottom-full z-50 mb-2 w-72 max-w-[calc(100vw-40px)] border border-[#a79093]/30 bg-[#f7f5f6] p-4 shadow-xl ${
                            isAdvisor ? "right-0" : "left-0"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-[#3e1919]">
                                Delete message?
                              </p>

                              <p className="mt-1 text-xs leading-5 text-[#a79093]">
                                Choose how you want to remove this message.
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMessageId(null)}
                              className="text-[#a79093] hover:text-[#3e1919]"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="mt-4 space-y-2">
                            <button
                              type="button"
                              onClick={() =>
                                deleteMessage(msg.message_id, "me")
                              }
                              className="w-full border border-[#a79093]/30 px-3 py-3 text-left transition hover:bg-[#f0e2d6]"
                            >
                              <span className="block text-xs font-semibold text-[#3e1919]">
                                Delete for me
                              </span>

                              <span className="mt-1 block text-[11px] text-[#a79093]">
                                Remove it from your view only.
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteMessage(msg.message_id, "everyone")
                              }
                              className="w-full border border-[#3e1919]/30 px-3 py-3 text-left transition hover:bg-[#f0e2d6]"
                            >
                              <span className="block text-xs font-semibold text-[#3e1919]">
                                Delete for everyone
                              </span>

                              <span className="mt-1 block text-[11px] text-[#a79093]">
                                Replace it with a deleted message for both
                                sides.
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMessageId(null)}
                              className="w-full px-3 py-2 text-xs font-semibold text-[#a79093] transition hover:text-[#3e1919]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* ACTION MENU */}
                      {isSelected && isAdvisor && !isDeleted && (
                        <div className="absolute bottom-full right-0 z-40 mb-2 flex overflow-hidden border border-[#a79093]/30 bg-[#f7f5f6] shadow-xl">
                          <button
                            type="button"
                            onClick={() => startEditing(msg)}
                            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#3e1919] transition hover:bg-[#f0e2d6]"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => requestDeleteMessage(msg.message_id)}
                            className="flex items-center gap-2 border-l border-[#a79093]/30 px-4 py-2.5 text-xs font-semibold text-[#3e1919] transition hover:bg-[#f0e2d6]"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}

                      {/* EDIT */}
                      {isEditing ? (
                        <div className="w-[380px] max-w-[85vw] bg-[#3e1919] p-3">
                          <textarea
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            autoFocus
                            rows={3}
                            className="w-full resize-none border border-[#a79093]/30 bg-[#f7f5f6] px-3 py-2 text-sm text-[#3e1919] outline-none focus:border-[#f0e2d6]"
                          />

                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#f0e2d6] transition hover:bg-[#f0e2d6]/10"
                            >
                              <X size={13} />
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={saveEdit}
                              disabled={!editingText.trim()}
                              className="bg-[#f0e2d6] px-4 py-1.5 text-xs font-semibold text-[#3e1919] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* MESSAGE */
                        <div
                          className={`group relative px-4 py-3 ${
                            isAdvisor
                              ? "bg-[#3e1919] text-[#f0e2d6]"
                              : "border border-[#a79093]/25 bg-[#f0e2d6] text-[#3e1919]"
                          }`}
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
                              className="absolute inset-0 z-10 cursor-pointer"
                              aria-label="Message options"
                            />
                          )}

                          <p className="relative z-0 mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
                            {isAdvisor ? "You" : "Admin"}
                          </p>

                          {isDeleted ? (
                            <p className="relative z-0 pr-1 text-sm italic leading-6 opacity-65">
                              This message was deleted
                            </p>
                          ) : (
                            <p className="relative z-0 whitespace-pre-wrap break-words pr-1 text-sm leading-6">
                              {msg.text}
                            </p>
                          )}

                          <div className="relative z-20 mt-2 flex items-center justify-end gap-1.5">
                            {msg.edited && !isDeleted && (
                              <span className="text-[10px] opacity-60">
                                Edited
                              </span>
                            )}

                            <span
                              className={`text-[10px] ${
                                isAdvisor
                                  ? "text-[#f0e2d6]/55"
                                  : "text-[#a79093]"
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
            <div className="border-t border-[#a79093]/30 bg-[#f0e2d6] px-5 py-3 text-center text-sm text-[#3e1919]">
              {error}
            </div>
          )}

          {/* INPUT */}
          <form
            onSubmit={handleSend}
            className="border-t border-[#a79093]/30 bg-[#f0e2d6]/60 p-4 sm:p-5"
          >
            <div className="flex gap-2 sm:gap-3">
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
                placeholder="Write a message to the admin..."
                disabled={sending}
                className="min-w-0 flex-1 border border-[#a79093]/40 bg-[#f7f5f6] px-4 py-3 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#3e1919] disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={!message.trim() || sending || !connected}
                className="flex shrink-0 items-center justify-center gap-2 bg-[#3e1919] px-4 py-3 text-sm font-semibold text-[#f0e2d6] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:px-6"
              >
                <Send size={16} />

                <span className="hidden sm:inline">
                  {sending ? "Sending..." : "Send"}
                </span>
              </button>
            </div>

            <p className="mt-2 text-center text-[10px] text-[#a79093]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3e1919]/50 px-5 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-[#a79093]/30 bg-[#f7f5f6] p-6 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f0e2d6] text-[#3e1919]">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-4 text-center text-lg font-bold text-[#3e1919]">
              Hide conversation?
            </h2>

            <p className="mt-2 text-center text-sm leading-6 text-[#a79093]">
              This conversation will disappear from your messages, but the
              conversation and all messages will remain safely stored in
              MongoDB.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteConversation(false)}
                className="flex-1 border border-[#a79093]/40 px-4 py-2.5 text-sm font-semibold text-[#3e1919] transition hover:bg-[#f0e2d6]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteConversation}
                className="flex-1 bg-[#3e1919] px-4 py-2.5 text-sm font-semibold text-[#f0e2d6] transition hover:opacity-90"
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
