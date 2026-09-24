import { useEffect, useState } from "react";
import { Assistant } from "../components/Assistant";
import {
  getConversation,
  recommendFacility,
  requestMedicalSupport,
  sendUserMessage,
} from "../api/medicalApi";
import type { Conversation } from "../api/medicalApi";

type Language = "en" | "am" | "om";

const translations = {
  en: {
    title: "Medical Support",
    subtitle:
      "You are in a private support session. Speak with the voice assistant below.",
    privateSession: "Private Session",
    privateText:
      "You can speak freely. You do not need to provide your name.",
    connecting: "Connecting you to a medical advisor...",
    connected: "Connected to a medical advisor",
    conversation: "Your Conversation",
    typeMessage: "Type a message...",
    send: "Send",
    advisor: "Medical Advisor",
    you: "You",
    recommendation: "Recommended Facility",
    location: "Location",
    contact: "Contact",
    notes: "Information",
    connect: "Connect me to an advisor",
    back: "Back",
    quickExit: "Quick Exit",
    waiting: "Waiting for advisor...",
    noConversation:
      "Use the voice assistant to tell us what kind of help you need.",
  },

  am: {
    title: "የሕክምና ድጋፍ",
    subtitle:
      "በግል የድጋፍ ክፍል ውስጥ ነዎት። ከታች ያለውን የድምፅ ረዳት ይጠቀሙ።",
    privateSession: "የግል ክፍለ ጊዜ",
    privateText: "በነፃነት መናገር ይችላሉ። ስምዎን መስጠት አያስፈልግም።",
    connecting: "ከሕክምና አማካሪ ጋር በመገናኘት ላይ...",
    connected: "ከሕክምና አማካሪ ጋር ተገናኝተዋል",
    conversation: "የውይይትዎ",
    typeMessage: "መልዕክት ይጻፉ...",
    send: "ላክ",
    advisor: "የሕክምና አማካሪ",
    you: "እርስዎ",
    recommendation: "የተመከረ ተቋም",
    location: "ቦታ",
    contact: "ስልክ",
    notes: "መረጃ",
    connect: "ከአማካሪ ጋር አገናኙኝ",
    back: "ተመለስ",
    quickExit: "ፈጣን መውጫ",
    waiting: "አማካሪን በመጠባበቅ ላይ...",
    noConversation: "የሚፈልጉትን እርዳታ ለመንገር የድምፅ ረዳቱን ይጠቀሙ።",
  },

  om: {
    title: "Deeggarsa Fayyaa",
    subtitle:
      "Kutaa deeggarsa dhuunfaa keessa jirta. Gargaaraa sagalee armaan gadii fayyadami.",
    privateSession: "Yeroo Dhuunfaa",
    privateText:
      "Bilisaan dubbachuu dandeessa. Maqaa kee kennuun si hin barbaachisu.",
    connecting: "Gorsaa fayyaa waliin wal qunnamsiisaa jirra...",
    connected: "Gorsaa fayyaa waliin wal qunnamtii uumameera",
    conversation: "Haasa'a Keessanii",
    typeMessage: "Ergaa barreessi...",
    send: "Ergi",
    advisor: "Gorsaa Fayyaa",
    you: "Ati",
    recommendation: "Bakka Tajaajilaa Yaadame",
    location: "Iddoo",
    contact: "Quunnamtii",
    notes: "Odeeffannoo",
    connect: "Gorsaa waliin na qunnamsiisi",
    back: "Deebi'i",
    quickExit: "Ba'iinsa Saffisaa",
    waiting: "Gorsaa eeggachaa jirra...",
    noConversation:
      "Gargaarsa akkamii akka barbaaddu himuuf gargaaraa sagalee fayyadami.",
  },
};

function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem("safelink_session");

    if (!saved) return "en";

    const parsed = JSON.parse(saved);

    if (parsed?.language === "am") return "am";
    if (parsed?.language === "om") return "om";

    return "en";
  } catch {
    return "en";
  }
}

export default function MedicalFlowPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [safelinkId, setSafelinkId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const t = translations[language];

  useEffect(() => {
    const savedLanguage = getSavedLanguage();
    setLanguage(savedLanguage);

    try {
      const saved = localStorage.getItem("safelink_session");

      if (saved) {
        const parsed = JSON.parse(saved);

        if (parsed?.safelink_id) {
          setSafelinkId(parsed.safelink_id);
        }
      }
    } catch {
      // Ignore invalid local session data.
    }
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

  async function startMedicalSupport() {
    if (!safelinkId || loading) return;

    try {
      setLoading(true);
      setError("");

      const result = await requestMedicalSupport(safelinkId);

      setConversation(result);

      const existingRequests = localStorage.getItem(
        "safelink_medical_requests"
      );

      let requests: unknown[] = [];

      try {
        requests = existingRequests
          ? JSON.parse(existingRequests)
          : [];
      } catch {
        requests = [];
      }

      const request = {
        safelink_id: safelinkId,
        conversation_id: result.conversation_id,
        created_at: new Date().toISOString(),
        status: "new" as const,
      };

      localStorage.setItem(
        "safelink_medical_requests",
        JSON.stringify([...requests, request])
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to medical support."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || !conversation || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const updated = await sendUserMessage(
        conversation.conversation_id,
        trimmedMessage
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

  async function handleRecommendation(
    facility: NonNullable<Conversation["recommendation"]>
  ) {
    if (!conversation) return;

    try {
      setError("");

      const updated = await recommendFacility(
        conversation.conversation_id,
        facility
      );

      setConversation(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The recommendation could not be saved."
      );
    }
  }

  function handleBack() {
    window.history.back();
  }

  function handleQuickExit() {
    window.location.href = "/quick-exit";
  }

  return (
    <main className="min-h-screen bg-[#123d34] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#123d34]/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <span className="text-lg">←</span>
            {t.back}
          </button>

          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#a9cfba]">
              SafeLink
            </p>
            <p className="mt-1 text-sm text-white/60">
              {safelinkId || "Private session"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleQuickExit}
            className="rounded-full border border-red-300/30 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-400/20"
          >
            × {t.quickExit}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#a9cfba]/15 text-3xl">
            ♡
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {t.title}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
            {t.subtitle}
          </p>
        </div>

        {/* Voice assistant area */}
        <div className="mx-auto mt-10 max-w-3xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#19483e] px-6 py-10 shadow-2xl">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#a9cfba]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#6ca58a]/10 blur-3xl" />

            <div className="relative text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#a9cfba]/20 bg-[#a9cfba]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#c8dfd1]">
                <span className="h-2 w-2 rounded-full bg-[#a9cfba]" />
                {language === "am"
                  ? "በድምፅ ይናገሩ"
                  : language === "om"
                    ? "Sagaleedhaan dubbadhu"
                    : "Voice assistant"}
              </div>

              <h2 className="mt-4 text-2xl font-semibold">
                {t.noConversation}
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55">
                {t.privateText}
              </p>

              {/* ORIGINAL VOXIDE ASSISTANT */}
              <div className="mt-8 flex justify-center">
                <Assistant />
              </div>

              <p className="mt-6 text-xs text-white/40">
                {language === "am"
                  ? "የድምፅ ረዳቱን ለመጀመር የብርቱካናማውን ማይክሮፎን ይጫኑ።"
                  : language === "om"
                    ? "Gargaaraa sagalee jalqabuuf maaykirofoonii burtukaanaa tuqi."
                    : "Tap the orange microphone to speak."}
              </p>
            </div>
          </div>
        </div>

        {/* Connect fallback */}
        {!conversation && (
          <div className="mx-auto mt-8 max-w-3xl text-center">
            <button
              type="button"
              onClick={startMedicalSupport}
              disabled={loading || !safelinkId}
              className="rounded-full bg-[#a9cfba] px-7 py-3.5 text-sm font-bold text-[#123d34] shadow-lg transition hover:bg-[#c2dfce] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? t.connecting : t.connect}
            </button>
          </div>
        )}

        {/* Conversation */}
        {conversation && (
          <div className="mx-auto mt-10 max-w-4xl">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#f7f5f1] text-[#565857] shadow-2xl">
              <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6d8f80]">
                    {conversation.advisor_id}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#243c35]">
                    {t.conversation}
                  </h2>
                </div>

                <div className="flex items-center gap-2 rounded-full bg-[#e6f1eb] px-3 py-2 text-xs font-semibold text-[#39705b]">
                  <span className="h-2 w-2 rounded-full bg-[#5f9b7d]" />
                  {t.connected}
                </div>
              </div>

              <div className="max-h-[420px] space-y-4 overflow-y-auto px-6 py-6">
                {conversation.messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-[#7a817e]">
                    {t.waiting}
                  </div>
                ) : (
                  conversation.messages.map((msg, index) => (
                    <div
                      key={`${msg.timestamp}-${index}`}
                      className={`flex ${
                        msg.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.sender === "user"
                            ? "rounded-br-md bg-[#19483e] text-white"
                            : "rounded-bl-md bg-[#e8ece9] text-[#35433e]"
                        }`}
                      >
                        <p className="mb-1 text-[11px] font-semibold opacity-60">
                          {msg.sender === "user"
                            ? t.you
                            : t.advisor}
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
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#477661]">
                    {t.recommendation}
                  </p>

                  <h3 className="mt-2 text-xl font-semibold text-[#243c35]">
                    {conversation.recommendation.facility_name}
                  </h3>

                  <div className="mt-4 space-y-2 text-sm text-[#58665f]">
                    <p>
                      <strong>{t.location}:</strong>{" "}
                      {conversation.recommendation.location}
                    </p>

                    <p>
                      <strong>{t.contact}:</strong>{" "}
                      {conversation.recommendation.contact}
                    </p>

                    <p>
                      <strong>{t.notes}:</strong>{" "}
                      {conversation.recommendation.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Message composer */}
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
                    placeholder={t.typeMessage}
                    className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-[#35433e] outline-none transition focus:border-[#6f9c86] focus:ring-2 focus:ring-[#a9cfba]/30"
                  />

                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="rounded-full bg-[#19483e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24594d] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? "..." : t.send}
                  </button>
                </div>
              </form>
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