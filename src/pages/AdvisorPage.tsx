import { useEffect, useState } from "react";
import {
  getConversation,
  recommendFacility,
  sendAdvisorMessage,
  type Conversation,
} from "../api/medicalApi";

export default function AdvisorPage() {
  const [conversationId, setConversationId] =
    useState("");

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversation = async () => {
    if (!conversationId.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await getConversation(
        conversationId.trim()
      );

      setConversation(result);
    } catch (err) {
      console.error(err);
      setError(
        "Conversation could not be found."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversation?.conversation_id) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const updated = await getConversation(
          conversation.conversation_id
        );

        setConversation(updated);
      } catch (err) {
        console.error(err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [conversation?.conversation_id]);

  const handleSend = async () => {
    if (
      !conversation ||
      !message.trim() ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      const updated = await sendAdvisorMessage(
        conversation.conversation_id,
        message.trim()
      );

      setConversation(updated);
      setMessage("");
    } catch (err) {
      console.error(err);
      setError(
        "Advisor message could not be sent."
      );
    } finally {
      setSending(false);
    }
  };

  const handleRecommend = async () => {
    if (!conversation) {
      return;
    }

    try {
      setError("");

      const updated =
        await recommendFacility(
          conversation.conversation_id,
          {
            facility_name:
              "Addis Ababa Care Center",
            location:
              "Bole, Addis Ababa",
            contact:
              "+251-11-000-0000",
            notes:
              "Medical support is available.",
          }
        );

      setConversation(updated);
    } catch (err) {
      console.error(err);
      setError(
        "Facility recommendation could not be saved."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            SafeLink Advisor
          </p>

          <h1 className="text-3xl font-bold">
            Medical Support
          </h1>

          <p className="mt-2 text-gray-600">
            Review a private support conversation
            and provide guidance.
          </p>
        </div>

        {!conversation && (
          <div className="rounded-xl bg-white border p-6">
            <label className="block text-sm font-medium mb-2">
              Conversation ID
            </label>

            <div className="flex gap-2">
              <input
                value={conversationId}
                onChange={(e) =>
                  setConversationId(e.target.value)
                }
                placeholder="CONV-..."
                className="flex-1 rounded-lg border px-4 py-3"
              />

              <button
                onClick={loadConversation}
                disabled={loading}
                className="rounded-lg bg-black px-5 py-3 text-white"
              >
                {loading ? "Loading..." : "Open"}
              </button>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600">
                {error}
              </p>
            )}
          </div>
        )}

        {conversation && (
          <>
            <div className="mb-4 rounded-xl bg-white border p-4">
              <p className="text-sm text-gray-500">
                Conversation
              </p>

              <p className="font-mono font-medium">
                {conversation.conversation_id}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                SafeLink session
              </p>

              <p className="font-mono">
                {conversation.session_id}
              </p>
            </div>

            <div className="rounded-xl bg-white border p-5 min-h-[420px]">
              <div className="space-y-4">
                {conversation.messages.map(
                  (msg, index) => (
                    <div
                      key={`${msg.timestamp}-${index}`}
                      className={`flex ${
                        msg.sender === "advisor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-3 ${
                          msg.sender === "advisor"
                            ? "bg-black text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <p className="text-xs opacity-60 mb-1">
                          {msg.sender === "advisor"
                            ? "You"
                            : "User"}
                        </p>

                        <p className="whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-white border p-4">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Reply to the user..."
                  disabled={sending}
                  className="flex-1 rounded-lg border px-4 py-3"
                />

                <button
                  onClick={handleSend}
                  disabled={
                    sending || !message.trim()
                  }
                  className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
                >
                  {sending
                    ? "Sending..."
                    : "Reply"}
                </button>
              </div>
            </div>

            {!conversation.recommendation && (
              <div className="mt-4 rounded-xl bg-white border p-5">
                <h2 className="font-bold">
                  Facility Recommendation
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Save the recommended medical facility
                  for the user.
                </p>

                <button
                  onClick={handleRecommend}
                  className="mt-4 rounded-lg bg-black px-5 py-3 text-white"
                >
                  Recommend Addis Ababa Care Center
                </button>
              </div>
            )}

            {conversation.recommendation && (
              <div className="mt-4 rounded-xl bg-white border p-5">
                <p className="text-sm text-gray-500">
                  Recommendation saved
                </p>

                <h2 className="font-bold mt-1">
                  {
                    conversation.recommendation
                      .facility_name
                  }
                </h2>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}