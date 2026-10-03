import { useEffect, useState } from "react";
import QuickExit from "../components/QuickExit";
import {
  getUserConversation,
  requestAdvisor,
  sendMessage,
  type AdvisorType,
  type Conversation,
} from "../api/conversationApi";

const advisorTypes: {
  value: AdvisorType;
  label: string;
  description: string;
}[] = [
  {
    value: "medical",
    label: "Medical Advisor",
    description: "Health and medical support",
  },
  {
    value: "legal",
    label: "Legal Advisor",
    description: "Legal information and guidance",
  },
  {
    value: "psychological",
    label: "Psychological Advisor",
    description: "Emotional and psychological support",
  },
  {
    value: "general",
    label: "General Advisor",
    description: "General support and guidance",
  },
];

export default function UserAdvisorChat() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [selectedType, setSelectedType] = useState<AdvisorType>("general");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

const savedSession = localStorage.getItem("safelink_session");

const sessionId = savedSession ? JSON.parse(savedSession).safelink_id : null;

  const loadConversation = async () => {
    if (!sessionId) {
      setError("Your SafeLink session was not found.");
      setLoading(false);
      return;
    }

    try {
      const result = await getUserConversation(sessionId);
      setConversation(result);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to load your conversation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
  }, []);

  useEffect(() => {
    if (!conversation) return;

    const interval = setInterval(() => {
      loadConversation();
    }, 3000);

    return () => clearInterval(interval);
  }, [conversation?.conversation_id]);

  const handleRequestAdvisor = async () => {
    if (!sessionId) {
      setError("Your SafeLink session was not found.");
      return;
    }

    try {
      setRequesting(true);
      setError("");

      const result = await requestAdvisor(sessionId, selectedType);

      setConversation(result);
    } catch (err) {
      console.error(err);
      setError("Unable to request an advisor.");
    } finally {
      setRequesting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!conversation || !message.trim()) return;

    try {
      setSending(true);
      setError("");

      const updatedConversation = await sendMessage(
        conversation.conversation_id,
        "user",
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
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <QuickExit />

        <div className="mx-auto max-w-3xl">
          <p className="text-gray-600">Loading your support chat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <QuickExit />

      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">SafeLink Support</p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Talk to an Advisor
          </h1>

          <p className="mt-2 text-gray-600">
            You can privately communicate with a SafeLink advisor.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!conversation ? (
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              What kind of support do you need?
            </h2>

            <div className="mt-5 space-y-3">
              {advisorTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selectedType === type.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <p className="font-semibold text-gray-900">{type.label}</p>

                  <p className="mt-1 text-sm text-gray-600">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRequestAdvisor}
              disabled={requesting}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {requesting ? "Connecting..." : "Talk to an Advisor"}
            </button>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="border-b border-gray-200 p-5">
              <p className="text-sm text-gray-500">Connected to</p>

              <h2 className="mt-1 text-lg font-semibold capitalize text-gray-900">
                {conversation.advisor_type} Advisor
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Conversation ID: {conversation.conversation_id}
              </p>
            </div>

            <div className="h-[500px] space-y-4 overflow-y-auto p-5">
              {conversation.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-gray-500">
                    No messages yet.
                    <br />
                    Send a message to start the conversation.
                  </p>
                </div>
              ) : (
                conversation.messages
                  .filter((msg) => !msg.deleted)
                  .map((msg) => (
                    <div
                      key={msg.message_id}
                      className={`flex ${
                        msg.sender === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        <p
                          className={`mt-1 text-xs ${
                            msg.sender === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
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
                  placeholder="Type your message..."
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
        )}
      </div>
    </main>
  );
}
