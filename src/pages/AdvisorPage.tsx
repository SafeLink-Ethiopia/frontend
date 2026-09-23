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
  status: "new" | "opened";
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
  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [error, setError] = useState("");
  const [showFacilities, setShowFacilities] = useState(false);

  function loadRequests() {
    try {
      const saved = localStorage.getItem(REQUESTS_KEY);

      if (!saved) {
        setRequests([]);
        return;
      }

      const parsed = JSON.parse(saved) as SupportRequest[];

      setRequests(
        parsed.filter(
          (request) =>
            request &&
            request.safelink_id &&
            request.conversation_id
        )
      );
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
        // Preserve current chat if polling temporarily fails.
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [conversation?.conversation_id]);

  function markRequestOpened(conversationId: string) {
    try {
      const saved = localStorage.getItem(REQUESTS_KEY);

      if (!saved) return;

      const parsed = JSON.parse(saved) as SupportRequest[];

      const updated = parsed.map((request) =>
        request.conversation_id === conversationId
          ? { ...request, status: "opened" as const }
          : request
      );

      localStorage.setItem(
        REQUESTS_KEY,
        JSON.stringify(updated)
      );

      setRequests(updated);
    } catch {
      // Ignore demo queue update failures.
    }
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

  return (
    <main className="min-h-screen bg-[#f7f5f1] text-[#565857]">
      <div className="mx-auto min-h-screen max-w-6xl px-4 py-5 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-black/5 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-sm font-black text-white">
              S
            </div>

            <div>
              <p className="text-sm font-black text-black">
                SafeLink Advisor
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#734B5E]">
                Human support
              </p>
            </div>
          </div>

          <div className="rounded-full bg-[#CFBFF7]/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em] text-[#734B5E]">
            {requests.filter((r) => r.status === "new").length} new
          </div>
        </header>

        {!conversation && (
          <section className="py-10 sm:py-14">
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#734B5E]">
                Incoming requests
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-black sm:text-6xl">
                People asking for help.
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-[#565857]/70 sm:text-base">
                Each request uses only its SafeLink ID. No names,
                phone numbers, or email addresses are shown.
              </p>
            </div>

            {requests.length === 0 ? (
              <div className="rounded-[2rem] border border-black/5 bg-white p-10 text-center shadow-[0_20px_60px_rgba(115,75,94,0.07)]">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#CFBFF7]/40 text-xl">
                  —
                </div>

                <h2 className="mt-5 font-black text-black">
                  No incoming requests
                </h2>

                <p className="mt-2 text-sm text-[#565857]/60">
                  New medical support requests will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {requests.map((request) => (
                  <div
                    key={request.conversation_id}
                    className={`rounded-[1.75rem] border bg-white p-5 shadow-[0_15px_50px_rgba(115,75,94,0.07)] ${
                      request.status === "new"
                        ? "border-[#8B80F9]/30"
                        : "border-black/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          request.status === "new"
                            ? "bg-[#8B80F9]"
                            : "bg-[#CFBFF7]"
                        }`}
                      />

                      {request.status === "new" && (
                        <span className="rounded-full bg-[#CFBFF7]/40 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#734B5E]">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-[#734B5E]">
                      SafeLink ID
                    </p>

                    <p className="mt-1 text-2xl font-black tracking-tight text-black">
                      {request.safelink_id}
                    </p>

                    <p className="mt-2 text-sm text-[#565857]/65">
                      Medical support requested
                    </p>

                    <button
                      onClick={() => openConversation(request)}
                      disabled={loading}
                      className="mt-5 w-full rounded-2xl bg-black px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#565857] disabled:opacity-50"
                    >
                      {loading ? "Opening…" : "Open conversation"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {conversation && (
          <section className="mx-auto max-w-3xl py-8 sm:py-12">
            <button
              onClick={() => {
                setConversation(null);
                setShowFacilities(false);
                loadRequests();
              }}
              className="mb-6 text-xs font-black uppercase tracking-[0.12em] text-[#734B5E]"
            >
              ← Back to requests
            </button>

            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#734B5E]">
                  Active conversation
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-black sm:text-4xl">
                  {requests.find(
                    (request) =>
                      request.conversation_id ===
                      conversation.conversation_id
                  )?.safelink_id || "Private session"}
                </h1>
              </div>

              <span className="rounded-full bg-[#CFBFF7]/40 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#734B5E]">
                Anonymous
              </span>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_25px_70px_rgba(115,75,94,0.1)]">
              <div className="bg-black px-5 py-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#CFBFF7]">
                  Medical support
                </p>

                <p className="mt-1 text-sm font-bold">
                  Human advisor conversation
                </p>
              </div>

              <div className="max-h-[55vh] min-h-[300px] space-y-3 overflow-y-auto p-4 sm:p-6">
                {conversation.messages.length === 0 && (
                  <div className="rounded-2xl bg-[#f7f5f1] p-5 text-sm leading-6 text-[#565857]/70">
                    The person has requested medical support. Send a
                    supportive message to begin.
                  </div>
                )}

                {conversation.messages.map((item, index) => (
                  <div
                    key={`${item.timestamp}-${index}`}
                    className={`flex ${
                      item.sender === "advisor"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        item.sender === "advisor"
                          ? "rounded-br-md bg-[#8B80F9] text-white"
                          : "rounded-bl-md bg-[#f0edf5] text-[#565857]"
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                ))}

                {conversation.recommendation && (
                  <div className="rounded-2xl border border-[#8B80F9]/20 bg-[#CFBFF7]/25 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#734B5E]">
                      Recommendation sent
                    </p>

                    <p className="mt-2 font-black text-black">
                      {conversation.recommendation.facility_name}
                    </p>

                    <p className="mt-1 text-sm text-[#565857]">
                      {conversation.recommendation.location}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-black/5 p-4 sm:p-5">
                <form
                  onSubmit={handleSend}
                  className="flex gap-2"
                >
                  <input
                    value={message}
                    onChange={(event) =>
                      setMessage(event.target.value)
                    }
                    placeholder="Write a supportive response…"
                    className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-[#f7f5f1] px-4 py-3 text-sm text-black outline-none focus:border-[#8B80F9] focus:ring-4 focus:ring-[#8B80F9]/10"
                  />

                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="rounded-2xl bg-black px-4 py-3 text-xs font-black uppercase tracking-wider text-white disabled:opacity-40"
                  >
                    {sending ? "…" : "Send"}
                  </button>
                </form>

                {!conversation.recommendation && (
                  <button
                    onClick={() => setShowFacilities(true)}
                    className="mt-3 w-full rounded-2xl bg-[#8B80F9] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#734B5E]"
                  >
                    Recommend facility
                  </button>
                )}
              </div>
            </div>

            {showFacilities && (
              <div className="mt-5 rounded-[2rem] border border-[#8B80F9]/20 bg-white p-5 shadow-[0_20px_60px_rgba(115,75,94,0.1)]">
                <div className="mb-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#734B5E]">
                    Choose facility
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-black">
                    Select a recommendation
                  </h2>
                </div>

                <div className="space-y-3">
                  {facilities.map((facility) => (
                    <button
                      key={facility.facility_name}
                      onClick={() =>
                        chooseFacility(facility)
                      }
                      disabled={recommending}
                      className="w-full rounded-2xl border border-black/10 bg-[#f7f5f1] p-4 text-left transition hover:border-[#8B80F9] hover:bg-[#CFBFF7]/20 disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black text-black">
                            {facility.facility_name}
                          </p>

                          <p className="mt-1 text-sm text-[#565857]">
                            {facility.location}
                          </p>

                          <p className="mt-2 text-xs font-semibold text-[#734B5E]">
                            {facility.contact}
                          </p>
                        </div>

                        <span className="text-lg text-[#8B80F9]">
                          →
                        </span>
                      </div>

                      <p className="mt-3 text-xs leading-5 text-[#565857]/65">
                        {facility.notes}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {error && (
          <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-[#734B5E]/20 bg-white px-4 py-3 text-sm font-semibold text-[#734B5E] shadow-2xl">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}