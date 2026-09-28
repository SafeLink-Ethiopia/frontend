import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, LogOut, User } from "lucide-react";
import { getMyConversations } from "../api/advisorPortalApi";
import type { Conversation } from "../types/advisor";

export default function AdvisorDashboardPage() {
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

    async function load() {
      try {
        setLoading(true);
        const { conversations } = await getMyConversations(token);
        setConversations(conversations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load conversations.");
      } finally {
        setLoading(false);
      }
    }

    load();
    const interval = window.setInterval(load, 5000); // refresh queue periodically
    return () => window.clearInterval(interval);
  }, [token, navigate]);

  function handleLogout() {
    localStorage.removeItem("advisor_token");
    localStorage.removeItem("advisor_profile");
    navigate("/advisor/login");
  }

  return (
    <main className="min-h-screen bg-[#33484D]">
      <header className="flex items-center justify-between bg-[#5C838A] px-6 py-4">
        <h1 className="text-lg font-semibold text-white">My Conversations</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/advisor/profile")}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            <User size={15} /> Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white hover:bg-white/10"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-2xl px-5 py-6">
        {loading && <p className="text-center text-white/70">Loading...</p>}
        {error && <p className="text-center text-[#F3B9B9]">{error}</p>}

        {!loading && conversations.length === 0 && (
          <p className="text-center text-white/60">No conversations yet.</p>
        )}

        <div className="space-y-3">
          {conversations.map((conv) => {
            const lastMessage = conv.messages[conv.messages.length - 1];
            return (
              <button
                key={conv.conversation_id}
                onClick={() => navigate(`/advisor/conversation/${conv.conversation_id}`)}
                className="flex w-full items-center justify-between rounded-2xl bg-[#F4F7F7] px-5 py-4 text-left shadow transition hover:shadow-md"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[#33484D]">
                      Session {conv.session_id.slice(0, 8)}...
                    </p>
                    {conv.urgent && (
                      <span className="flex items-center gap-1 rounded-full bg-[#D96C6C]/15 px-2 py-0.5 text-[11px] font-semibold text-[#D96C6C]">
                        <AlertTriangle size={11} /> Urgent
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-sm text-[#6B7A7C]">
                    {lastMessage ? lastMessage.text : "No messages yet"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
