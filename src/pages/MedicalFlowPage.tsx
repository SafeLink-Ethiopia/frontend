import { useEffect, useMemo, useState } from "react";
import { Assistant } from "../components/Assistant";
import {
  Conversation,
  getConversation,
  requestMedicalSupport,
  sendUserMessage,
} from "../api/medicalApi";

const SESSION_KEY = "safelink_session";
const CONVERSATION_KEY = "safelink_medical_conversation";
const REQUESTS_KEY = "safelink_medical_requests";

const typingLines = [
  "HELLO. HOW CAN I HELP YOU?",
  "ሰላም። እንዴት ልርዳዎት?",
  "AKKAM. MAAL SIIF GOCHUU NAN DANDA'A?",
];

function useTypingAnimation(lines: string[]) {
  const [lineIndex, setLineIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = lines[lineIndex];

    let delay = 115;

    if (!deleting && displayText.length === current.length) {
      delay = 3200;
    } else if (deleting) {
      delay = 90;
    }

    const timer = window.setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, displayText.length + 1);
        setDisplayText(next);

        if (next === current) {
          setDeleting(true);
        }
      } else {
        const next = current.slice(0, displayText.length - 1);
        setDisplayText(next);

        if (next.length === 0) {
          setDeleting(false);
          setLineIndex((previous) => (previous + 1) % lines.length);
        }
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [displayText, deleting, lineIndex, lines]);

  return displayText;
}

function addAdvisorRequest(conversation: Conversation, safelinkId: string) {
  try {
    const existing = localStorage.getItem(REQUESTS_KEY);
    const requests = existing
      ? JSON.parse(existing)
      : [];

    const alreadyExists = requests.some(
      (request: any) =>
        request.conversation_id === conversation.conversation_id
    );

    if (!alreadyExists) {
      requests.push({
        safelink_id: safelinkId,
        conversation_id: conversation.conversation_id,
        created_at: new Date().toISOString(),
        status: "new",
      });

      localStorage.setItem(
        REQUESTS_KEY,
        JSON.stringify(requests)
      );
    }
  } catch {
    // Demo queue should never break the medical flow.
  }
}

export default function MedicalFlowPage() {
  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const typingText = useTypingAnimation(typingLines);

  const session = useMemo(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const sessionId = session?.safelink_id;

  useEffect(() => {
    if (!conversation?.conversation_id) return;

    const interval = window.setInterval(async () => {
      try {
        const fresh = await getConversation(
          conversation.conversation_id
        );

        setConversation(fresh);

        localStorage.setItem(
          CONVERSATION_KEY,
          JSON.stringify(fresh)
        );
      } catch {
        // Keep the current conversation visible.
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [conversation?.conversation_id]);

  async function startMedicalSupport() {
    if (!sessionId || loading) {
      if (!sessionId) {
        setError("Your private session could not be found.");
      }

      return;
    }

    try {
      setLoading(true);
      setError("");

      const created = await requestMedicalSupport(sessionId);

      setConversation(created);
      setStarted(true);

      localStorage.setItem(
        CONVERSATION_KEY,
        JSON.stringify(created)
      );

      addAdvisorRequest(created, sessionId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We could not connect you to medical support."
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

      const updated = await sendUserMessage(
        conversation.conversation_id,
        text
      );

      setConversation(updated);

      localStorage.setItem(
        CONVERSATION_KEY,
        JSON.stringify(updated)
      );

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f5f1] text-[#565857]">
      <style>{`
        @keyframes safelink-float {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes safelink-pulse {
          0%, 100% {
            box-shadow:
              0 0 0 0 rgba(139,128,249,0.15),
              0 24px 70px rgba(115,75,94,0.10);
          }

          50% {
            box-shadow:
              0 0 0 12px rgba(139,128,249,0),
              0 28px 80px rgba(115,75,94,0.16);
          }
        }

        @keyframes safelink-cursor {
          0%, 45% {
            opacity: 1;
          }

          46%, 100% {
            opacity: 0;
          }
        }

        .safelink-float {
          animation: safelink-float 5s ease-in-out infinite;
        }

        .safelink-pulse {
          animation: safelink-pulse 3.5s ease-in-out infinite;
        }

        .safelink-cursor {
          animation: safelink-cursor 1s steps(1) infinite;
        }
      `}</style>

      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-sm font-black text-white">
              S
            </div>

            <div>
              <p className="text-sm font-black tracking-tight text-black">
                SafeLink
              </p>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#734B5E]">
                Private support
              </p>
            </div>
          </div>

          <div className="rounded-full border border-[#734B5E]/15 bg-white/70 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#734B5E]">
            Private session
          </div>
        </header>

        {!started && (
          <section className="grid min-h-[calc(100vh-90px)] items-center gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#734B5E]/15 bg-[#CFBFF7]/30 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#734B5E]">
                <span className="h-2 w-2 rounded-full bg-[#8B80F9]" />
                A private place to ask for help
              </div>

              <h1 className="min-h-[6.5rem] max-w-3xl text-4xl font-black leading-[0.95] tracking-[-0.05em] text-black sm:min-h-[9rem] sm:text-6xl lg:text-7xl">
                {typingText}
                <span className="safelink-cursor ml-1 inline-block h-[0.8em] w-[3px] bg-[#8B80F9] align-middle" />
              </h1>

              <p className="mt-7 max-w-xl text-sm leading-7 text-[#565857]/75 sm:text-base">
                You can ask SafeLink for guidance without giving your
                name. When you need medical support, we can connect you
                with a human advisor.
              </p>

              <button
                onClick={startMedicalSupport}
                disabled={loading}
                className="mt-8 rounded-2xl bg-black px-7 py-4 text-sm font-black uppercase tracking-[0.13em] text-white shadow-[0_18px_45px_rgba(0,0,0,0.14)] transition duration-300 hover:-translate-y-1 hover:bg-[#565857] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Connecting…" : "I Need Help"}
              </button>

              <div className="mt-7 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold shadow-sm ring-1 ring-black/5">
                  No name required
                </span>

                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold shadow-sm ring-1 ring-black/5">
                  Private session
                </span>

                <span className="rounded-full bg-white px-3 py-2 text-xs font-bold shadow-sm ring-1 ring-black/5">
                  Human guidance
                </span>
              </div>
            </div>

            <div className="safelink-float">
              <div className="safelink-pulse relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/80 p-5 shadow-[0_25px_70px_rgba(115,75,94,0.12)] backdrop-blur-xl sm:p-7">
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#CFBFF7]/50 blur-3xl" />

                <div className="relative">
                  <div className="mb-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#734B5E]">
                      Voice support
                    </p>

                    <h2 className="mt-2 text-xl font-black tracking-tight text-black">
                      Prefer to speak?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-[#565857]/70">
                      Tell SafeLink what you need in your own words.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-[#f7f5f1] p-4 ring-1 ring-[#8B80F9]/15 sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8B80F9] text-lg text-white shadow-lg shadow-[#8B80F9]/20">
                        ◉
                      </div>

                      <div>
                        <p className="text-sm font-black text-black">
                          Voice is ready
                        </p>

                        <p className="text-xs text-[#565857]/60">
                          Tap and speak naturally.
                        </p>
                      </div>
                    </div>

                    
                  </div>

                  <p className="mt-4 text-center text-[11px] leading-5 text-[#565857]/55">
                    SafeLink routes your request. It does not diagnose
                    medical conditions.
                  </p>
                  <div className="relative z-10 min-h-[70px]">
                      <Assistant />
                    </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {started && conversation && (
          <section className="mx-auto max-w-3xl py-10 sm:py-16">
            <div className="mb-7">
              <div className="mb-3 inline-flex rounded-full bg-[#CFBFF7]/40 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#734B5E]">
                Connected to support
              </div>

              <h1 className="text-4xl font-black tracking-[-0.04em] text-black sm:text-5xl">
                You can talk to your advisor here.
              </h1>

              <p className="mt-3 text-sm leading-6 text-[#565857]/70">
                Your conversation stays connected to this private
                session.
              </p>
            </div>

            <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_25px_70px_rgba(115,75,94,0.10)]">
              <div className="flex items-center justify-between border-b border-black/5 bg-black px-5 py-4 text-white">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#CFBFF7]">
                    Human advisor
                  </p>

                  <p className="mt-1 text-sm font-bold">
                    Medical support
                  </p>
                </div>

                <span className="rounded-full bg-[#8B80F9] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider">
                  Private
                </span>
              </div>

              <div className="max-h-[55vh] min-h-[280px] space-y-3 overflow-y-auto p-4 sm:p-6">
                {conversation.messages.length === 0 && (
                  <div className="rounded-2xl bg-[#f7f5f1] p-5 text-sm leading-6 text-[#565857]/70">
                    Your request has been sent. A human advisor can
                    respond here.
                  </div>
                )}

                {conversation.messages.map((item, index) => (
                  <div
                    key={`${item.timestamp}-${index}`}
                    className={`flex ${
                      item.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[84%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        item.sender === "user"
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
                      Your advisor recommended
                    </p>

                    <p className="mt-2 font-black text-black">
                      {conversation.recommendation.facility_name}
                    </p>

                    <p className="mt-1 text-sm text-[#565857]">
                      {conversation.recommendation.location}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-[#565857]">
                      {conversation.recommendation.contact}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#565857]/75">
                      {conversation.recommendation.notes}
                    </p>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="flex gap-2 border-t border-black/5 p-3 sm:p-4"
              >
                <input
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Write to your advisor…"
                  className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-[#f7f5f1] px-4 py-3 text-sm text-black outline-none transition focus:border-[#8B80F9] focus:ring-4 focus:ring-[#8B80F9]/10"
                />

                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="rounded-2xl bg-black px-4 py-3 text-xs font-black uppercase tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {sending ? "…" : "Send"}
                </button>
              </form>
            </div>
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