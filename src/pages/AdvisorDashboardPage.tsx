// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { AlertTriangle, LogOut, MessageCircle, User } from "lucide-react";
// import { getMyConversations } from "../api/advisorPortalApi";
// import type { Conversation } from "../types/advisor";

// export default function AdvisorDashboardPage() {
//   const navigate = useNavigate();

//   const [conversations, setConversations] = useState<Conversation[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const token = localStorage.getItem("advisor_token") ?? "";

//   useEffect(() => {
//     if (!token) {
//       navigate("/advisor/login");
//       return;
//     }

//     async function load() {
//       try {
//         setLoading(true);
//         setError("");

//         const { conversations } = await getMyConversations(token);

//         setConversations(conversations);
//       } catch (err) {
//         setError(
//           err instanceof Error ? err.message : "Could not load conversations.",
//         );
//       } finally {
//         setLoading(false);
//       }
//     }

//     load();

//     const interval = window.setInterval(load, 5000);

//     return () => window.clearInterval(interval);
//   }, [token, navigate]);

//   function handleLogout() {
//     localStorage.removeItem("advisor_token");
//     localStorage.removeItem("advisor_profile");

//     navigate("/advisor/login");
//   }

//   return (
//     <main className="min-h-screen bg-[#33484D]">
//       {/* Header */}
//       <header className="flex items-center justify-between bg-[#5C838A] px-6 py-4">
//         <h1 className="text-lg font-semibold text-white">My Conversations</h1>

//         <div className="flex items-center gap-2">
//           {/* Messages */}
//           <button
//             type="button"
//             onClick={() => navigate("/advisor/messages")}
//             className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
//           >
//             <MessageCircle size={15} />
//             Messages
//           </button>

//           {/* Profile */}
//           <button
//             type="button"
//             onClick={() => navigate("/advisor/profile")}
//             className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
//           >
//             <User size={15} />
//             Profile
//           </button>

//           {/* Logout */}
//           <button
//             type="button"
//             onClick={handleLogout}
//             className="flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
//           >
//             <LogOut size={15} />
//             Logout
//           </button>
//         </div>
//       </header>

//       {/* Conversations */}
//       {/* <section className="mx-auto max-w-2xl px-5 py-6">
//         {loading && <p className="text-center text-white/70">Loading...</p>}

//         {error && <p className="text-center text-[#F3B9B9]">{error}</p>}

//         {!loading && conversations.length === 0 && (
//           <p className="text-center text-white/60">No conversations yet.</p>
//         )} */}

//         {/* <div className="space-y-3">
//           {conversations.map((conv) => {
//             const lastMessage = conv.messages[conv.messages.length - 1];

//             return (
//               <button
//                 key={conv.conversation_id}
//                 type="button"
//                 onClick={() =>
//                   navigate(`/advisor/conversation/${conv.conversation_id}`)
//                 }
//                 className="flex w-full items-center justify-between rounded-2xl bg-[#F4F7F7] px-5 py-4 text-left shadow transition hover:shadow-md"
//               >
//                 <div className="min-w-0">
//                   <div className="flex items-center gap-2">
//                     <p className="font-semibold text-[#33484D]">
//                       Session {conv.session_id.slice(0, 8)}...
//                     </p>

//                     {conv.urgent && (
//                       <span className="flex items-center gap-1 rounded-full bg-[#D96C6C]/15 px-2 py-0.5 text-[11px] font-semibold text-[#D96C6C]">
//                         <AlertTriangle size={11} />
//                         Urgent
//                       </span>
//                     )}
//                   </div>

//                   <p className="mt-1 truncate text-sm text-[#6B7A7C]">
//                     {lastMessage ? lastMessage.text : "No messages yet"}
//                   </p>
//                 </div>

//                 <span className="ml-4 shrink-0 text-xs font-semibold text-[#5C838A]">
//                   Open →
//                 </span>
//               </button>
//             );
//           })}
//         </div> */}
//       {/* </section> */}
//     </main>
//   );
// }


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
    (conversation) =>
      conversation.messages.length > 0,
  ).length;

  const waitingConversations =
    conversations.filter(
      (conversation) => conversation.messages.length === 0,
    ).length;

  return (
    <section className="min-h-screen px-8 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Advisor Dashboard
        </h1>

        <p className="mt-2 text-white/60">
          Welcome back. Here is an overview of your
          support sessions.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-xl bg-[#D96C6C]/15 px-5 py-4 text-[#F3B9B9]">
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
            <h2 className="text-xl font-semibold text-white">
              Recent Conversations
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Sessions that may need your attention.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/advisor/messages")}
            className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            View all
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl bg-white/10 p-8 text-center">
            <p className="text-white/60">
              Loading conversations...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          conversations.length === 0 && (
            <div className="rounded-2xl bg-white/10 p-8 text-center">
              <MessageCircle
                size={35}
                className="mx-auto mb-3 text-white/40"
              />

              <p className="text-white/70">
                No conversations yet.
              </p>

              <p className="mt-1 text-sm text-white/40">
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
                  className="flex w-full items-center justify-between rounded-2xl bg-[#F4F7F7] px-5 py-5 text-left transition hover:bg-white hover:shadow-lg"
                >

                  <div className="min-w-0">

                    {/* Session + urgent */}
                    <div className="flex items-center gap-2">

                      <p className="font-semibold text-[#33484D]">
                        Session{" "}
                        {conv.session_id.slice(0, 8)}...
                      </p>

                      {conv.urgent && (
                        <span className="flex items-center gap-1 rounded-full bg-[#D96C6C]/15 px-2 py-1 text-[11px] font-semibold text-[#D96C6C]">
                          <AlertTriangle size={11} />
                          Urgent
                        </span>
                      )}

                    </div>

                    {/* Last message */}
                    <p className="mt-2 truncate text-sm text-[#6B7A7C]">
                      {lastMessage
                        ? lastMessage.text
                        : "No messages yet"}
                    </p>

                  </div>

                  <div className="ml-4 flex shrink-0 items-center gap-2 text-sm font-semibold text-[#5C838A]">
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
    <div className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm">

      <div className="flex items-center justify-between">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            urgent
              ? "bg-[#D96C6C]/15 text-[#F3B9B9]"
              : "bg-[#19A7A0]/15 text-[#6ED8D2]"
          }`}
        >
          {icon}
        </div>

        <span className="text-3xl font-bold text-white">
          {value}
        </span>

      </div>

      <p className="mt-4 text-sm text-white/60">
        {title}
      </p>

    </div>
  );
}