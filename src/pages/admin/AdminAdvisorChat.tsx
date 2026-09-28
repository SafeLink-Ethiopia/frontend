import { FormEvent, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

import socket from "../../services/socket";

interface Message {
  message_id: string;
  sender: "admin" | "advisor";
  text: string;
  timestamp: string;
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
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");
      setConnected(false);
    };

    const handleConnectError = (error: Error) => {
      console.error("Socket connection error:", error);

      setConnected(false);
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
   * Join conversation and receive messages
   */
  useEffect(() => {
    if (!conversation?.conversation_id) {
      return;
    }

    const conversationId = conversation.conversation_id;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join_conversation", conversationId);

    console.log("Joined conversation:", conversationId);

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

        /*
         * Prevent duplicate messages
         */
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
       * Server has accepted the message.
       */
      if (data.message.sender === "admin") {
        setSending(false);
      }
    };

    /*
     * Socket message error
     */
    const handleMessageError = (data: { message: string }) => {
      console.error("Message error:", data.message);

      setError(data.message);
      setSending(false);
    };

    socket.on("new_message", handleNewMessage);

    socket.on("message_error", handleMessageError);

    return () => {
      socket.off("new_message", handleNewMessage);

      socket.off("message_error", handleMessageError);

      /*
       * IMPORTANT:
       * Do NOT emit leave_conversation.
       *
       * Your backend currently does not
       * implement that event.
       */
    };
  }, [conversation?.conversation_id]);

  /*
   * Automatically scroll to bottom
   */
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

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

    /*
     * Clear input immediately.
     */
    setMessageText("");

    /*
     * DO NOT use setTimeout here.
     *
     * sending becomes false when
     * new_message is received.
     */
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
        <div className="mx-auto flex max-w-5xl items-center gap-4">
          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/admin/messages")}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Back"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Title */}
          <div>
            <h1 className="text-xl font-bold text-slate-900">Advisor Chat</h1>

            <p className="mt-1 text-sm text-slate-500">
              Conversation with advisor {conversation.advisor_id}
            </p>
          </div>

          {/* Connection status */}
          <div className="ml-auto flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <span className="text-sm text-slate-500">
              {connected ? "Connected" : "Disconnected"}
            </span>
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

                return (
                  <div
                    key={message.message_id}
                    className={`flex ${
                      isAdmin ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isAdmin
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-slate-100 text-slate-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">
                        {message.text}
                      </p>

                      <p
                        className={`mt-1 text-[11px] ${
                          isAdmin ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleString()}
                      </p>
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
              Press Enter to send. Press Shift + Enter for a new line.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
