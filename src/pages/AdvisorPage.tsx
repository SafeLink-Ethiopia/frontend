import { useEffect, useState } from "react";
import {
  Conversation,
  getConversation,
  recommendFacility,
  sendAdvisorMessage,
} from "../api/medicalApi";

const REQUESTS_KEY = "safelink_medical_requests";

interface SupportRequest {
  safelink_id: string;
  conversation_id: string;
  created_at: string;
  status: "new" | "opened" | "completed";
}

const facilities = [
  {
    facility_name: "Addis Ababa Care Center",
    location: "Bole, Addis Ababa",
    contact: "+251-11-000-0000",
    notes: "Medical support is available.",
  },
  {
    facility_name: "SafeCare Medical Center",
    location: "Arada, Addis Ababa",
    contact: "+251-11-111-1111",
    notes: "General medical support and referral services.",
  },
  {
    facility_name: "Community Health Support Center",
    location: "Kirkos, Addis Ababa",
    contact: "+251-11-222-2222",
    notes: "Community-based medical support is available.",
  },
];

export default function AdvisorPage() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [error, setError] = useState("");
  const [showFacilities, setShowFacilities] = useState(false);

  function sortRequests(requestList: SupportRequest[]) {
    const statusOrder = {
      new: 0,
      opened: 1,
      completed: 2,
    };

    return [...requestList].sort((a, b) => {
      const statusDifference =
        statusOrder[a.status] - statusOrder[b.status];

      if (statusDifference !== 0) {
        return statusDifference;
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );
    });
  }

  function loadRequests() {
    try {
      const saved = localStorage.getItem(REQUESTS_KEY);

      if (!saved) {
        setRequests([]);
        return;
      }

      const parsed = JSON.parse(saved) as SupportRequest[];

      const cleanedRequests = parsed.filter(
        (request) =>
          request &&
          request.safelink_id &&
          request.conversation_id
      );

      /*
       * Older requests may not have the "completed" status.
       * Keep them working as "opened".
       */
      const normalizedRequests = cleanedRequests.map((request) => ({
        ...request,
        status:
          request.status === "completed"
            ? "completed"
            : request.status === "opened"
              ? "opened"
              : "new",
      }));

      setRequests(sortRequests(normalizedRequests as SupportRequest[]));
    } catch {
      setRequests([]);
    }
  }

  useEffect(() => {
    loadRequests();

    const interval = window.setInterval(loadRequests, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!conversation?.conversation_id) return;

    const interval = window.setInterval(async () => {
      try {
        const fresh = await getConversation(
          conversation.conversation_id
        );

        setConversation(fresh);
      } catch {
        // Keep the current conversation if polling fails.
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [conversation?.conversation_id]);

  function saveRequests(updatedRequests: SupportRequest[]) {
    const sorted = sortRequests(updatedRequests);

    localStorage.setItem(
      REQUESTS_KEY,
      JSON.stringify(sorted)
    );

    setRequests(sorted);
  }

  function markRequestOpened(conversationId: string) {
    const updated = requests.map((request) =>
      request.conversation_id === conversationId
        ? {
            ...request,
            status: "opened" as const,
          }
        : request
    );

    saveRequests(updated);
  }

  function markRequestCompleted(conversationId: string) {
    const updated = requests.map((request) =>
      request.conversation_id === conversationId
        ? {
            ...request,
            status: "completed" as const,
          }
        : request
    );

    saveRequests(updated);
  }

  async function openConversation(request: SupportRequest) {
    try {
      setLoading(true);
      setError("");
      setShowFacilities(false);

      const fresh = await getConversation(
        request.conversation_id
      );

      setConversation(fresh);
      markRequestOpened(request.conversation_id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The conversation could not be opened."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();

    const text = message.trim();

    if (!text || !conversation || sending) return;

    try {
      setSending(true);
      setError("");

      const updated = await sendAdvisorMessage(
        conversation.conversation_id,
        text
      );

      setConversation(updated);
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Your message could not be sent."
      );
    } finally {
      setSending(false);
    }
  }

  async function chooseFacility(
    facility: (typeof facilities)[number]
  ) {
    if (!conversation || recommending) return;

    try {
      setRecommending(true);
      setError("");

      const updated = await recommendFacility(
        conversation.conversation_id,
        facility
      );

      setConversation(updated);

      /*
       * Recommendation means the advisor has finished
       * handling this request.
       *
       * Move the request to "completed", which places it
       * at the bottom of the advisor request queue.
       */
      markRequestCompleted(conversation.conversation_id);

      setShowFacilities(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The facility recommendation could not be sent."
      );
    } finally {
      setRecommending(false);
    }
  }

  function handleBackToRequests() {
    setConversation(null);
    setMessage("");
    setError("");
    setShowFacilities(false);
    loadRequests();
  }

  return (
    <main className="min-h-screen bg-[#123d34] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#123d34]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={
              conversation
                ? handleBackToRequests
                : () => window.history.back()
            }
            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <span className="text-lg">←</span>
            {conversation ? "Back to requests" : "Back"}
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a9cfba]">
              SafeLink
            </p>

            <p className="mt-1 text-sm text-white/60">
              Medical Advisor
            </p>
          </div>

          <div className="rounded-full border border-[#a9cfba]/20 bg-[#a9cfba]/10 px-4 py-2 text-xs font-semibold text-[#c8dfd1]">
            Advisor
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Request list */}
        {!conversation && (
          <div>
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#a9cfba]/15 text-3xl">
                ♡
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Medical Support Requests
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                Review incoming private support requests and
                connect each person with the appropriate help.
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-4xl space-y-4">
              {requests.length === 0 ? (
                <div className="rounded-[2rem] border border-white/10 bg-[#19483e] px-6 py-14 text-center shadow-2xl">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">
                    ✓
                  </div>

                  <h2 className="text-xl font-semibold">
                    No support requests
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    New medical support requests will appear
                    here automatically.
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <button
                    key={request.conversation_id}
                    type="button"
                    onClick={() => openConversation(request)}
                    disabled={loading}
                    className="w-full rounded-[1.5rem] border border-white/10 bg-[#19483e] p-5 text-left shadow-xl transition hover:-translate-y-0.5 hover:border-[#a9cfba]/30 hover:bg-[#1d5045] disabled:cursor-wait disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a9cfba]">
                          Private Session
                        </p>

                        <h2 className="mt-2 text-lg font-semibold">
                          {request.safelink_id}
                        </h2>

                        <p className="mt-1 text-xs text-white/40">
                          {request.conversation_id}
                        </p>
                      </div>

                      <div
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          request.status === "new"
                            ? "bg-[#a9cfba]/15 text-[#c8dfd1]"
                            : request.status === "opened"
                              ? "bg-white/10 text-white/65"
                              : "bg-white/5 text-white/35"
                        }`}
                      >
                        {request.status === "new"
                          ? "New"
                          : request.status === "opened"
                            ? "In progress"
                            : "Completed"}
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
                      <span className="text-xs text-white/40">
                        {new Date(
                          request.created_at
                        ).toLocaleString()}
                      </span>

                      <span className="text-sm font-semibold text-[#a9cfba]">
                        Open →
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Conversation */}
        {conversation && (
          <div className="mx-auto max-w-4xl">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a9cfba]">
                {conversation.advisor_id}
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                Private Support Conversation
              </h1>

              <p className="mt-2 text-sm text-white/50">
                Session: {conversation.session_id}
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#f7f5f1] text-[#565857] shadow-2xl">
              {/* Conversation header */}
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d8f80]">
                    Medical Advisor
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#243c35]">
                    Conversation
                  </h2>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-2 text-xs font-semibold text-[#39705b]">
                  <span className="h-2 w-2 rounded-full bg-[#5f9b7d]" />
                  Active
                </div>
              </div>

              {/* Messages */}
              <div className="max-h-[440px] space-y-4 overflow-y-auto px-6 py-6">
                {conversation.messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-[#7a817e]">
                    No messages yet.
                  </div>
                ) : (
                  conversation.messages.map((msg, index) => (
                    <div
                      key={`${msg.timestamp}-${index}`}
                      className={`flex ${
                        msg.sender === "advisor"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.sender === "advisor"
                            ? "rounded-br-md bg-[#19483e] text-white"
                            : "rounded-bl-md bg-[#e8ece9] text-[#35433e]"
                        }`}
                      >
                        <p className="mb-1 text-[11px] font-semibold opacity-60">
                          {msg.sender === "advisor"
                            ? "You"
                            : "SafeLink User"}
                        </p>

                        <p className="text-sm leading-6">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Recommendation */}
              {conversation.recommendation && (
                <div className="mx-6 mb-6 rounded-2xl border border-[#a9cfba] bg-[#edf6f0] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477661]">
                        Recommended Facility
                      </p>

                      <h3 className="mt-2 text-xl font-semibold text-[#243c35]">
                        {conversation.recommendation.facility_name}
                      </h3>
                    </div>

                    <span className="rounded-full bg-[#dceee3] px-3 py-1.5 text-xs font-semibold text-[#477661]">
                      Completed
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#58665f]">
                    <p>
                      <strong>Location:</strong>{" "}
                      {conversation.recommendation.location}
                    </p>

                    <p>
                      <strong>Contact:</strong>{" "}
                      {conversation.recommendation.contact}
                    </p>

                    <p>
                      <strong>Information:</strong>{" "}
                      {conversation.recommendation.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Message composer */}
              {!conversation.recommendation && (
                <form
                  onSubmit={handleSend}
                  className="border-t border-black/5 bg-[#f0f2ef] p-5"
                >
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(event) =>
                        setMessage(event.target.value)
                      }
                      placeholder="Type a message..."
                      className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-[#35433e] outline-none transition focus:border-[#6f9c86] focus:ring-2 focus:ring-[#a9cfba]/30"
                    />

                    <button
                      type="submit"
                      disabled={!message.trim() || sending}
                      className="rounded-full bg-[#19483e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24594d] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sending ? "..." : "Send"}
                    </button>
                  </div>
                </form>
              )}

              {/* Facility recommendation */}
              {!conversation.recommendation && (
                <div className="border-t border-black/5 px-6 py-5">
                  <button
                    type="button"
                    onClick={() =>
                      setShowFacilities(!showFacilities)
                    }
                    className="w-full rounded-full border border-[#19483e] px-5 py-3 text-sm font-semibold text-[#19483e] transition hover:bg-[#19483e] hover:text-white"
                  >
                    {showFacilities
                      ? "Hide facilities"
                      : "Recommend a facility"}
                  </button>

                  {showFacilities && (
                    <div className="mt-4 space-y-3">
                      {facilities.map((facility) => (
                        <button
                          key={facility.facility_name}
                          type="button"
                          onClick={() =>
                            chooseFacility(facility)
                          }
                          disabled={recommending}
                          className="w-full rounded-2xl border border-black/10 bg-white p-4 text-left transition hover:border-[#6f9c86] hover:bg-[#f5faf7] disabled:opacity-50"
                        >
                          <p className="font-semibold text-[#243c35]">
                            {facility.facility_name}
                          </p>

                          <p className="mt-1 text-sm text-[#68736e]">
                            {facility.location}
                          </p>

                          <p className="mt-1 text-xs text-[#8a928e]">
                            {facility.contact}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-center text-sm text-red-100">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}
