import { useEffect, useState } from "react";
import {
  AdvisorType,
  getConversation,
  markMessagesSeen,
  recommendFacility,
  requestAdvisorSupport,
  sendUserMessage,
} from "../api/medicalApi";
import type { Conversation } from "../api/medicalApi";

type Language = "en" | "am" | "om";

const translations = {
  en: {
    title: "Private Support",
    subtitle:
      "You are in a private support session. Choose the kind of help you need.",
    privateSession: "Private Session",
    privateText:
      "You can speak freely. You do not need to provide your name.",
    connecting: "Connecting you to an advisor...",
    connected: "Connected to an advisor",
    conversation: "Your Conversation",
    typeMessage: "Type a message...",
    send: "Send",
    advisor: "Advisor",
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
      "Choose the kind of support you need to get started.",

    pickTitle: "What kind of support do you need?",
    pickSubtitle:
      "Pick the advisor that fits best. If you are not sure, choose “Not sure” — we will start with a general advisor who can guide you.",
    pickMedical: "Medical Advisor",
    pickMedicalDesc: "Health, injuries, medical questions.",
    pickLegal: "Legal Advisor",
    pickLegalDesc: "Rights, legal questions, reporting.",
    pickPsychological: "Psychological Advisor",
    pickPsychologicalDesc: "Emotional support, stress, trauma.",
    pickGeneral: "General Advisor",
    pickGeneralDesc: "Not sure — general guidance first.",
    pickNotSure: "Not sure",
    pickNotSureDesc:
      "We will start you with a general advisor who can route you.",
    pickStart: "Start private support",
    pickSelected: "Selected",
  },

  am: {
    title: "የግል ድጋፍ",
    subtitle:
      "በግል የድጋፍ ክፍል ውስጥ ነዎት። የሚፈልጉትን የእርዳታ አይነት ይምረጡ።",
    privateSession: "የግል ክፍለ ጊዜ",
    privateText: "በነፃነት መናገር ይችላሉ። ስምዎን መስጠት አያስፈልግም።",
    connecting: "ከአማካሪ ጋር በመገናኘት ላይ...",
    connected: "ከአማካሪ ጋር ተገናኝተዋል",
    conversation: "የውይይትዎ",
    typeMessage: "መልዕክት ይጻፉ...",
    send: "ላክ",
    advisor: "አማካሪ",
    you: "እርስዎ",
    recommendation: "የተመከረ ተቋም",
    location: "ቦታ",
    contact: "ስልክ",
    notes: "መረጃ",
    connect: "ከአማካሪ ጋር አገናኙኝ",
    back: "ተመለስ",
    quickExit: "ፈጣን መውጫ",
    waiting: "አማካሪን በመጠባበቅ ላይ...",
    noConversation: "ለመጀመር የሚፈልጉትን የድጋፍ አይነት ይምረጡ።",

    pickTitle: "የሚፈልጉት ድጋፍ ምን ዓይነት ነው?",
    pickSubtitle:
      "የሚስማማዎትን አማካሪ ይምረጡ። እርግጠኛ ካልሆኑ “እርግጠኛ አልሆንኩም” ይምረጡ — በአጠቃላይ አማካሪ እንጀምራለን።",
    pickMedical: "የሕክምና አማካሪ",
    pickMedicalDesc: "ጤና፣ ጉዳት፣ የሕክምና ጥያቄዎች።",
    pickLegal: "የሕግ አማካሪ",
    pickLegalDesc: "መብቶች፣ የሕግ ጥያቄዎች፣ ሪፖርት ማድረግ።",
    pickPsychological: "የሥነ-ልቦና አማካሪ",
    pickPsychologicalDesc: "የስሜት ድጋፍ፣ ጭንቀት፣ ጉዳት።",
    pickGeneral: "አጠቃላይ አማካሪ",
    pickGeneralDesc: "እርግጠኛ አልሆንኩም — በአጠቃላይ መመሪያ እንጀምር።",
    pickNotSure: "እርግጠኛ አልሆንኩም",
    pickNotSureDesc:
      "በአጠቃላይ አማካሪ እንጀምርልዎታለን፣ ከዚያም ወደ ትክክለኛው ይመራዎታል።",
    pickStart: "የግል ድጋፍ ጀምር",
    pickSelected: "ተመርጧል",
  },

  om: {
    title: "Deeggarsa Dhuunfaa",
    subtitle:
      "Kutaa deeggarsa dhuunfaa keessa jirta. Gosa gargaarsa barbaaddu filadhu.",
    privateSession: "Yeroo Dhuunfaa",
    privateText:
      "Bilisaan dubbachuu dandeessa. Maqaa kee kennuun si hin barbaachisu.",
    connecting: "Gorsaa waliin wal qunnamsiisaa jirra...",
    connected: "Gorsaa waliin wal qunnamtii uumameera",
    conversation: "Haasa'a Keessanii",
    typeMessage: "Ergaa barreessi...",
    send: "Ergi",
    advisor: "Gorsaa",
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
      "Jalqabuuf gosa deeggarsa barbaaddu filadhu.",

    pickTitle: "Gosa deeggarsa akkamii barbaadda?",
    pickSubtitle:
      "Gorsaa siif mijatu filadhu. Yoo hin mirkaneeffanne “Hin mirkaneeffanne” filadhu — gorsaa waliigalaatiin jalqabna.",
    pickMedical: "Gorsaa Fayyaa",
    pickMedicalDesc: "Fayyaa, miidhaa, gaaffii fayyaa.",
    pickLegal: "Gorsaa Seeraa",
    pickLegalDesc: "Mirga, gaaffii seeraa, gabaasa.",
    pickPsychological: "Gorsaa Sammuu",
    pickPsychologicalDesc: "Deeggarsa miiraa, dhiphina, miidhaa.",
    pickGeneral: "Gorsaa Waliigalaa",
    pickGeneralDesc: "Hin mirkaneeffanne — qajeelfama waliigalaa dura.",
    pickNotSure: "Hin mirkaneeffanne",
    pickNotSureDesc:
      "Gorsaa waliigalaatiin jalqabna, sana booda gara sirriitti si qajeelcha.",
    pickStart: "Deeggarsa dhuunfaa jalqabi",
    pickSelected: "Filatameera",
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

type PickerOption = {
  value: AdvisorType | "not_sure";
  emoji: string;
  labelKey:
    | "pickMedical"
    | "pickLegal"
    | "pickPsychological"
    | "pickGeneral"
    | "pickNotSure";
  descKey:
    | "pickMedicalDesc"
    | "pickLegalDesc"
    | "pickPsychologicalDesc"
    | "pickGeneralDesc"
    | "pickNotSureDesc";
};

const pickerOptions: PickerOption[] = [
  { value: "medical", emoji: "🩺", labelKey: "pickMedical", descKey: "pickMedicalDesc" },
  { value: "legal", emoji: "⚖️", labelKey: "pickLegal", descKey: "pickLegalDesc" },
  { value: "psychological", emoji: "💬", labelKey: "pickPsychological", descKey: "pickPsychologicalDesc" },
  { value: "general", emoji: "🤝", labelKey: "pickGeneral", descKey: "pickGeneralDesc" },
  { value: "not_sure", emoji: "❓", labelKey: "pickNotSure", descKey: "pickNotSureDesc" },
];

export default function MedicalFlowPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [safelinkId, setSafelinkId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [pickedType, setPickedType] = useState<
    AdvisorType | "not_sure"
  >("general");

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

  const markSeen = async () => {
    try {
      await markMessagesSeen(
        conversation.conversation_id,
        "user"
      );
    } catch {
      // ignore
    }
  };

  markSeen();

  const interval = window.setInterval(async () => {
    try {
      const fresh = await getConversation(
        conversation.conversation_id
      );
      setConversation(fresh);
      await markSeen();
    } catch {
      // Keep the current conversation if polling fails.
    }
  }, 2000);

  return () => window.clearInterval(interval);
}, [conversation?.conversation_id]);

  function resolveAdvisorType(
    selection: AdvisorType | "not_sure"
  ): AdvisorType {
    if (selection === "not_sure") return "general";
    return selection;
  }

  async function startSupport() {
    if (!safelinkId || loading) return;

    const advisorType = resolveAdvisorType(pickedType);

    try {
      setLoading(true);
      setError("");

      const result = await requestAdvisorSupport(
        safelinkId,
        advisorType
      );

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
        advisor_type: advisorType,
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
          : "Unable to connect to support."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || !conversation || sending) return;

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
    // ← BACK TARGET: change this if you want a different destination
    window.location.href = "/";
  }

  function handleQuickExit() {
    window.location.href = "/quick-exit";
  }

  return (
    <main className="min-h-screen bg-[#123d34] text-white">
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
              {safelinkId || t.privateSession}
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
        {/* PICKER SCREEN */}
        {!conversation && (
          <>
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#a9cfba]/15 text-3xl">
                ♡
              </div>

              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                {t.pickTitle}
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">
                {t.pickSubtitle}
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-3 sm:grid-cols-2">
              {pickerOptions.map((option) => {
                const isSelected = pickedType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPickedType(option.value)}
                    className={`group relative flex items-start gap-4 rounded-2xl border p-5 text-left transition ${
                      isSelected
                        ? "border-[#a9cfba] bg-[#19483e] shadow-xl"
                        : "border-white/10 bg-[#19483e]/60 hover:border-[#a9cfba]/50 hover:bg-[#19483e]"
                    }`}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#a9cfba]/15 text-2xl">
                      {option.emoji}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">
                        {t[option.labelKey]}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-white/60">
                        {t[option.descKey]}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="shrink-0 rounded-full bg-[#a9cfba] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#123d34]">
                        {t.pickSelected}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-center text-sm text-red-100">
                {error}
              </div>
            )}

            <div className="mx-auto mt-8 max-w-3xl text-center">
              <button
                type="button"
                onClick={startSupport}
                disabled={loading || !safelinkId}
                className="rounded-full bg-[#a9cfba] px-7 py-3.5 text-sm font-bold text-[#123d34] shadow-lg transition hover:bg-[#c2dfce] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? t.connecting : t.pickStart}
              </button>
            </div>
          </>
        )}
                {/* CONVERSATION VIEW — shown once a conversation exists */}
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
                          {msg.sender === "user" ? t.you : t.advisor}
                        </p>

                        <p className="text-sm leading-6">{msg.text}</p>

                        {/* Read receipt — only on user's own messages */}
                        {msg.sender === "user" && (
                          <div className="mt-1 flex items-center justify-end">
                            <span
                              className={`text-[11px] font-semibold leading-none ${
                                msg.seen_at
                                  ? "text-[#a9cfba]"
                                  : "text-white/50"
                              }`}
                              title={msg.seen_at ? "Seen" : "Sent"}
                            >
                              {msg.seen_at ? "✓✓" : "✓"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}

                {conversation.recommendation && (
                  <div className="flex justify-start">
                    <div className="max-w-[88%] rounded-2xl border border-[#a9cfba] bg-[#e6f1eb] p-4 shadow-sm sm:max-w-[70%]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#39705b]">
                        ✓ Facility Recommended
                      </p>

                      <div className="mt-2 space-y-1 text-[13px] text-[#243c35]">
                        <p className="font-mono text-[10px] text-[#789187]">
                          For: {conversation.session_id}
                        </p>

                        <p className="font-semibold">
                          {conversation.recommendation.facility_name}
                        </p>

                        <p className="text-[#66766f]">
                          {conversation.recommendation.location}
                        </p>

                        <p className="text-[#66766f]">
                          {conversation.recommendation.contact}
                        </p>

                        <p className="text-xs italic text-[#789187]">
                          {conversation.recommendation.notes}
                        </p>

                        <p className="pt-1 font-mono text-[10px] text-[#789187]">
                          From: {conversation.advisor_id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

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

        {conversation && error && (
          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-red-300/20 bg-red-400/10 px-5 py-4 text-center text-sm text-red-100">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}