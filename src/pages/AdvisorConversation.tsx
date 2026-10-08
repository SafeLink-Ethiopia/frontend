console.log("🔥 ADVISOR CONVERSATION PAGE IS LOADED");

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
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
  MessageCircle,
} from "lucide-react";

import { getAdvisorConversation } from "../api/advisorConversationApi";
import type { Conversation, Message } from "../api/conversationApi";
import socket from "../services/socket";

interface SocketMessagePayload {
  conversation_id?: string;
  message?: Message;
  message_id?: string;
  text?: string;
  deliveredAt?: string | null;
  delivered_at?: string | null;
  readAt?: string | null;
  read_at?: string | null;
}

interface ConfirmationState {
  type: "delete-message";
  messageId?: string;
}

export default function AdvisorConversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [socketConnected, setSocketConnected] = useState(socket.connected);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // =========================================================
  // LOAD CONVERSATION
  // =========================================================

  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);
      setError("");

      const result = await getAdvisorConversation(conversationId);

      setConversation(result);
    } catch (err) {
      console.error("[AdvisorConversation] Load error:", err);
      setError("Unable to load this conversation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    loadConversation();
  }, [conversationId]);

  // =========================================================
  // AUTO SCROLL
  // =========================================================

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });
  };

  useEffect(() => {
    if (conversation?.messages) {
      scrollToBottom();
    }
  }, [conversation?.messages]);

  // =========================================================
  // SOCKET CONNECTION
  // =========================================================

  useEffect(() => {
    const handleConnect = () => {
      console.log("[AdvisorConversation] Socket connected");
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log("[AdvisorConversation] Socket disconnected");
      setSocketConnected(false);
    };

    const handleConnectError = (err: Error) => {
      console.error(
        "[AdvisorConversation] Socket connection error:",
        err.message,
      );

      setSocketConnected(false);
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

  // =========================================================
  // SOCKET EVENTS
  // =========================================================

  useEffect(() => {
    if (!conversationId) return;

    if (!socket.connected) {
      socket.connect();
    }

    const joinConversation = () => {
      console.log(
        "[AdvisorConversation] Joining conversation:",
        conversationId,
      );

      socket.emit("join_conversation", conversationId);
    };

    if (socket.connected) {
      joinConversation();
    }

    socket.on("connect", joinConversation);

    // -------------------------------------------------------
    // NEW MESSAGE
    // -------------------------------------------------------

    const handleNewMessage = (payload: SocketMessagePayload) => {
      console.log("[AdvisorConversation] New message:", payload);

      if (
        payload.conversation_id &&
        payload.conversation_id !== conversationId
      ) {
        return;
      }

      const incomingMessage = payload.message;

      if (!incomingMessage) return;

      setConversation((current) => {
        if (!current) return current;

        const exists = current.messages.some(
          (msg) => msg.message_id === incomingMessage.message_id,
        );

        if (exists) {
          return current;
        }

        return {
          ...current,
          messages: [...current.messages, incomingMessage],
        };
      });

      scrollToBottom();
    };

    // -------------------------------------------------------
    // EDITED MESSAGE
    // -------------------------------------------------------

    const handleMessageEdited = (payload: SocketMessagePayload) => {
      console.log("[AdvisorConversation] Message edited:", payload);

      if (
        payload.conversation_id &&
        payload.conversation_id !== conversationId
      ) {
        return;
      }

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((msg) => {
            if (msg.message_id !== payload.message_id) {
              return msg;
            }

            return {
              ...msg,
              text: payload.message?.text ?? payload.text ?? msg.text,
              edited: true,
            };
          }),
        };
      });
    };

    // -------------------------------------------------------
    // DELETE FOR ME
    // -------------------------------------------------------

    const handleMessageDeletedForMe = (payload: SocketMessagePayload) => {
      console.log("[AdvisorConversation] Message deleted for me:", payload);

      if (
        payload.conversation_id &&
        payload.conversation_id !== conversationId
      ) {
        return;
      }

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((msg) =>
            msg.message_id === payload.message_id
              ? {
                  ...msg,
                  deleted: true,
                }
              : msg,
          ),
        };
      });
    };

    // -------------------------------------------------------
    // DELETE FOR EVERYONE
    // -------------------------------------------------------

    const handleMessageDeletedForEveryone = (payload: SocketMessagePayload) => {
      console.log(
        "[AdvisorConversation] Message deleted for everyone:",
        payload,
      );

      if (
        payload.conversation_id &&
        payload.conversation_id !== conversationId
      ) {
        return;
      }

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((msg) =>
            msg.message_id === payload.message_id
              ? {
                  ...msg,
                  deleted: true,
                }
              : msg,
          ),
        };
      });
    };

    // -------------------------------------------------------
    // DELIVERED
    // -------------------------------------------------------

    const handleMessageDelivered = (payload: SocketMessagePayload) => {
      if (
        payload.conversation_id &&
        payload.conversation_id !== conversationId
      ) {
        return;
      }

      const deliveredAt =
        payload.deliveredAt ?? payload.delivered_at ?? new Date().toISOString();

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((msg) =>
            msg.message_id === payload.message_id
              ? {
                  ...msg,
                  seen_at: deliveredAt,
                }
              : msg,
          ),
        };
      });
    };

    // -------------------------------------------------------
    // READ
    // -------------------------------------------------------

    const handleMessageRead = (payload: SocketMessagePayload) => {
      if (
        payload.conversation_id &&
        payload.conversation_id !== conversationId
      ) {
        return;
      }

      const readAt =
        payload.readAt ?? payload.read_at ?? new Date().toISOString();

      setConversation((current) => {
        if (!current) return current;

        return {
          ...current,
          messages: current.messages.map((msg) =>
            msg.message_id === payload.message_id
              ? {
                  ...msg,
                  seen_at: readAt,
                }
              : msg,
          ),
        };
      });
    };

    // -------------------------------------------------------
    // CONVERSATION DELETED
    // -------------------------------------------------------

    const handleConversationDeleted = (payload: SocketMessagePayload) => {
      if (
        payload.conversation_id &&
        payload.conversation_id !== conversationId
      ) {
        return;
      }

      setConversation(null);
      navigate("/advisor/messages");
    };

    socket.on("new_message", handleNewMessage);
    socket.on("message_edited", handleMessageEdited);
    socket.on("message_deleted_for_me", handleMessageDeletedForMe);
    socket.on("message_deleted_for_everyone", handleMessageDeletedForEveryone);
    socket.on("message_delivered", handleMessageDelivered);
    socket.on("message_read", handleMessageRead);
    socket.on("conversation_deleted", handleConversationDeleted);

    return () => {
      socket.off("connect", joinConversation);

      socket.off("new_message", handleNewMessage);
      socket.off("message_edited", handleMessageEdited);
      socket.off("message_deleted_for_me", handleMessageDeletedForMe);
      socket.off(
        "message_deleted_for_everyone",
        handleMessageDeletedForEveryone,
      );
      socket.off("message_delivered", handleMessageDelivered);
      socket.off("message_read", handleMessageRead);
      socket.off("conversation_deleted", handleConversationDeleted);
    };
  }, [conversationId, navigate]);

  // =========================================================
  // READ / DELIVERED
  // =========================================================

  useEffect(() => {
    if (!conversationId || !conversation || !socket.connected) {
      return;
    }

    const userMessages = conversation.messages.filter(
      (msg) => msg.sender === "user" && !msg.deleted,
    );

    userMessages.forEach((msg) => {
      socket.emit("message_delivered", {
        conversation_id: conversationId,
        message_id: msg.message_id,
        sender: "advisor",
      });

      socket.emit("message_read", {
        conversation_id: conversationId,
        message_id: msg.message_id,
        sender: "advisor",
      });
    });
  }, [conversationId, conversation?.messages, socketConnected]);

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = () => {
    if (!conversationId || !message.trim() || sending) {
      return;
    }

    if (!socket.connected) {
      setError("Connection lost. Please wait for the connection to return.");

      socket.connect();
      return;
    }

    try {
      setSending(true);
      setError("");

      socket.emit("send_message", {
        conversation_id: conversationId,
        sender: "advisor",
        text: message.trim(),
      });

      setMessage("");
    } catch (err) {
      console.error("[AdvisorConversation] Send error:", err);
      setError("Unable to send your message.");
    } finally {
      setSending(false);
    }
  };

  // =========================================================
  // EDIT
  // =========================================================

  const startEditing = (msg: Message) => {
    if (msg.sender !== "advisor" || msg.deleted) {
      return;
    }

    setEditingMessageId(msg.message_id);
    setEditingText(msg.text);
    setActiveMessageId(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEditedMessage = () => {
    if (
      !conversationId ||
      !editingMessageId ||
      !editingText.trim() ||
      !socket.connected
    ) {
      return;
    }

    socket.emit("edit_message", {
      conversation_id: conversationId,
      message_id: editingMessageId,
      sender: "advisor",
      text: editingText.trim(),
    });

    cancelEditing();
  };

  // =========================================================
  // DELETE
  // =========================================================

  const deleteMessage = () => {
    if (!conversationId || !confirmation?.messageId || !socket.connected) {
      return;
    }

    socket.emit("delete_message", {
      conversation_id: conversationId,
      message_id: confirmation.messageId,
      sender: "advisor",
      deleteType: "me",
    });

    setConfirmation(null);
    setActiveMessageId(null);
  };

  // =========================================================
  // KEYBOARD
  // =========================================================

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // =========================================================
  // VISIBLE MESSAGES
  // =========================================================

  const visibleMessages = useMemo(() => {
    if (!conversation) return [];

    return conversation.messages.filter((msg) => !msg.deleted);
  }, [conversation]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FAFBF7]">
        <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded-lg bg-[#E7F1E3]" />
            <div className="h-[600px] rounded-3xl bg-[#E7F1E3]" />
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // NOT FOUND
  // =========================================================

  if (!conversation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAFBF7] p-6">
        <div className="w-full max-w-md rounded-3xl border border-[#2F8F4E]/20 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F1E3] text-[#2F8F4E]">
            <MessageCircle size={26} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-[#173B28]">
            Conversation unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#2F8F4E]">
            {error || "This conversation could not be found."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/advisor/messages")}
            className="mt-6 rounded-xl bg-[#2F8F4E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176B3A]"
          >
            Back to messages
          </button>
        </div>
      </main>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <main className="min-h-screen bg-[#FAFBF7] p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="mb-5 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/advisor/messages")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#2F8F4E]/20 bg-white text-[#173B28] shadow-sm transition hover:border-[#2F8F4E] hover:bg-[#E7F1E3]"
              aria-label="Back to messages"
            >
              <ArrowLeft size={20} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2F8F4E] text-white">
                  <MessageCircle size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#2F8F4E]">
                    SafeLink Advisor
                  </p>

                  <h1 className="truncate text-lg font-bold text-[#173B28] md:text-xl">
                    {conversation.advisor_type} support
                  </h1>
                </div>
              </div>

              <p className="mt-1 truncate pl-11 text-xs text-[#2F8F4E]/70">
                {conversation.conversation_id}
              </p>
            </div>
          </div>

          {/* Connection */}
          <div
            className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium sm:flex ${
              socketConnected
                ? "border-[#2F8F4E]/20 bg-[#E7F1E3] text-[#176B3A]"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                socketConnected ? "bg-[#2F8F4E]" : "bg-red-500"
              }`}
            />

            {socketConnected ? "Connected" : "Reconnecting"}
          </div>
        </header>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#2F8F4E]/20 bg-[#E7F1E3] px-4 py-3 text-sm text-[#173B28]">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-lg p-1 text-[#2F8F4E] transition hover:bg-white"
              aria-label="Close error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* ===================================================
            CHAT CARD
        =================================================== */}

        <section className="overflow-hidden rounded-3xl border border-[#2F8F4E]/15 bg-white shadow-[0_8px_40px_rgba(23,59,40,0.06)]">
          {/* Chat top bar */}
          <div className="flex items-center justify-between border-b border-[#2F8F4E]/10 bg-white px-5 py-4">
            <div>
              <p className="text-sm font-semibold text-[#173B28]">
                Conversation
              </p>

              <p className="text-xs text-[#2F8F4E]/70">
                Messages are updated in real time
              </p>
            </div>

            <div className="flex items-center gap-2 sm:hidden">
              <span
                className={`h-2 w-2 rounded-full ${
                  socketConnected ? "bg-[#2F8F4E]" : "bg-red-500"
                }`}
              />

              <span className="text-xs text-[#2F8F4E]">
                {socketConnected ? "Online" : "Offline"}
              </span>
            </div>
          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="h-[calc(100vh-300px)] min-h-[450px] max-h-[620px] space-y-5 overflow-y-auto bg-[#FAFBF7] px-4 py-5 md:px-6">
            {visibleMessages.length === 0 ? (
              <div className="flex h-full min-h-[400px] items-center justify-center">
                <div className="max-w-sm text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E7F1E3] text-[#2F8F4E]">
                    <MessageCircle size={30} />
                  </div>

                  <h2 className="mt-5 font-semibold text-[#173B28]">
                    No messages yet
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-[#2F8F4E]/70">
                    When the user sends a message, it will appear here
                    instantly.
                  </p>
                </div>
              </div>
            ) : (
              visibleMessages.map((msg) => {
                const isAdvisor = msg.sender === "advisor";
                const isEditing = editingMessageId === msg.message_id;
                const isActive = activeMessageId === msg.message_id;

                return (
                  <div
                    key={msg.message_id}
                    className={`flex ${
                      isAdvisor ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="relative max-w-[88%] md:max-w-[72%]">
                      {/* Message menu */}
                      {isAdvisor && (
                        <div className="absolute -right-2 -top-3 z-20">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMessageId(
                                isActive ? null : msg.message_id,
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2F8F4E]/15 bg-white text-[#2F8F4E] shadow-sm transition hover:bg-[#E7F1E3] hover:text-[#176B3A]"
                            aria-label="Message options"
                          >
                            <MoreVertical size={15} />
                          </button>

                          {isActive && (
                            <div className="absolute right-0 top-9 w-36 overflow-hidden rounded-xl border border-[#2F8F4E]/15 bg-white shadow-xl">
                              <button
                                type="button"
                                onClick={() => startEditing(msg)}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#173B28] transition hover:bg-[#E7F1E3]"
                              >
                                <Edit3 size={15} className="text-[#2F8F4E]" />
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmation({
                                    type: "delete-message",
                                    messageId: msg.message_id,
                                  });

                                  setActiveMessageId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={15} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-3.5 shadow-sm ${
                          isAdvisor
                            ? "rounded-br-md bg-[#176B3A] text-white"
                            : "rounded-bl-md border border-[#2F8F4E]/10 bg-[#E7F1E3] text-[#173B28]"
                        }`}
                      >
                        <div className="mb-1.5 flex items-center gap-2">
                          <span
                            className={`text-xs font-bold ${
                              isAdvisor ? "text-[#E7F1E3]" : "text-[#2F8F4E]"
                            }`}
                          >
                            {isAdvisor ? "You" : "User"}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="min-w-[240px]">
                            <input
                              type="text"
                              value={editingText}
                              onChange={(event) =>
                                setEditingText(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  saveEditedMessage();
                                }

                                if (event.key === "Escape") {
                                  cancelEditing();
                                }
                              }}
                              autoFocus
                              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-white/40"
                            />

                            <div className="mt-2.5 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={cancelEditing}
                                className="rounded-lg px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={saveEditedMessage}
                                disabled={!editingText.trim()}
                                className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#176B3A] transition hover:bg-[#E7F1E3] disabled:opacity-50"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-[14px] leading-6">
                            {msg.text}
                          </p>
                        )}

                        {/* Time + status */}
                        <div
                          className={`mt-2 flex items-center justify-end gap-1.5 text-[10px] ${
                            isAdvisor
                              ? "text-[#E7F1E3]/70"
                              : "text-[#2F8F4E]/65"
                          }`}
                        >
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {isAdvisor && (
                            <span>
                              {msg.seen_at ? (
                                <CheckCheck size={14} />
                              ) : (
                                <Check size={14} />
                              )}
                            </span>
                          )}

                          {msg.edited && <span className="italic">edited</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* =================================================
              INPUT
          ================================================= */}

          <div className="border-t border-[#2F8F4E]/10 bg-white p-4 md:p-5">
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-2xl border border-[#2F8F4E]/20 bg-[#FAFBF7] transition focus-within:border-[#2F8F4E] focus-within:ring-4 focus-within:ring-[#E7F1E3]">
                <input
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    socketConnected ? "Type your reply..." : "Connecting..."
                  }
                  disabled={!socketConnected}
                  className="w-full bg-transparent px-4 py-3.5 text-sm text-[#173B28] outline-none placeholder:text-[#2F8F4E]/50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending || !message.trim() || !socketConnected}
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-[#2F8F4E] text-white shadow-sm transition hover:bg-[#176B3A] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={19} />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-[11px] text-[#2F8F4E]/60">
                Press Enter to send
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-[#2F8F4E]/60">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    socketConnected ? "bg-[#2F8F4E]" : "bg-red-400"
                  }`}
                />

                {socketConnected ? "Secure connection" : "Reconnecting"}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* =====================================================
          DELETE CONFIRMATION
      ===================================================== */}

      {confirmation?.type === "delete-message" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173B28]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#2F8F4E]/15 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={21} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#173B28]">
              Delete this message?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#2F8F4E]/75">
              This message will be removed from your conversation view.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="rounded-xl border border-[#2F8F4E]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#173B28] transition hover:bg-[#E7F1E3]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={deleteMessage}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}