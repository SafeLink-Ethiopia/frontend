import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

interface ConversationsResponse {
  conversations: Conversation[];
}

export default function AdminMessages() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("adminToken");

        if (!token) {
          setError("Admin authentication required.");
          setLoading(false);
          return;
        }

        const response = await axios.get<ConversationsResponse>(
          "http://localhost:5000/api/advisor-admin-conversations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        console.log(
          "Admin conversations received:",
          response.data.conversations,
        );

        setConversations(response.data.conversations || []);
      } catch (error) {
        console.error("Failed to load conversations:", error);

        if (axios.isAxiosError(error)) {
          console.error("Status:", error.response?.status);
          console.error("Response:", error.response?.data);

          if (error.response?.status === 401) {
            setError("Your admin session has expired. Please log in again.");
          } else if (error.response?.status === 403) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminId");
            navigate("/admin/login", { replace: true });
          } else if (error.response?.status === 404) {
            setError("Admin conversations endpoint was not found.");
          } else {
            setError(
              error.response?.data?.message || "Failed to load conversations.",
            );
          }
        } else {
          setError("Something went wrong.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [navigate]);

  /*
   * ============================================================
   * OPEN CONVERSATION
   * ============================================================
   */
  const openConversation = (conversation: Conversation) => {
    console.log("Opening conversation:", conversation);
    console.log("Conversation ID:", conversation.conversation_id);
    console.log("Advisor ID:", conversation.advisor_id);

    if (!conversation.advisor_id) {
      setError("This conversation does not have an advisor ID.");
      return;
    }

    navigate(`/admin/advisors/${conversation.advisor_id}/chat`);
  };

  /*
   * ============================================================
   * GET LAST MESSAGE
   * ============================================================
   */
  const getLastMessage = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "No messages yet";
    }

    return conversation.messages[conversation.messages.length - 1].text;
  };

  /*
   * ============================================================
   * GET LAST MESSAGE TIME
   * ============================================================
   */
  const getLastMessageTime = (conversation: Conversation) => {
    /*
     * If there are no messages, use updatedAt.
     */
    if (!conversation.messages || conversation.messages.length === 0) {
      if (!conversation.updatedAt) {
        return "";
      }

      const date = new Date(conversation.updatedAt);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleString();
    }

    /*
     * Otherwise use the last message timestamp.
     */
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    if (!lastMessage.timestamp) {
      return "";
    }

    const date = new Date(lastMessage.timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString();
  };

  /*
   * ============================================================
   * LOADING STATE
   * ============================================================
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-slate-500">Loading messages...</p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */
  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        {/* ======================================================
            HEADER
        ====================================================== */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage your conversations with advisors.
          </p>
        </div>

        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-4 font-medium hover:text-red-900"
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* ======================================================
            NO CONVERSATIONS
        ====================================================== */}
        {conversations.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
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

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No conversations yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Conversations with advisors will appear here.
            </p>

            <button
              type="button"
              onClick={() => navigate("/admin/advisors")}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Go to Advisors
            </button>
          </div>
        ) : (
          /* ====================================================
             CONVERSATION LIST
          ==================================================== */
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="divide-y divide-slate-100">
              {conversations.map((conversation) => {
                const hasAdvisorId = Boolean(conversation.advisor_id);

                return (
                  <button
                    key={conversation.conversation_id}
                    type="button"
                    onClick={() => openConversation(conversation)}
                    disabled={!hasAdvisorId}
                    className="flex w-full items-center gap-4 px-6 py-5 text-left transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {/* ==================================================
                        AVATAR
                    ================================================== */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                      {conversation.advisor_id
                        ? conversation.advisor_id.slice(0, 2).toUpperCase()
                        : "AD"}
                    </div>

                    {/* ==================================================
                        CONVERSATION INFORMATION
                    ================================================== */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="font-semibold text-slate-900">
                            Advisor
                          </h2>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {conversation.advisor_id ||
                              "Advisor ID unavailable"}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-slate-400">
                          {getLastMessageTime(conversation)}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm text-slate-500">
                        {getLastMessage(conversation)}
                      </p>
                    </div>

                    {/* ==================================================
                        ARROW
                    ================================================== */}
                    <svg
                      className="h-5 w-5 shrink-0 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
