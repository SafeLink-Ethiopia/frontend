import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  MessageCircle,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

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
        setError("");

        const { conversations } =
          await getMyConversations(token);

        setConversations((current) =>
          JSON.stringify(current) === JSON.stringify(conversations)
            ? current
            : conversations,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Could not load conversations.",
        );
      } finally {
        setLoading(false);
      }
    }

    load();

    const interval = window.setInterval(load, 5000);

    return () => window.clearInterval(interval);
  }, [token, navigate]);

  /*
   * Dashboard statistics
   */
  const totalConversations = conversations.length;

  const urgentConversations = conversations.filter(
    (conversation) => conversation.urgent,
  ).length;

  const activeConversations = conversations.filter(
    (conversation) => conversation.messages.length > 0,
  ).length;

  const waitingConversations = conversations.filter(
    (conversation) => conversation.messages.length === 0,
  ).length;

  return (
    <section className="min-h-screen bg-[#f7f5f6] px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3e1919]">
          Advisor Dashboard
        </h1>

        <p className="mt-2 text-[#a79093]">
          Welcome back. Here is an overview of your
          support sessions.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl border border-[#a79093]/30 bg-[#f0e2d6] px-5 py-4 text-[#3e1919]">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

        {/* Total */}
        <StatCard
          icon={<MessageCircle size={22} />}
          title="Total Sessions"
          value={totalConversations}
        />

        {/* Active */}
        <StatCard
          icon={<Clock size={22} />}
          title="Active Sessions"
          value={activeConversations}
        />

        {/* Urgent */}
        <StatCard
          icon={<AlertTriangle size={22} />}
          title="Urgent"
          value={urgentConversations}
          urgent
        />

        {/* Waiting */}
        <StatCard
          icon={<CheckCircle size={22} />}
          title="Waiting"
          value={waitingConversations}
        />

      </div>

      {/* Conversations */}
      <div className="mt-8">

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#3e1919]">
              Recent Conversations
            </h2>

            <p className="mt-1 text-sm text-[#a79093]">
              Sessions that may need your attention.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/advisor/messages")}
            className="flex items-center gap-2 rounded-full border border-[#a79093]/40 px-4 py-2 text-sm font-medium text-[#3e1919] transition hover:bg-[#f0e2d6]"
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[#f0e2d6] bg-white p-8 text-center">
            <p className="text-[#a79093]">
              Loading conversations...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          conversations.length === 0 && (
            <div className="rounded-2xl border border-[#f0e2d6] bg-white p-8 text-center">
              <MessageCircle
                size={35}
                className="mx-auto mb-3 text-[#a79093]"
              />

              <p className="text-[#3e1919]">
                No conversations yet.
              </p>

              <p className="mt-1 text-sm text-[#a79093]">
                New support sessions will appear here.
              </p>
            </div>
          )}

        {/* Conversation list */}
        {!loading && conversations.length > 0 && (
          <div className="space-y-3">

            {conversations.slice(0, 8).map((conv) => {
              const lastMessage =
                conv.messages[
                  conv.messages.length - 1
                ];

              return (
                <button
                  key={conv.conversation_id}
                  type="button"
                  onClick={() =>
                    navigate(
                      `/advisor/messages/${conv.conversation_id}`,
                    )
                  }
                  className="flex w-full items-center justify-between rounded-2xl border border-[#f0e2d6] bg-white px-5 py-5 text-left transition hover:bg-[#f0e2d6]/60 hover:shadow-md"
                >

                  <div className="min-w-0">

                    {/* Session + urgent */}
                    <div className="flex items-center gap-2">

                      <p className="font-semibold text-[#3e1919]">
                        Session{" "}
                        {conv.session_id.slice(0, 8)}...
                      </p>

                      {conv.urgent && (
                        <span className="flex items-center gap-1 rounded-full bg-[#3e1919]/10 px-2 py-1 text-[11px] font-semibold text-[#3e1919]">
                          <AlertTriangle size={11} />
                          Urgent
                        </span>
                      )}

                    </div>

                    {/* Last message */}
                    <p className="mt-2 truncate text-sm text-[#a79093]">
                      {lastMessage
                        ? lastMessage.text
                        : "No messages yet"}
                    </p>

                  </div>

                  <div className="ml-4 flex shrink-0 items-center gap-2 text-sm font-semibold text-[#3e1919]">
                    Open
                    <ArrowRight size={16} />
                  </div>

                </button>
              );
            })}

          </div>
        )}

      </div>

    </section>
  );
}


/*
 * Dashboard statistic card
 */
type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: number;
  urgent?: boolean;
};

function StatCard({
  icon,
  title,
  value,
  urgent = false,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#f0e2d6] bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            urgent
              ? "bg-[#3e1919]/10 text-[#3e1919]"
              : "bg-[#f0e2d6] text-[#3e1919]"
          }`}
        >
          {icon}
        </div>

        <span className="text-3xl font-bold text-[#3e1919]">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm text-[#a79093]">
        {title}
      </p>

    </div>
  );
}