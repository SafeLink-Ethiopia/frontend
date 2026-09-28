import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, LogOut, User } from "lucide-react";
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

  const [conversations, setConversations] = useState<Conversation[]>([]);
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
          "http://localhost:5000/api/advisor-admin-conversations",
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

  function handleLogout() {
    localStorage.removeItem("advisor_token");
    localStorage.removeItem("advisor_profile");
    navigate("/advisor/login");
  }

  return (
    <main className="min-h-screen bg-[#33484D]">
      <header className="flex items-center justify-between bg-[#5C838A] px-6 py-4">
        <div className="flex items-center gap-3">
          <MessageCircle size={21} className="text-white" />

          <h1 className="text-lg font-semibold text-white">Admin Messages</h1>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/advisor/dashboard")}
            className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => navigate("/advisor/profile")}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            <User size={15} />
            Profile
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-5 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white">
            Messages with Admin
          </h2>

          <p className="mt-1 text-sm text-white/60">
            Communicate privately with the SafeLink administrator.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl bg-[#F4F7F7] p-6 text-center text-sm text-[#6B7A7C]">
            Loading messages...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-[#D96C6C]/30 bg-[#D96C6C]/10 p-5 text-center text-sm text-[#F3B9B9]">
            {error}
          </div>
        )}

        {!loading && !error && conversations.length === 0 && (
          <div className="rounded-2xl bg-[#F4F7F7] p-8 text-center">
            <MessageCircle size={36} className="mx-auto mb-3 text-[#5C838A]" />

            <h3 className="font-semibold text-[#33484D]">No messages yet</h3>

            <p className="mt-1 text-sm text-[#6B7A7C]">
              Your conversation with the administrator will appear here.
            </p>
          </div>
        )}

        {!loading && conversations.length > 0 && (
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const lastMessage =
                conversation.messages[conversation.messages.length - 1];

              return (
                <button
                  key={conversation.conversation_id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/advisor/messages/${conversation.conversation_id}`,
                    )
                  }
                  className="w-full rounded-2xl bg-[#F4F7F7] px-5 py-5 text-left shadow transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#5C838A]/15 text-[#5C838A]">
                        <MessageCircle size={20} />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold text-[#33484D]">
                          SafeLink Admin
                        </p>

                        <p className="mt-1 text-xs text-[#6B7A7C]">
                          {conversation.admin_id}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 text-xs text-[#5C838A]">
                      Open →
                    </span>
                  </div>

                  <div className="mt-4 border-t border-[#33484D]/10 pt-3">
                    <p className="truncate text-sm text-[#6B7A7C]">
                      {lastMessage
                        ? `${lastMessage.sender === "advisor" ? "You: " : "Admin: "}${lastMessage.text}`
                        : "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
