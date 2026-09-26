import { useEffect, useState } from "react";
import { getUserConversations, type Conversation } from "../api/medicalApi";

interface UserDashboardProps {
  safelinkId: string;
  onOpenConversation?: (conversationId: string) => void;
}

function UserDashboard({ safelinkId, onOpenConversation }: UserDashboardProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConversations() {
      try {
        setLoading(true);

        const data = await getUserConversations(safelinkId);
        setConversations(data);
      } catch (error) {
        console.error("Failed to load conversations:", error);
      } finally {
        setLoading(false);
      }
    }

    if (safelinkId) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [safelinkId]);

  const getAdvisorInfo = (type: Conversation["advisor_type"]) => {
    switch (type) {
      case "medical":
        return {
          label: "Medical Support",
          icon: "🩺",
          description: "Medical guidance and support",
        };

      case "legal":
        return {
          label: "Legal Support",
          icon: "⚖️",
          description: "Legal information and guidance",
        };

      case "psychological":
        return {
          label: "Psychological Support",
          icon: "💚",
          description: "Emotional and psychological support",
        };

      case "general":
        return {
          label: "General Support",
          icon: "🤝",
          description: "General support and guidance",
        };

      default:
        return {
          label: "Support",
          icon: "💬",
          description: "SafeLink support",
        };
    }
  };

  const getLatestMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return "No messages yet";
    }

    return conversation.messages[conversation.messages.length - 1].text;
  };

  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    const now = new Date();

    const sameDay = messageDate.toDateString() === now.toDateString();

    if (sameDay) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return messageDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f3] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#d9efe5] border-t-[#239b78]" />
          <p className="text-[#12304a] font-medium">
            Loading your conversations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#12304a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d9efe5] rounded-full blur-3xl opacity-70" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#dceef4] rounded-full blur-3xl opacity-70" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#e6eee9] bg-white/80 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-5 py-5">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#239b78] to-[#1685a5] shadow-md">
                  <span className="text-xl text-white">♡</span>
                </div>

                <div>
                  <p className="text-lg font-bold">SafeLink</p>
                  <p className="text-[9px] font-semibold tracking-[0.3em] text-[#239b78]">
                    ETHIOPIA
                  </p>
                </div>
              </div>

              {/* Privacy indicator */}
              <div className="hidden sm:flex items-center gap-2 rounded-full border border-[#d9efe5] bg-[#f5fbf8] px-4 py-2">
                <span className="text-sm">🔒</span>
                <span className="text-xs font-medium text-[#126d85]">
                  Private Session
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="mx-auto max-w-6xl px-5 py-10">
          {/* Heading */}
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#e9f7f1] px-4 py-2 text-xs font-semibold text-[#239b78]">
              <span>🔒</span>
              Your private space
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your Conversations
            </h1>

            <p className="mt-3 max-w-2xl text-gray-600">
              View and manage your conversations with SafeLink advisors. Your
              conversations are connected to your private SafeLink session.
            </p>

            <div className="mt-4 inline-flex items-center rounded-lg bg-white px-3 py-2 text-xs text-gray-500 shadow-sm">
              <span className="mr-2">ID</span>
              <span className="font-mono font-medium text-[#126d85]">
                {safelinkId}
              </span>
            </div>
          </div>

          {/* Empty state */}
          {conversations.length === 0 ? (
            <div className="rounded-3xl border border-[#e6eee9] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9f7f1] text-3xl">
                💬
              </div>

              <h2 className="mt-5 text-xl font-bold text-[#12304a]">
                No conversations yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                When you connect with a SafeLink advisor, your conversation will
                appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {conversations.map((conversation) => {
                const advisor = getAdvisorInfo(conversation.advisor_type);

                return (
                  <div
                    key={conversation.conversation_id}
                    className="group rounded-3xl border border-[#e6eee9] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Top */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f7f1] text-xl">
                          {advisor.icon}
                        </div>

                        <div>
                          <h2 className="font-bold text-[#12304a]">
                            {advisor.label}
                          </h2>

                          <p className="mt-1 text-xs text-gray-500">
                            {advisor.description}
                          </p>
                        </div>
                      </div>

                      {conversation.urgent && (
                        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                          Urgent
                        </span>
                      )}
                    </div>

                    {/* Message preview */}
                    <div className="mt-5 rounded-2xl bg-[#fafcfb] p-4">
                      <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                        {getLatestMessage(conversation)}
                      </p>
                    </div>

                    {/* Bottom */}
                    <div className="mt-5 flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-400">
                        {formatDate(conversation.updated_at)}
                      </span>

                      <button
                        onClick={() =>
                          onOpenConversation?.(conversation.conversation_id)
                        }
                        className="rounded-xl bg-[#126d85] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d5d73]"
                      >
                        Open Conversation →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default UserDashboard;
