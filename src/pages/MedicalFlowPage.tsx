import { useEffect, useState } from "react";
import {
  getConversation,
  requestMedicalSupport,
  sendUserMessage,
  type Conversation,
} from "../api/medicalApi";

const CONVERSATION_STORAGE_KEY = "safelink_medical_conversation";

export default function MedicalFlowPage() {
  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const startMedicalFlow = async () => {
      try {
        const storedSession =
          localStorage.getItem("safelink_session");

        if (!storedSession) {
          setError("No private SafeLink session was found.");
          return;
        }

        const session = JSON.parse(storedSession);

        if (!session.safelink_id) {
          setError("Your SafeLink ID could not be found.");
          return;
        }

        const existingConversation =
          localStorage.getItem(
            CONVERSATION_STORAGE_KEY
          );

        if (existingConversation) {
          try {
            const savedConversation =
              JSON.parse(existingConversation);

            if (
              savedConversation.session_id ===
              session.safelink_id
            ) {
              const refreshed = await getConversation(
                savedConversation.conversation_id
              );

              setConversation(refreshed);
              return;
            }
          } catch {
            localStorage.removeItem(
              CONVERSATION_STORAGE_KEY
            );
          }
        }

        const newConversation =
          await requestMedicalSupport(
            session.safelink_id
          );

        setConversation(newConversation);

        localStorage.setItem(
          CONVERSATION_STORAGE_KEY,
          JSON.stringify(newConversation)
        );
      } catch (err) {
        console.error(err);
        setError(
          "We could not connect you to medical support."
        );
      } finally {
        setLoading(false);
      }
    };

    startMedicalFlow();
  }, []);

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

        localStorage.setItem(
          CONVERSATION_STORAGE_KEY,
          JSON.stringify(updated)
        );
      } catch (err) {
        console.error(
          "Failed to refresh conversation:",
          err
        );
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
      setError("");

      const updated = await sendUserMessage(
        conversation.conversation_id,
        message.trim()
      );

      setConversation(updated);

      localStorage.setItem(
        CONVERSATION_STORAGE_KEY,
        JSON.stringify(updated)
      );

      setMessage("");
    } catch (err) {
      console.error(err);
      setError("Your message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Private Support Session
          </p>

          <h1 className="text-2xl font-bold mt-2">
            Connecting you to medical support...
          </h1>

          <p className="mt-3 text-gray-500">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  if (error && !conversation) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold">
            Something went wrong
          </h1>

          <p className="mt-3 text-gray-600">
            {error}
          </p>

          <button
            onClick={() => window.history.back()}
            className="mt-6 rounded-lg bg-black px-6 py-3 text-white"
          >
            Go Back
          </button>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto w-full max-w-2xl">

        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Private Support Session
          </p>

          <h1 className="text-3xl font-bold mt-1">
            Medical Support
          </h1>

          <p className="mt-2 text-gray-600">
            You are connected with a support advisor.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-xl bg-white border p-5 min-h-[420px]">
          <div className="space-y-4">

            {conversation.messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Your advisor is ready to help.
                </p>
              </div>
            )}

            {conversation.messages.map(
              (msg, index) => (
                <div
                  key={`${msg.timestamp}-${index}`}
                  className={`flex ${
                    msg.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.sender === "user"
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-xs opacity-60 mb-1">
                      {msg.sender === "user"
                        ? "You"
                        : "Advisor"}
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

        {conversation.recommendation ? (
          <div className="mt-5 rounded-xl bg-white border p-6">
            <p className="text-sm font-medium text-gray-500">
              Recommended facility
            </p>

            <h2 className="text-xl font-bold mt-2">
              {
                conversation.recommendation
                  .facility_name
              }
            </h2>

            <p className="mt-2 text-gray-600">
              {conversation.recommendation.location}
            </p>

            <p className="mt-1 text-gray-600">
              {conversation.recommendation.contact}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              {conversation.recommendation.notes}
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-white border p-4">
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
                placeholder="Write a message..."
                disabled={sending}
                className="flex-1 rounded-lg border px-4 py-3 outline-none focus:ring-2"
              />

              <button
                onClick={handleSend}
                disabled={
                  sending || !message.trim()
                }
                className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send"}
              </button>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}