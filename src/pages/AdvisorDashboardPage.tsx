import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

import { getMyConversations } from "../api/advisorPortalApi";
import type { Conversation } from "../types/advisor";

type MessageSender = "user" | "admin";

type RecentMessageItem = {
  conversation: Conversation;
  message: Conversation["messages"][number];
};

const motivationalMessages = [
  {
    label: "A little encouragement for today",
    headline:
      "You don’t have to solve everything at once. Being present is a meaningful place to start.",
    body:
      "Listen without rushing, respond with care, and help each person find a next step that feels manageable.",
  },
  {
    label: "A reminder to pause",
    headline:
      "Sometimes, feeling heard is the first step toward feeling hopeful.",
    body:
      "Give people room to share their story. A thoughtful response can make a difficult moment feel less lonely.",
  },
  {
    label: "Care in every conversation",
    headline:
      "Small acts of understanding can make a lasting difference.",
    body:
      "Be patient with every question, respect each person’s pace, and meet uncertainty with kindness.",
  },
  {
    label: "One conversation at a time",
    headline:
      "You don’t need every answer to offer someone a little clarity.",
    body:
      "Stay curious, keep your guidance practical, and work together toward the next helpful step.",
  },
  {
    label: "Thank you for showing up",
    headline:
      "Your patience and attention are part of the support you provide.",
    body:
      "Take each conversation as it comes. Listen carefully and treat every person with dignity.",
  },
] as const;

export default function AdvisorDashboardPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [motivationIndex, setMotivationIndex] = useState(0);

  const token = localStorage.getItem("advisor_token") ?? "";

  // Change the hero message every minute.
  useEffect(() => {
    const interval = window.setInterval(() => {
      setMotivationIndex((current) => (current + 1) % motivationalMessages.length);
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/advisor/login", { replace: true });
      return;
    }

    let cancelled = false;

    async function loadConversations() {
      try {
        const result = await getMyConversations(token);

        if (cancelled) return;

        setError("");
        setConversations((current) =>
          JSON.stringify(current) === JSON.stringify(result.conversations)
            ? current
            : result.conversations,
        );
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Could not load conversations. Please try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadConversations();

    const interval = window.setInterval(() => {
      void loadConversations();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [token, navigate]);

  /*
   * Show the most recent non-deleted message from each requested sender.
   * This uses the messages returned by the existing conversation API.
   */
  const getRecentMessages = (sender: MessageSender): RecentMessageItem[] =>
    conversations
      .flatMap((conversation) => {
        const message = [...conversation.messages]
          .reverse()
          .find(
            (item) =>
              !item.deleted && String(item.sender).toLowerCase() === sender,
          );

        return message ? [{ conversation, message }] : [];
      })
      // The API already supplies the advisor's conversations; keep its order
      // rather than depending on timestamp fields that may not exist on messages.
      .slice(0, 5);

  const recentUserMessages = getRecentMessages("user");
  const recentAdminMessages = getRecentMessages("admin");
  const currentMotivation = motivationalMessages[motivationIndex];

  const openUserConversations = () => {
    // Matches the existing "User Conversations" item in AdvisorSidebar.
    navigate("/advisor");
  };

  const openAdminChat = () => {
    // Matches the existing "Admin Chat" item in AdvisorSidebar.
    navigate("/advisor/messages");
  };

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-9">
        {/* Main page heading */}
        <header className="mb-6 sm:mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
            Your support workspace
          </p>
          <h1 className="mt-2 max-w-4xl text-2xl font-bold leading-tight tracking-tight text-[#173B28] sm:text-3xl lg:text-[2.15rem]">
            Welcome back — someone may be waiting to be heard.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#607568] sm:text-base sm:leading-7">
            Every conversation is a chance to help someone take their next step.
            Start with listening, and take each conversation one at a time.
          </p>
        </header>

        {/* Rotating motivational hero — no illustration on the right */}
        <section className="relative mb-7 overflow-hidden rounded-[1.75rem] bg-[#E7F1E3] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full border border-[#2F8F4E]/10 sm:-right-4 sm:-top-16 sm:h-56 sm:w-56"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 right-20 h-32 w-32 rounded-full bg-white/30 sm:right-32 sm:h-36 sm:w-36"
          />

          <div
            key={currentMotivation.headline}
            aria-live="polite"
            className="relative max-w-3xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#176B3A]">
              {currentMotivation.label}
            </p>
            <h2 className="mt-4 max-w-3xl font-serif text-2xl italic leading-snug tracking-tight text-[#173B28] sm:text-3xl sm:leading-snug lg:text-[2.2rem]">
              {currentMotivation.headline}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#607568] sm:text-base sm:leading-7">
              {currentMotivation.body}
            </p>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={openUserConversations}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#176B3A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2F8F4E] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2 focus:ring-offset-[#E7F1E3] sm:w-auto"
              >
                Go to conversations
                <ArrowRight size={16} />
              </button>

              <div className="flex items-center gap-2" aria-label={`Message ${motivationIndex + 1} of ${motivationalMessages.length}`}>
                {motivationalMessages.map((message, index) => (
                  <span
                    key={message.label}
                    aria-hidden="true"
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === motivationIndex
                        ? "w-6 bg-[#2F8F4E]"
                        : "w-1.5 bg-[#2F8F4E]/25"
                    }`}
                  />
                ))}
                <span className="ml-1 text-[11px] text-[#607568]">
                  A new thought every minute
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy reminder: plain text, not a card */}
        <aside className="mb-8 flex max-w-5xl items-start gap-3 border-l-2 border-[#2F8F4E] py-1 pl-4 sm:mb-10 sm:gap-4 sm:pl-5">
          <ShieldCheck
            size={21}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-[#2F8F4E]"
          />
          <div>
            <h2 className="font-semibold text-[#173B28]">
              A reminder about the people behind each conversation
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[#607568]">
              Conversations are identified with private session IDs rather than
              names. Messages may still include sensitive details, so handle
              them carefully, protect each person’s privacy, and offer the same
              care you would give in person.
            </p>
          </div>
        </aside>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-[#D5E5D1] bg-[#E7F1E3] px-4 py-3 text-sm text-[#173B28] sm:px-5"
          >
            {error}
          </div>
        )}

        {/* Separate recent message lists */}
        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-[#173B28] sm:text-2xl">
              Recent messages
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#607568]">
              The latest user and administrator messages, shown separately.
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#DCE8D9] bg-white px-5 py-8">
              <div className="flex items-center justify-center gap-3 text-sm text-[#607568]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#DCE8D9] border-t-[#2F8F4E]" />
                Loading conversations...
              </div>
            </div>
          ) : (
            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
              <RecentMessageSection
                title="Recent user messages"
                description="Messages from people reaching out for support."
                items={recentUserMessages}
                emptyMessage="There are no user messages to show yet."
                onOpenMessages={openUserConversations}
              />

              <RecentMessageSection
                title="Recent admin messages"
                description="Messages sent by an administrator in a conversation."
                items={recentAdminMessages}
                emptyMessage="There are no admin messages to show yet."
                onOpenMessages={openAdminChat}
              />
            </div>
          )}
        </section>

        <footer className="mt-8 border-t border-[#DCE8D9] pt-4 text-xs leading-5 text-[#7B8F82]">
          SafeLink · Private Support
        </footer>
      </div>
    </main>
  );
}

type RecentMessageSectionProps = {
  title: string;
  description: string;
  items: RecentMessageItem[];
  emptyMessage: string;
  onOpenMessages: () => void;
};

function RecentMessageSection({
  title,
  description,
  items,
  emptyMessage,
  onOpenMessages,
}: RecentMessageSectionProps) {
  return (
    <section className="min-w-0">
      <div className="mb-3">
        <h3 className="font-semibold text-[#173B28]">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#7B8F82]">{description}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D5E5D1] px-4 py-6">
          <MessageCircle size={19} className="mb-2 text-[#2F8F4E]" />
          <p className="text-sm text-[#607568]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#DCE8D9] bg-white">
          {items.map(({ conversation, message }, index) => (
            <button
              key={`${conversation.conversation_id}-${String(message.sender)}-${index}`}
              type="button"
              onClick={onOpenMessages}
              aria-label={`Open messages for session ${conversation.session_id}`}
              className={`group flex w-full min-w-0 items-start gap-3 px-4 py-4 text-left transition hover:bg-[#F7FAF5] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2F8F4E] sm:px-5 ${
                index < items.length - 1 ? "border-b border-[#E4ECE2]" : ""
              }`}
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E7F1E3] text-[#176B3A]">
                <MessageCircle size={17} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-[#173B28]">
                  Session {conversation.session_id.slice(0, 8)}...
                </span>
                <span className="mt-1 block break-words text-sm leading-5 text-[#607568]">
                  {message.text || "Message has no text."}
                </span>
              </span>

              <ArrowRight
                size={16}
                className="mt-1 shrink-0 text-[#2F8F4E] transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
