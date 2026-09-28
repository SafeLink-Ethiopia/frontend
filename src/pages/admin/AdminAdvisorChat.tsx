import { FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck, Edit3, Trash2, X } from "lucide-react";

import socket from "../../services/socket";

interface Message {
  message_id: string;
  sender: "admin" | "advisor";
  text: string;
  timestamp: string;

  edited?: boolean;
  deleted?: boolean;

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

export default function AdminAdvisorChat() {
  const { advisorId } = useParams<{
    advisorId: string;
  }>();

  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);

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

  /*
   * Scroll to newest message
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  /*
   * Load or create conversation
   */
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

        const response = await axios.get<ConversationResponse>(
          `http://localhost:5000/api/admin-advisor-conversations/advisor/${advisorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setConversation(response.data.conversation);
      } catch (error) {
        console.error("Failed to load conversation:", error);

        if (axios.isAxiosError(error)) {
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

  /*
   * Socket connection status
   */
  useEffect(() => {
    const handleConnect = () => {
      console.log("Socket connected");

      setConnected(true);
      setError("");
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");

      setConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error);

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

  /*
   * Join conversation and receive events
   */
  useEffect(() => {
    if (!conversation?.conversation_id) {
      return;
    }

    const conversationId = conversation.conversation_id;

    const joinConversation = () => {
      socket.emit("join_conversation", conversationId);

      console.log("Joined conversation:", conversationId);
    };

    const handleConnect = () => {
      joinConversation();
    };

    /*
     * Receive new message
     */
    const handleNewMessage = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (data.conversation_id !== conversationId) {
        return;
      }

      console.log("New message received:", data.message);

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

      /*
       * Mark advisor message as delivered
       */
      if (data.message.sender === "advisor") {
        socket.emit("mark_message_delivered", {
          conversation_id: conversationId,
          message_id: data.message.message_id,
        });
      }

      /*
       * Our own message was accepted
       */
      if (data.message.sender === "admin") {
        setSending(false);
      }
    };

    /*
     * Message edited
     */
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

    /*
     * Message deleted
     */
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
                  text: "This message was deleted",
                  deleted: true,
                  edited: false,
                }
              : message,
          ),
        };
      });

      setSelectedMessageId(null);
      setConfirmDeleteMessageId(null);
    };

    /*
     * Message delivered
     */
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

    /*
     * Message read
     */
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

    /*
     * Conversation hidden
     */
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

    /*
     * Socket operation error
     */
    const handleMessageError = (data: { message?: string }) => {
      console.error("Message error:", data.message);

      setError(data.message || "Message operation failed.");

      setSending(false);
    };

    socket.on("connect", handleConnect);
    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted", handleMessageDeleted);
    socket.on("message_delivered", handleMessageDelivered);
    socket.on("message_read", handleMessageRead);
    socket.on("conversation_deleted", handleConversationDeleted);
    socket.on("message_error", handleMessageError);

    /*
     * Join immediately if already connected
     */
    if (socket.connected) {
      joinConversation();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted", handleMessageDeleted);
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("message_read", handleMessageRead);
      socket.off("conversation_deleted", handleConversationDeleted);
      socket.off("message_error", handleMessageError);
    };
  }, [conversation?.conversation_id, navigate]);

  /*
   * Mark advisor messages as read
   */
  useEffect(() => {
    if (!conversation) {
      return;
    }

    const unreadAdvisorMessages = conversation.messages.filter(
      (message) => message.sender === "advisor" && !message.readAt,
    );

    unreadAdvisorMessages.forEach((message) => {
      socket.emit("mark_message_read", {
        conversation_id: conversation.conversation_id,
        message_id: message.message_id,
      });
    });
  }, [conversation?.messages.length]);

  /*
   * Automatically scroll to bottom
   */
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages.length]);

  /*
   * Send message
   */
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

  /*
   * Start editing Admin message
   */
  const startEditing = (message: Message) => {
    if (message.sender !== "admin" || message.deleted) {
      return;
    }

    setEditingMessageId(message.message_id);

    setEditingText(message.text);
    setSelectedMessageId(null);
    setConfirmDeleteMessageId(null);
  };

  /*
   * Cancel editing
   */
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  /*
   * Save edited message
   */
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

  /*
   * Delete Admin message
   *
   * No browser alert/confirm.
   * The confirmation is displayed
   * directly inside the UI.
   */
  const deleteMessage = (messageId: string) => {
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
    });

    setConfirmDeleteMessageId(null);
    setSelectedMessageId(null);
  };

  /*
   * Hide whole conversation for Admin
   *
   * This does NOT delete anything
   * from MongoDB.
   */
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

  /*
   * Render message status
   */
  const renderMessageStatus = (message: Message) => {
    if (message.sender !== "admin") {
      return null;
    }

    /*
     * Read
     */
    if (message.readAt) {
      return <CheckCheck size={14} className="text-white" />;
    }

    /*
     * Delivered
     */
    if (message.deliveredAt) {
      return <CheckCheck size={14} className="text-white/60" />;
    }

    /*
     * Sent
     */
    return <Check size={14} className="text-white/60" />;
  };

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  /*
   * Error without conversation
   */
  if (error && !conversation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate("/admin/messages")}
            className="mb-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            ← Back to Messages
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="relative mx-auto flex max-w-5xl items-center gap-4">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/admin/messages")}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>

          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-900">Advisor Chat</h1>

            <p className="mt-1 text-sm text-slate-500">
              Conversation with advisor {conversation.advisor_id}
            </p>
          </div>

          {/* Connection + hide conversation */}
          <div className="ml-auto flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <span className="text-sm text-slate-500">
              {connected ? "Connected" : "Disconnected"}
            </span>

            <button
              type="button"
              onClick={() => {
                setConfirmDeleteConversation((current) => !current);
              }}
              title="Hide conversation"
              className="ml-3 flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <Trash2 size={15} />
              Delete
            </button>

            {/* Conversation confirmation */}
            {confirmDeleteConversation && (
              <div className="absolute right-0 top-14 z-30 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <p className="text-sm font-semibold text-slate-900">
                  Hide conversation?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  The conversation and its messages will remain safely stored in
                  MongoDB.
                </p>

                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteConversation(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={deleteConversation}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                  >
                    Hide
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-auto mt-4 w-full max-w-5xl px-6">
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-4 font-medium"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-6">
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {conversation.messages.length === 0 ? (
              <div className="flex h-full min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                    <svg
                      className="h-8 w-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 4H7a4 4 0 01-4-4V8a4 4 0 014-4h10a4 4 0 014 4v8a4 4 0 01-4 4z"
                      />
                    </svg>
                  </div>

                  <h2 className="mt-4 font-semibold text-slate-900">
                    No messages yet
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Send a message to start the conversation.
                  </p>
                </div>
              </div>
            ) : (
              conversation.messages.map((message) => {
                const isAdmin = message.sender === "admin";

                const isSelected = selectedMessageId === message.message_id;

                const isEditing = editingMessageId === message.message_id;

                const isConfirmingDelete =
                  confirmDeleteMessageId === message.message_id;

                return (
                  <div
                    key={message.message_id}
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="relative max-w-[75%]">
                      {/* Message delete confirmation */}
                      {isConfirmingDelete && (
                        <div className="absolute bottom-full right-0 z-30 mb-2 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                          <p className="text-sm font-semibold text-slate-900">
                            Delete message?
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            This message will be replaced with "This message was
                            deleted".
                          </p>

                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteMessageId(null)}
                              className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                            >
                              Cancel
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteMessage(message.message_id)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Message actions */}
                      {isSelected && isAdmin && !message.deleted && (
                        <div className="absolute bottom-full right-0 z-20 mb-2 flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                          <button
                            type="button"
                            onClick={() => startEditing(message)}
                            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteMessageId(message.message_id);
                              setSelectedMessageId(null);
                            }}
                            className="flex items-center gap-2 border-l border-slate-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}

                      {/* Edit mode */}
                      {isEditing ? (
                        <div className="w-[360px] max-w-[75vw] rounded-2xl bg-blue-600 p-3">
                          <textarea
                            value={editingText}
                            onChange={(event) =>
                              setEditingText(event.target.value)
                            }
                            autoFocus
                            rows={3}
                            className="w-full resize-none rounded-xl border-0 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
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
                              onClick={saveEdit}
                              disabled={!editingText.trim()}
                              className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        /*
                         * Message bubble
                         */
                        <button
                          type="button"
                          disabled={!isAdmin || message.deleted}
                          onClick={() => {
                            if (isAdmin && !message.deleted) {
                              setSelectedMessageId(
                                isSelected ? null : message.message_id,
                              );

                              setConfirmDeleteMessageId(null);
                            }
                          }}
                          className={`w-full text-left ${
                            !isAdmin || message.deleted
                              ? "cursor-default"
                              : "cursor-pointer"
                          }`}
                        >
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              isAdmin
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md bg-slate-100 text-slate-900"
                            } ${message.deleted ? "opacity-70" : ""}`}
                          >
                            <p className="mb-1 text-[11px] font-semibold opacity-60">
                              {isAdmin ? "You" : "Advisor"}
                            </p>

                            <p
                              className={`whitespace-pre-wrap break-words text-sm leading-6 ${
                                message.deleted ? "italic" : ""
                              }`}
                            >
                              {message.text}
                            </p>

                            <div className="mt-1 flex items-center justify-end gap-1">
                              {message.edited && !message.deleted && (
                                <span className="text-[10px] opacity-60">
                                  Edited
                                </span>
                              )}

                              <span
                                className={`text-[10px] ${
                                  isAdmin ? "text-blue-100" : "text-slate-400"
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleString()}
                              </span>

                              {renderMessageStatus(message)}
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-slate-200 bg-slate-50 p-4"
          >
            <div className="flex items-end gap-3">
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
                rows={2}
                placeholder="Type your message..."
                disabled={sending}
                className="min-h-[52px] flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              <button
                type="submit"
                disabled={!messageText.trim() || sending || !connected}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              Press Enter to send. Press Shift + Enter for a new line. Click
              your messages to edit or delete them.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
