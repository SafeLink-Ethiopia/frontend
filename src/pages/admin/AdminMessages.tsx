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
    const lastMessage =
      conversation.messages[conversation.messages.length - 1];

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
      <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <header className="border-b border-[#a79093]/30 pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
              SafeLink Administration
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#3e1919]">
              Messages
            </h1>

            <p className="mt-3 text-sm text-[#a79093]">
              View and manage conversations with advisors.
            </p>
          </header>

          <div className="flex min-h-[45vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#a79093]/30 border-t-[#3e1919]" />

              <p className="mt-4 text-sm text-[#a79093]">
                Loading conversations...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ============================================================
   * MAIN UI
   * ============================================================
   */
  return (
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="border-b border-[#a79093]/30 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a79093]">
            SafeLink Administration
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#3e1919] sm:text-4xl">
                Messages
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a79093]">
                View and manage your conversations with SafeLink advisors.
              </p>
            </div>

            <div className="border-l-2 border-[#3e1919] pl-4">
              <p className="text-xs uppercase tracking-wider text-[#a79093]">
                Conversations
              </p>

              <p className="mt-1 text-sm font-medium text-[#3e1919]">
                {conversations.length}{" "}
                {conversations.length === 1
                  ? "conversation"
                  : "conversations"}
              </p>
            </div>
          </div>
        </header>

        {/* ======================================================
            ERROR MESSAGE
        ====================================================== */}

        {error && (
          <div className="mt-6 flex items-start justify-between gap-5 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a79093]">
                Notice
              </p>

              <p className="mt-1 text-sm leading-6 text-[#3e1919]">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-lg leading-none text-[#a79093] transition hover:text-[#3e1919]"
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
          <section className="mt-10 border-y border-[#a79093]/30 py-14">
            <div className="max-w-xl">
              <div className="flex h-12 w-12 items-center justify-center border border-[#a79093]/40 bg-[#f0e2d6]">
                <svg
                  className="h-6 w-6 text-[#3e1919]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 4H7a4 4 0 01-4-4V8a4 4 0 014-4h10a4 4 0 014 4v8a4 4 0 01-4 4z"
                  />
                </svg>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                Inbox
              </p>

              <h2 className="mt-2 text-2xl font-semibold text-[#3e1919]">
                No conversations yet
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-[#a79093]">
                Conversations with advisors will appear here once they become
                available.
              </p>

              <button
                type="button"
                onClick={() => navigate("/admin/advisors")}
                className="mt-7 border border-[#3e1919] bg-[#3e1919] px-5 py-2.5 text-sm font-medium text-[#f7f5f6] transition hover:bg-[#3e1919]/90"
              >
                Go to Advisors
              </button>
            </div>
          </section>
        ) : (
          /* ====================================================
             CONVERSATION LIST
          ==================================================== */

          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                  Inbox
                </p>

                <h2 className="mt-1 text-xl font-semibold text-[#3e1919]">
                  Advisor conversations
                </h2>
              </div>

              <span className="text-xs text-[#a79093]">
                Select a conversation to open it
              </span>
            </div>

            <div className="border-y border-[#a79093]/30">
              {conversations.map((conversation, index) => {
                const hasAdvisorId = Boolean(conversation.advisor_id);

                return (
                  <button
                    key={conversation.conversation_id}
                    type="button"
                    onClick={() => openConversation(conversation)}
                    disabled={!hasAdvisorId}
                    className={`group flex w-full items-center gap-4 px-2 py-5 text-left transition sm:px-4 ${
                      index !== conversations.length - 1
                        ? "border-b border-[#a79093]/20"
                        : ""
                    } ${
                      hasAdvisorId
                        ? "hover:bg-[#f0e2d6]/60"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    {/* ==================================================
                        AVATAR
                    ================================================== */}

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#3e1919] text-xs font-semibold tracking-wide text-[#f7f5f6]">
                      {conversation.advisor_id
                        ? conversation.advisor_id.slice(0, 2).toUpperCase()
                        : "AD"}
                    </div>

                    {/* ==================================================
                        CONVERSATION INFORMATION
                    ================================================== */}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#3e1919]">
                            Advisor
                          </h3>

                          <p className="mt-0.5 truncate text-xs text-[#a79093]">
                            {conversation.advisor_id ||
                              "Advisor ID unavailable"}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-[#a79093]">
                          {getLastMessageTime(conversation)}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm text-[#a79093]">
                        {getLastMessage(conversation)}
                      </p>
                    </div>

                    {/* ==================================================
                        ARROW
                    ================================================== */}

                    <svg
                      className="h-5 w-5 shrink-0 text-[#a79093] transition-transform group-hover:translate-x-1 group-hover:text-[#3e1919]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ======================================================
            FOOTER
        ====================================================== */}

        <footer className="mt-10 border-t border-[#a79093]/30 pt-6">
          <p className="text-xs leading-5 text-[#a79093]">
            SafeLink administration · Advisor conversations are handled
            securely through the administrator interface.
          </p>
        </footer>
      </div>
    </main>
  );
}