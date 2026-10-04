import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAdvisorConversation,
  sendAdvisorMessage,
} from "../api/advisorConversationApi";
import type { Conversation } from "../api/conversationApi";

export default function AdvisorConversation() {
  const { conversationId } = useParams<{ conversationId: string }>();

  const [conversation, setConversation] = useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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

  // Refresh every 3 seconds so new user messages appear.
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      loadConversation();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversationId]);

  const handleSendMessage = async () => {
    if (!conversationId || !message.trim()) return;

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

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <p className="text-red-600">{error || "Conversation not found."}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">SafeLink Advisor</p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            {conversation.advisor_type} Conversation
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {conversation.conversation_id}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Chat */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="h-[550px] space-y-4 overflow-y-auto p-6">
            {conversation.messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-gray-500">
                  No messages yet.
                  <br />
                  Waiting for the user to send a message.
                </p>
              </div>
            ) : (
              conversation.messages
                .filter((msg) => !msg.deleted)
                .map((msg) => (
                  <div
                    key={msg.message_id}
                    className={`flex ${
                      msg.sender === "advisor" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        msg.sender === "advisor"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="mb-1 text-xs font-semibold opacity-70">
                        {msg.sender === "advisor" ? "You" : "User"}
                      </p>

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      <p className="mt-1 text-xs opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Message input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-3">
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
                placeholder="Type your reply..."
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending || !message.trim()}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "..." : "Send"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
