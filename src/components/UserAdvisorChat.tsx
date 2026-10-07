import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Send, ArrowLeft } from "lucide-react";

import socket from "../services/socket";

type AdvisorType = "general" | "legal" | "medical" | "psychological";

interface Message {
  message_id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  deletedForEveryone?: boolean;
  deletedForUser?: boolean;
}

interface Conversation {
  conversation_id: string;
  session_id: string;
  advisor_id: string;
  advisor_type: AdvisorType;
  status: "active" | "closed";
  messages: Message[];
  suggested_advisor_types?: AdvisorType[];
}

interface UserAdvisorChatProps {
  sessionId: string;
}

interface SendMessageResponse {
  success: boolean;
  message?: Message;
  error?: string;
}

const advisorLabels: Record<AdvisorType, string> = {
  general: "General Advisor",
  legal: "Legal Advisor",
  medical: "Medical Advisor",
  psychological: "Psychological Advisor",
};

const advisorDescriptions: Record<AdvisorType, string> = {
  general: "I'm not sure which advisor I need",
  legal: "Legal support and guidance",
  medical: "Medical support and guidance",
  psychological: "Psychological support and guidance",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function UserAdvisorChat({
  sessionId,
}: UserAdvisorChatProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedType, setSelectedType] = useState<AdvisorType | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef(sessionId);

  /*
   * Keep the latest SafeLink session ID.
   */
  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  /*
   * Scroll to the newest message.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
   * Make sure Socket.IO is connected.
   */
  useEffect(() => {
    if (!socket.connected) {
      console.log("[UserAdvisorChat] Connecting socket...");
      socket.connect();
    }

    const handleConnect = () => {
      console.log("[UserAdvisorChat] Socket connected:", socket.id);

      const currentConversationId = conversationIdRef.current;
      const currentSessionId = sessionIdRef.current?.trim();

      if (currentConversationId && currentSessionId) {
        socket.emit("user_advisor_join", {
          conversation_id: currentConversationId,
          session_id: currentSessionId,
        });

        console.log(
          "[UserAdvisorChat] Rejoined conversation:",
          currentConversationId,
        );
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log("[UserAdvisorChat] Socket disconnected:", reason);
    };

    const handleConnectError = (socketError: Error) => {
      console.error(
        "[UserAdvisorChat] Socket connection error:",
        socketError.message,
      );
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  /*
   * Receive messages from the server.
   */
  useEffect(() => {
    const handleMessage = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      console.log("[UserAdvisorChat] Received message:", data);

      if (data.conversation_id !== conversationIdRef.current) {
        return;
      }

      setMessages((previous) => {
        const alreadyExists = previous.some(
          (message) => message.message_id === data.message.message_id,
        );

        if (alreadyExists) {
          return previous;
        }

        return [...previous, data.message];
      });
    };

    const handleSocketError = (data: { message?: string }) => {
      console.error("[UserAdvisorChat] Socket error:", data);

      setError(
        data?.message || "Something went wrong while sending the message.",
      );

      setSending(false);
    };

    socket.on("user_advisor_message", handleMessage);
    socket.on("user_advisor_error", handleSocketError);

    return () => {
      socket.off("user_advisor_message", handleMessage);
      socket.off("user_advisor_error", handleSocketError);
    };
  }, []);

  /*
   * Start or continue an advisor conversation.
   */
  const openConversation = async (advisorType: AdvisorType) => {
    try {
      setLoading(true);
      setError("");
      setSelectedType(advisorType);

      const currentSessionId = sessionIdRef.current?.trim();

      console.log("Starting advisor conversation:", {
        session_id: currentSessionId,
        advisor_type: advisorType,
        api_url: API_URL,
      });

      if (!currentSessionId) {
        const message =
          "No SafeLink session ID was found. Please log in again.";

        console.error(message);
        setError(message);

        return;
      }

      /*
       * Make sure socket is connected before joining.
       */
      if (!socket.connected) {
        console.log(
          "[UserAdvisorChat] Socket is not connected. Connecting...",
        );

        socket.connect();

        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => {
            cleanup();
            reject(new Error("Socket connection timed out."));
          }, 5000);

          const handleConnect = () => {
            cleanup();
            resolve();
          };

          const handleError = () => {
            cleanup();
            reject(new Error("Unable to connect to the chat server."));
          };

          const cleanup = () => {
            window.clearTimeout(timeout);
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleError);
          };

          socket.once("connect", handleConnect);
          socket.once("connect_error", handleError);
        });
      }

      /*
       * Leave previous room.
       */
      const previousConversationId = conversationIdRef.current;

      if (previousConversationId) {
        socket.emit("user_advisor_leave", previousConversationId);
      }

      /*
       * Start / continue conversation.
       */
      const response = await axios.post(
        `${API_URL}/api/user-advisor-conversations/start`,
        {
          session_id: currentSessionId,
          advisor_type: advisorType,
        },
      );

      console.log("Start conversation response:", response.data);

      const newConversation = response.data?.conversation as
        | Conversation
        | undefined;

      if (!newConversation) {
        const message = "The server did not return a conversation.";

        console.error(message, response.data);
        setError(message);

        return;
      }

      if (newConversation.session_id !== currentSessionId) {
        const message =
          "The returned conversation does not belong to this session.";

        console.error(message, newConversation);
        setError(message);

        return;
      }

      /*
       * Store conversation.
       */
      setConversation(newConversation);
      setMessages(newConversation.messages || []);
      setSelectedType(newConversation.advisor_type);

      conversationIdRef.current = newConversation.conversation_id;

      /*
       * Join Socket.IO room.
       */
      socket.emit("user_advisor_join", {
        conversation_id: newConversation.conversation_id,
        session_id: currentSessionId,
      });

      console.log(
        "[UserAdvisorChat] Joined advisor conversation:",
        newConversation.conversation_id,
      );
    } catch (error: any) {
      console.error("Open advisor conversation error:", error);
      console.error("Backend response:", error?.response?.data);
      console.error("HTTP status:", error?.response?.status);

      let errorMessage = "Unable to start the advisor conversation.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.request && !error?.response) {
        errorMessage =
          "Cannot connect to the backend server. Make sure the backend is running on port 5000.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Send a message through Socket.IO.
   */
  const sendMessage = () => {
    if (
      !conversation ||
      conversation.status !== "active" ||
      !text.trim() ||
      sending
    ) {
      return;
    }

    const currentSessionId = sessionIdRef.current?.trim();

    if (!currentSessionId) {
      setError("Your SafeLink session is missing. Please log in again.");
      return;
    }

    if (!socket.connected) {
      setError(
        "Chat connection is not available. Please wait a moment and try again.",
      );

      console.error("[UserAdvisorChat] Cannot send: socket is disconnected.");

      return;
    }

    const messageText = text.trim();

    setSending(true);
    setError("");

    console.log("[UserAdvisorChat] Sending message:", {
      conversation_id: conversation.conversation_id,
      session_id: currentSessionId,
      text: messageText,
    });

    socket.emit(
      "user_advisor_send_message",
      {
        conversation_id: conversation.conversation_id,
        session_id: currentSessionId,
        text: messageText,
      },
      (response: SendMessageResponse) => {
        console.log("[UserAdvisorChat] Send response:", response);

        if (!response?.success) {
          setError(response?.error || "Failed to send message.");
          setSending(false);
          return;
        }

        if (response.message) {
          setMessages((previous) => {
            const alreadyExists = previous.some(
              (message) =>
                message.message_id === response.message?.message_id,
            );

            if (alreadyExists) {
              return previous;
            }

            return [...previous, response.message!];
          });
        }

        setText("");
        setSending(false);
      },
    );

    /*
     * Safety timeout in case the backend never acknowledges the message.
     */
    window.setTimeout(() => {
      setSending((current) => {
        if (current) {
          setError(
            "The message was not acknowledged by the server. Please try again.",
          );

          return false;
        }

        return current;
      });
    }, 10000);
  };

  /*
   * Enter sends the message.
   * Shift + Enter creates a new line.
   */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  /*
   * Close the currently opened conversation
   * in the frontend and leave its socket room.
   */
  const leaveConversation = () => {
    const currentConversationId = conversationIdRef.current;

    if (currentConversationId) {
      socket.emit("user_advisor_leave", currentConversationId);
    }

    conversationIdRef.current = null;

    setConversation(null);
    setMessages([]);
    setSelectedType(null);
    setText("");
    setError("");
  };

  /*
   * Render advisor recommendations.
   */
  const renderRecommendations = () => {
    if (!conversation || conversation.advisor_type !== "general") {
      return null;
    }

    const recommendations = conversation.suggested_advisor_types || [];

    if (recommendations.length === 0) {
      return null;
    }

    return (
      <div className="border-t border-[#a79093]/30 bg-[#f7f5f6] px-4 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#a79093]">
          Recommended advisor
        </p>

        <div className="flex flex-wrap gap-2">
          {recommendations.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => openConversation(type)}
              disabled={loading}
              className="border border-[#a79093] bg-white px-3 py-2 text-sm font-medium text-[#3e1919] transition hover:border-[#3e1919] hover:bg-[#f0e2d6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {advisorLabels[type]}
            </button>
          ))}
        </div>
      </div>
    );
  };

  /*
   * Advisor selection screen.
   */
  if (!conversation) {
    return (
      <div className="mx-auto w-full max-w-4xl bg-[#f7f5f6]">
        <div className="border-b border-[#a79093]/40 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
            SafeLink Support
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#3e1919] sm:text-3xl">
            Talk to an Advisor
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#a79093]">
            Choose the type of support that best matches what you need.
            You can change to another advisor if necessary.
          </p>

          {sessionId && (
            <p className="mt-4 text-xs text-[#a79093]">
              Session: <span className="text-[#3e1919]">{sessionId}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="mt-5 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-4 py-3 text-sm text-[#3e1919]">
            {error}
          </div>
        )}

        <div className="mt-8 divide-y divide-[#a79093]/30 border-y border-[#a79093]/30">
          {(Object.keys(advisorLabels) as AdvisorType[]).map((type) => (
            <button
              key={type}
              type="button"
              disabled={loading}
              onClick={() => openConversation(type)}
              className="group flex w-full items-center justify-between gap-6 px-4 py-5 text-left transition hover:bg-[#f0e2d6]/60 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              <div className="min-w-0">
                <div className="text-base font-semibold text-[#3e1919]">
                  {advisorLabels[type]}
                </div>

                <div className="mt-1 text-sm text-[#a79093]">
                  {advisorDescriptions[type]}
                </div>

                {loading && selectedType === type && (
                  <div className="mt-2 text-xs font-medium text-[#3e1919]">
                    Connecting...
                  </div>
                )}
              </div>

              <span
                aria-hidden="true"
                className="shrink-0 text-xl text-[#a79093] transition group-hover:translate-x-1 group-hover:text-[#3e1919]"
              >
                →
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /*
   * Chat screen.
   */
  return (
    <div className="mx-auto flex h-[700px] w-full max-w-4xl flex-col overflow-hidden border border-[#a79093]/40 bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#a79093]/30 px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={leaveConversation}
          className="flex h-9 w-9 shrink-0 items-center justify-center text-[#3e1919] transition hover:bg-[#f0e2d6]"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft size={20} strokeWidth={1.8} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a79093]">
            SafeLink Advisor
          </p>

          <h2 className="mt-0.5 truncate font-semibold text-[#3e1919]">
            {advisorLabels[conversation.advisor_type]}
          </h2>

          <p className="truncate text-xs text-[#a79093]">
            Advisor ID: {conversation.advisor_id}
          </p>
        </div>

        {conversation.status === "closed" && (
          <span className="shrink-0 border border-[#a79093]/50 bg-[#f7f5f6] px-3 py-1 text-xs font-medium text-[#a79093]">
            Closed
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-b border-[#a79093]/30 bg-[#f0e2d6] px-4 py-3 text-sm text-[#3e1919]">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto bg-[#f7f5f6] px-4 py-5 sm:px-6">
        {messages.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-[#3e1919]">
              Start the conversation
            </p>
            <p className="mt-1 text-xs text-[#a79093]">
              Your messages will appear here.
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.sender === "user";
          const isDeleted =
            message.deletedForEveryone || message.deleted;

          return (
            <div
              key={message.message_id}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[82%] border px-4 py-3 sm:max-w-[70%] ${
                  isUser
                    ? "border-[#3e1919] bg-[#3e1919] text-[#f7f5f6]"
                    : "border-[#a79093]/30 bg-white text-[#3e1919]"
                }`}
              >
                {isDeleted ? (
                  <span className="text-sm italic opacity-65">
                    This message was deleted
                  </span>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.text}
                  </p>
                )}

                <div
                  className={`mt-2 text-[10px] ${
                    isUser
                      ? "text-[#f0e2d6]/80"
                      : "text-[#a79093]"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}

                  {message.edited && " • edited"}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Recommendations */}
      {renderRecommendations()}

      {/* Input */}
      {conversation.status === "active" ? (
        <div className="border-t border-[#a79093]/30 bg-white px-4 py-4 sm:px-5">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              disabled={sending}
              className="max-h-32 min-h-[46px] flex-1 resize-none border border-[#a79093]/50 bg-[#f7f5f6] px-4 py-3 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#3e1919] disabled:bg-[#f7f5f6]"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!text.trim() || sending}
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center bg-[#3e1919] text-[#f7f5f6] transition hover:bg-[#2d1111] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={19} strokeWidth={1.8} />
            </button>
          </div>

          <p className="mt-2 text-[10px] text-[#a79093]">
            Enter to send • Shift + Enter for a new line
          </p>
        </div>
      ) : (
        <div className="border-t border-[#a79093]/30 bg-[#f7f5f6] px-4 py-4 text-center text-sm text-[#a79093]">
          This conversation is closed.
        </div>
      )}
    </div>
  );
}