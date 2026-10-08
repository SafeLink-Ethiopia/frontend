import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAdvisorConversation,
  sendAdvisorMessage,
} from "../api/advisorConversationApi";
import type { Conversation } from "../api/conversationApi";
import {
  ArrowLeft,
  CheckCheck,
  Clock3,
  MoreVertical,
  Paperclip,
  Send,
  User,
} from "lucide-react";

const COLORS = {
  mist: "#FAFBF7",
  mint: "#E7F1E3",
  leaf: "#2F8F4E",
  forest: "#176B3A",
  ink: "#173B28",
};

export default function AdvisorConversation() {
  const { conversationId } = useParams<{ conversationId: string }>();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversation = async () => {
    if (!conversationId) return;

    try {
      const result = await getAdvisorConversation(conversationId);

      setConversation(result);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load this conversation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  // Refresh every 3 seconds for new user messages.
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      loadConversation();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

  // Scroll to the newest message.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation?.messages]);

  const handleSendMessage = async () => {
    if (!conversationId || !message.trim() || sending) return;

    try {
      setSending(true);
      setError("");

      const updatedConversation = await sendAdvisorMessage(
        conversationId,
        message.trim(),
      );

      setConversation(updatedConversation);
      setMessage("");
    } catch (err) {
      console.error(err);
      setError("Unable to send your message.");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const visibleMessages =
    conversation?.messages.filter((msg) => !msg.deleted) ?? [];

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: COLORS.mist }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
            style={{
              borderColor: COLORS.mint,
              borderTopColor: COLORS.leaf,
            }}
          />

          <p className="text-sm font-medium" style={{ color: COLORS.ink }}>
            Loading conversation...
          </p>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main
        className="flex min-h-screen items-center justify-center p-6"
        style={{ backgroundColor: COLORS.mist }}
      >
        <div
          className="w-full max-w-md rounded-3xl border p-8 text-center"
          style={{
            backgroundColor: COLORS.mint,
            borderColor: COLORS.leaf,
          }}
        >
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor: COLORS.leaf,
              color: COLORS.mist,
            }}
          >
            <Clock3 size={25} />
          </div>

          <h2 className="text-xl font-bold" style={{ color: COLORS.forest }}>
            Conversation unavailable
          </h2>

          <p className="mt-2 text-sm" style={{ color: COLORS.ink }}>
            {error || "Conversation not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen p-0 md:p-5"
      style={{ backgroundColor: COLORS.mist }}
    >
      <div
        className="mx-auto flex h-screen max-w-6xl flex-col overflow-hidden md:h-[calc(100vh-40px)] md:rounded-3xl md:border"
        style={{
          backgroundColor: COLORS.mist,
          borderColor: COLORS.leaf,
        }}
      >
        {/* Telegram-style top bar */}
        <header
          className="flex min-h-[76px] items-center justify-between border-b px-4 md:px-6"
          style={{
            backgroundColor: COLORS.mint,
            borderColor: COLORS.leaf,
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            {/* Back button */}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition"
              style={{
                backgroundColor: COLORS.mist,
                color: COLORS.forest,
              }}
              title="Back"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Advisor avatar */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold"
              style={{
                backgroundColor: COLORS.leaf,
                color: COLORS.mist,
              }}
            >
              <User size={21} />
            </div>

            {/* Conversation information */}
            <div className="min-w-0">
              <h1
                className="truncate text-base font-bold capitalize md:text-lg"
                style={{ color: COLORS.forest }}
              >
                {conversation.advisor_type} Advisor
              </h1>

              <p className="truncate text-xs" style={{ color: COLORS.ink }}>
                SafeLink Advisor • Online conversation
              </p>
            </div>
          </div>

          {/* Header actions */}
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition"
            style={{
              color: COLORS.forest,
            }}
            title="More options"
          >
            <MoreVertical size={21} />
          </button>
        </header>

        {/* Error message */}
        {error && (
          <div
            className="mx-4 mt-3 rounded-xl border px-4 py-3 text-sm md:mx-6"
            style={{
              backgroundColor: COLORS.mint,
              borderColor: COLORS.leaf,
              color: COLORS.ink,
            }}
          >
            {error}
          </div>
        )}

        {/* Chat area */}
        <section
          className="relative flex-1 overflow-hidden"
          style={{ backgroundColor: COLORS.mist }}
        >
          {/* Conversation ID */}
          <div className="pointer-events-none absolute left-0 right-0 top-3 z-10 flex justify-center">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-medium"
              style={{
                backgroundColor: COLORS.mint,
                color: COLORS.ink,
              }}
            >
              {conversation.conversation_id}
            </span>
          </div>

          {/* Messages */}
          <div className="h-full overflow-y-auto px-3 pb-5 pt-14 md:px-8">
            {visibleMessages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div
                  className="max-w-sm rounded-3xl border p-7 text-center"
                  style={{
                    backgroundColor: COLORS.mint,
                    borderColor: COLORS.leaf,
                  }}
                >
                  <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: COLORS.leaf,
                      color: COLORS.mist,
                    }}
                  >
                    <User size={24} />
                  </div>

                  <h3 className="font-bold" style={{ color: COLORS.forest }}>
                    No messages yet
                  </h3>

                  <p className="mt-1 text-sm" style={{ color: COLORS.ink }}>
                    Waiting for the user to send a message.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-4xl flex-col gap-2">
                {visibleMessages.map((msg) => {
                  const isAdvisor = msg.sender === "advisor";

                  return (
                    <div
                      key={msg.message_id}
                      className={`flex ${
                        isAdvisor ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`group relative flex max-w-[82%] flex-col px-3.5 py-2.5 md:max-w-[70%] ${
                          isAdvisor
                            ? "rounded-2xl rounded-br-md"
                            : "rounded-2xl rounded-bl-md"
                        }`}
                        style={{
                          backgroundColor: isAdvisor
                            ? COLORS.forest
                            : COLORS.mint,
                          color: isAdvisor ? COLORS.mist : COLORS.ink,
                        }}
                      >
                        {/* Sender */}
                        <p
                          className="mb-0.5 text-[11px] font-bold"
                          style={{
                            color: isAdvisor ? COLORS.mint : COLORS.leaf,
                          }}
                        >
                          {isAdvisor ? "You" : "User"}
                        </p>

                        {/* Message text */}
                        <p className="whitespace-pre-wrap break-words text-[14px] leading-5">
                          {msg.text}
                        </p>

                        {/* Time + read status */}
                        <div
                          className={`mt-1 flex items-center gap-1 self-end text-[10px] ${
                            isAdvisor ? "" : ""
                          }`}
                          style={{
                            color: isAdvisor ? COLORS.mint : COLORS.ink,
                            opacity: 0.7,
                          }}
                        >
                          <span>{formatTime(msg.timestamp)}</span>

                          {isAdvisor && <CheckCheck size={14} />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </section>

        {/* Telegram-style composer */}
        <footer
          className="border-t p-3 md:p-4"
          style={{
            backgroundColor: COLORS.mint,
            borderColor: COLORS.leaf,
          }}
        >
          <div className="mx-auto flex max-w-4xl items-end gap-2">
            {/* Attachment button */}
            <button
              type="button"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition"
              style={{
                backgroundColor: COLORS.mist,
                color: COLORS.forest,
              }}
              title="Attach"
            >
              <Paperclip size={20} />
            </button>

            {/* Message input */}
            <div
              className="flex min-h-[44px] flex-1 items-center rounded-2xl border px-4"
              style={{
                backgroundColor: COLORS.mist,
                borderColor: COLORS.leaf,
              }}
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Write a message..."
                disabled={sending}
                className="w-full bg-transparent text-sm outline-none"
                style={{
                  color: COLORS.ink,
                }}
              />
            </div>

            {/* Send button */}
            <button
              type="button"
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: COLORS.leaf,
                color: COLORS.mist,
              }}
              title="Send message"
            >
              {sending ? (
                <div
                  className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                  style={{
                    borderColor: COLORS.mist,
                    borderTopColor: "transparent",
                  }}
                />
              ) : (
                <Send size={19} />
              )}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
