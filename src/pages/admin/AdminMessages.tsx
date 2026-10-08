import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Users } from "lucide-react";

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
      <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="rounded-2xl border border-[#2F8F4E]/30 bg-gradient-to-br from-white to-[#E7F1E3]/60 p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2F8F4E]/30 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
              SafeLink Administration
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#176B3A]">
              Messages
            </h1>

            <div className="mt-4 h-1 w-20 rounded-full bg-[#2F8F4E]" />

            <p className="mt-4 text-sm text-[#173B28]/70">
              View and manage conversations with advisors.
            </p>
          </div>

          <div className="flex min-h-[45vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F1E3]">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2F8F4E]/30 border-t-[#2F8F4E]" />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#176B3A]">
                Loading conversations...
              </p>

              <p className="mt-1 text-xs text-[#173B28]/60">
                Fetching advisor conversations.
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
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <header className="rounded-2xl border border-[#2F8F4E]/30 bg-gradient-to-br from-white to-[#E7F1E3]/60 p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2F8F4E]/30 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                SafeLink Administration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-[#176B3A] sm:text-4xl">
                Messages
              </h1>

              <div className="mt-4 h-1 w-20 rounded-full bg-[#2F8F4E]" />

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#173B28]/70 sm:text-base">
                View and manage your conversations with SafeLink advisors.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-[#2F8F4E]/30 bg-white px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2F8F4E]">
                Conversations
              </p>

              <p className="mt-2 text-sm font-semibold text-[#176B3A]">
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
          <div className="mt-6 flex items-start justify-between gap-5 rounded-2xl border border-[#2F8F4E]/30 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#176B3A] text-xs font-bold text-white">
                !
              </span>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
                  Notice
                </p>

                <p className="mt-1 text-sm leading-6 text-[#176B3A]">
                  {error}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 rounded-full p-1 text-lg leading-none text-[#173B28]/50 transition hover:bg-[#E7F1E3] hover:text-[#176B3A]"
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
          <section className="mt-10 rounded-2xl border border-[#2F8F4E]/30 bg-white p-10 text-center shadow-sm sm:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E7F1E3]">
              <MessageSquare size={25} className="text-[#2F8F4E]" />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Inbox
            </p>

            <h2 className="mt-2 text-2xl font-semibold text-[#176B3A]">
              No conversations yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#173B28]/65">
              Conversations with advisors will appear here once they become
              available.
            </p>

            <button
              type="button"
              onClick={() => navigate("/admin/advisors")}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2F8F4E] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#176B3A]"
            >
              <Users size={15} />
              Go to Advisors
            </button>
          </section>
        ) : (
          /* ====================================================
             CONVERSATION LIST
          ==================================================== */

          <section className="mt-10">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
                  Inbox
                </p>

                <h2 className="mt-2 text-2xl font-semibold text-[#176B3A] sm:text-3xl">
                  Advisor conversations
                </h2>
              </div>

              <span className="hidden text-xs text-[#173B28]/60 sm:block">
                Select a conversation to open it
              </span>
            </div>

            <div className="space-y-3">
              {conversations.map((conversation) => {
                const hasAdvisorId = Boolean(conversation.advisor_id);

                return (
                  <button
                    key={conversation.conversation_id}
                    type="button"
                    onClick={() => openConversation(conversation)}
                    disabled={!hasAdvisorId}
                    className={`group flex w-full items-center gap-4 rounded-2xl border bg-white px-4 py-4 text-left shadow-sm transition-all duration-300 sm:px-5 sm:py-5 ${
                      hasAdvisorId
                        ? "border-[#E7F1E3] hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:shadow-md"
                        : "cursor-not-allowed border-[#E7F1E3] opacity-60"
                    }`}
                  >
                    {/* ==================================================
                        AVATAR
                    ================================================== */}

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2F8F4E] text-xs font-bold tracking-wide text-white shadow-md transition group-hover:bg-[#176B3A]">
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
                          <h3 className="text-sm font-semibold text-[#176B3A]">
                            Advisor
                          </h3>

                          <p className="mt-0.5 truncate font-mono text-[11px] text-[#173B28]/55">
                            {conversation.advisor_id ||
                              "Advisor ID unavailable"}
                          </p>
                        </div>

                        <span className="shrink-0 text-[11px] text-[#173B28]/50">
                          {getLastMessageTime(conversation)}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm text-[#173B28]/70">
                        {getLastMessage(conversation)}
                      </p>
                    </div>

                    {/* ==================================================
                        ARROW
                    ================================================== */}

                    <svg
                      className="h-5 w-5 shrink-0 text-[#2F8F4E] transition-transform group-hover:translate-x-1 group-hover:text-[#176B3A]"
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

        <footer className="mt-12 border-t border-[#2F8F4E]/20 pt-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-xs font-bold text-[#2F8F4E]">
              ✓
            </span>

            <p className="text-xs leading-6 text-[#173B28]/60">
              SafeLink administration · Advisor conversations are handled
              securely through the administrator interface.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}