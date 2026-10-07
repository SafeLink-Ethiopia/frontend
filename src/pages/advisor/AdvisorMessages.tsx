import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowRight } from "lucide-react";
import axios from "axios";

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

export default function AdvisorMessages() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("advisor_token") ?? "";

  useEffect(() => {
    if (!token) {
      navigate("/advisor/login");
      return;
    }

    async function loadConversations() {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get<ConversationsResponse>(
          "http://localhost:5000/api/advisor/admin-conversations",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setConversations(response.data.conversations);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              "Could not load admin conversations.",
          );
        } else {
          setError("Could not load admin conversations.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [token, navigate]);

  return (
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
        {/* PAGE HEADER */}
        <header className="border-b border-[#a79093]/30 pb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0e2d6] text-[#3e1919]">
              <MessageCircle size={21} />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
                Communication
              </p>

              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#3e1919] sm:text-3xl">
                Messages with Admin
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-[#a79093]">
                Communicate privately with the SafeLink
                administrator and manage your support conversations.
              </p>
            </div>
          </div>
        </header>

        {/* LOADING */}
        {loading && (
          <div className="border-b border-[#a79093]/30 py-12 text-center">
            <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-[#a79093]/30 border-t-[#3e1919]" />

            <p className="text-sm text-[#a79093]">
              Loading messages...
            </p>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-8 border-l-4 border-[#3e1919] bg-[#f0e2d6] px-5 py-4">
            <p className="text-sm font-medium text-[#3e1919]">
              {error}
            </p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && conversations.length === 0 && (
          <div className="border-b border-[#a79093]/30 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e2d6] text-[#3e1919]">
              <MessageCircle size={24} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-[#3e1919]">
              No messages yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#a79093]">
              Your conversation with the administrator will appear
              here when you start communicating with the SafeLink
              team.
            </p>
          </div>
        )}

        {/* CONVERSATIONS */}
        {!loading && conversations.length > 0 && (
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                Conversations
              </p>

              <span className="text-xs text-[#a79093]">
                {conversations.length}{" "}
                {conversations.length === 1
                  ? "conversation"
                  : "conversations"}
              </span>
            </div>

            <div className="border-t border-[#a79093]/30">
              {conversations.map((conversation) => {
                const lastMessage =
                  conversation.messages[
                    conversation.messages.length - 1
                  ];

                return (
                  <button
                    key={conversation.conversation_id}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/advisor/messages/${conversation.conversation_id}`,
                      )
                    }
                    className="group w-full border-b border-[#a79093]/30 py-5 text-left transition hover:bg-[#f0e2d6]/60"
                  >
                    <div className="flex items-center gap-4">
                      {/* ICON */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f0e2d6] text-[#3e1919]">
                        <MessageCircle size={19} />
                      </div>

                      {/* CONVERSATION INFO */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-[#3e1919]">
                              SafeLink Admin
                            </p>

                            <p className="mt-0.5 truncate text-xs text-[#a79093]">
                              {conversation.admin_id}
                            </p>
                          </div>

                          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#a79093] transition group-hover:text-[#3e1919]">
                            Open
                            <ArrowRight
                              size={14}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </span>
                        </div>

                        {/* LAST MESSAGE */}
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a79093]">
                            Latest
                          </span>

                          <span className="h-1 w-1 rounded-full bg-[#a79093]" />

                          <p className="min-w-0 truncate text-sm text-[#a79093]">
                            {lastMessage
                              ? `${
                                  lastMessage.sender === "advisor"
                                    ? "You: "
                                    : "Admin: "
                                }${lastMessage.text}`
                              : "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PRIVACY NOTE */}
        {!loading && !error && conversations.length > 0 && (
          <div className="mt-8 flex items-start gap-3 border-l-2 border-[#3e1919] bg-[#f0e2d6] px-4 py-4">
            <span className="text-base">🔒</span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#3e1919]">
                Private communication
              </p>

              <p className="mt-1 text-xs leading-5 text-[#3e1919]/70">
                Your conversations with the SafeLink administrator
                are kept within the support system.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}