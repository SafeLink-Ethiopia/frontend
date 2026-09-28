import { useEffect, useRef, useState } from "react";
import { Send, Pencil, Trash2, Eraser, AlertTriangle, Check, X } from "lucide-react";
import {
  requestAdvisor,
  getConversation,
  sendMessage,
  editMessage,
  clearConversation,
  deleteConversation,
} from "../api/advisorApi";
import { getSafelinkId } from "../services/session";
import type { AdvisorType, ChatAdvisorType, Conversation } from "../types/advisor";

// Covers all four — used for rendering "suggested advisor" buttons,
// which can include "medical" even though this component never renders
// a medical chat itself.
const LABELS: Record<AdvisorType, string> = {
  general: "General Advisor",
  legal: "Legal Advisor",
  psychological: "Psychological Advisor",
  medical: "Medical Advisor",
};

// Only the three this component actually renders as its own header.
const INITIALS: Record<ChatAdvisorType, string> = {
  general: "GA",
  legal: "LA",
  psychological: "PA",
};

interface AdvisorChatProps {
  advisorType: ChatAdvisorType;
  existingConversationId?: string;
  onConnectToType?: (type: AdvisorType) => void;
}

export default function AdvisorChat({
  advisorType,
  existingConversationId,
  onConnectToType,
}: AdvisorChatProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const safelinkId = useRef(getSafelinkId()).current;

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError("");
        const result = existingConversationId
          ? await getConversation(existingConversationId)
          : await requestAdvisor(safelinkId, advisorType);
        setConversation(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to connect to an advisor.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [advisorType, existingConversationId, safelinkId]);

  useEffect(() => {
    if (!conversation?.conversation_id) return;
    const interval = window.setInterval(async () => {
      try {
        const fresh = await getConversation(conversation.conversation_id);
        setConversation(fresh);
      } catch {
        // keep current state on a failed poll
      }
    }, 2500);
    return () => window.clearInterval(interval);
  }, [conversation?.conversation_id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !conversation || sending) return;
    try {
      setSending(true);
      setError("");
      const updated = await sendMessage(conversation.conversation_id, "user", trimmed, urgent);
      setConversation(updated);
      setMessage("");
      setUrgent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  async function saveEdit(index: number) {
    if (!conversation || !editingText.trim()) return;
    try {
      const updated = await editMessage(conversation.conversation_id, index, editingText.trim());
      setConversation(updated);
      setEditingIndex(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save edit.");
    }
  }

  async function handleClear() {
    if (!conversation) return;
    if (!window.confirm("Clear this conversation? Messages will be removed, but the thread stays.")) return;
    try {
      const updated = await clearConversation(conversation.conversation_id);
      setConversation(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not clear conversation.");
    }
  }

  async function handleDelete() {
    if (!conversation) return;
    if (!window.confirm("Delete this conversation? It will be removed from your dashboard.")) return;
    try {
      await deleteConversation(conversation.conversation_id);
      window.location.href = "/support";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete conversation.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#33484D] text-[#F4F7F7]">
        <p className="animate-pulse text-sm">Connecting you to a {LABELS[advisorType].toLowerCase()}...</p>
      </main>
    );
  }

  if (error && !conversation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#33484D] text-[#D96C6C]">
        <p>{error}</p>
      </main>
    );
  }

  if (!conversation) return null;

  return (
    <main className="min-h-screen bg-[#33484D]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#5C838A]/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A9C4C9] text-sm font-bold text-[#33484D]">
              {INITIALS[advisorType]}
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-[#DCE9EA]">SafeLink</p>
              <p className="text-base font-semibold text-white">{LABELS[advisorType]}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              title="Clear conversation"
              className="rounded-full border border-white/20 p-2 text-white/80 transition hover:bg-white/10"
            >
              <Eraser size={16} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              title="Delete conversation"
              className="rounded-full border border-[#D96C6C]/40 bg-[#D96C6C]/10 p-2 text-[#F3B9B9] transition hover:bg-[#D96C6C]/25"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Chat body */}
      <section className="mx-auto max-w-2xl px-5 py-6">
        <div className="flex min-h-[380px] flex-col gap-3 rounded-3xl bg-[#F4F7F7] p-5 shadow-lg">
          {conversation.messages.length === 0 ? (
            <p className="m-auto max-w-xs text-center text-sm text-[#6B7A7C]">
              Say what's going on — you only need to share what you're comfortable with.
            </p>
          ) : (
            conversation.messages.map((msg, index) => (
              <div key={`${msg.timestamp}-${index}`} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm ${
                    msg.sender === "user"
                      ? "rounded-br-sm bg-[#5C838A] text-white"
                      : "rounded-bl-sm bg-white text-[#33484D]"
                  }`}
                >
                  {editingIndex === index ? (
                    <div className="flex flex-col gap-2">
                      <input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="rounded-lg border border-[#5C838A]/30 px-2 py-1 text-sm text-[#33484D] outline-none focus:border-[#5C838A]"
                        autoFocus
                      />
                      <div className="flex gap-3 text-xs font-semibold">
                        <button type="button" onClick={() => saveEdit(index)} className="flex items-center gap-1 text-[#3D6B72]">
                          <Check size={13} /> Save
                        </button>
                        <button type="button" onClick={() => setEditingIndex(null)} className="flex items-center gap-1 text-[#8A9A9C]">
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>{msg.text}</p>
                      <div className={`mt-1 flex items-center gap-2 text-[10px] opacity-70 ${msg.sender === "user" ? "justify-end" : ""}`}>
                        {msg.edited && <span>edited</span>}
                        {msg.sender === "user" && (
                          <button type="button" onClick={() => { setEditingIndex(index); setEditingText(msg.text); }} className="flex items-center gap-0.5">
                            <Pencil size={10} /> Edit
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}

          {conversation.suggested_advisor_types.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {conversation.suggested_advisor_types.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onConnectToType?.(type)}
                  className="rounded-full bg-[#5C838A] px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#4C6F75]"
                >
                  Connect me to {LABELS[type]}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Composer */}
        <form onSubmit={handleSend} className="mt-4">
          <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-md">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[#33484D] outline-none placeholder:text-[#9AAAAC]"
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5C838A] text-white transition hover:bg-[#4C6F75] disabled:opacity-40"
            >
              <Send size={16} />
            </button>
          </div>

          <label className="mt-2 flex items-center gap-2 pl-2 text-xs text-[#DCE9EA]">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) => setUrgent(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#D96C6C]"
            />
            <AlertTriangle size={13} className="text-[#D96C6C]" />
            This is urgent
          </label>
        </form>

        {error && <p className="mt-3 text-center text-sm text-[#F3B9B9]">{error}</p>}
      </section>
    </main>
  );
}
