import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  MoreVertical,
  Search,
  Send,
  X,
  Copy,
} from "lucide-react";

import {
  Conversation,
  Message,
  deleteMessage,
  deleteSelectedMessages,
  editMessage,
  getConversation,
  getPendingConversations,
  markMessagesSeen,
  recommendFacility,
  sendAdvisorMessage,
  deleteSelectedConversations,
} from "../api/medicalApi";

import {
  addFacility,
  getFacilities,
  type Facility as MongoFacility,
} from "../api/facilityApi";

import { FACILITIES, Facility } from "../data/facilities";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(
  timestamp: string,
  todayLabel: string,
  yesterdayLabel: string,
) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return todayLabel;
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return yesterdayLabel;
  }

  return date.toLocaleDateString([], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getInitials(sessionId: string) {
  const clean = sessionId.replace(/^SL-/i, "");

  return clean.slice(0, 2).toUpperCase() || "SL";
}

type RecommendationFacility = {
  facility_id: string;
  facility_name: string;
  location: string;
  contact: string;
  notes?: string;
  description?: string;
  support_types?: string[];
};

function mapMongoFacility(f: MongoFacility): RecommendationFacility {
  return {
    facility_id: f.facility_id,
    facility_name: f.facility_name,
    location: f.location,
    contact: f.contact,
    notes: f.description,
    description: f.description,
    support_types: f.support_types,
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export default function AdvisorPage() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [conversationSearch, setConversationSearch] = useState("");

  const [showMobileChat, setShowMobileChat] = useState(false);

  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  const [showListMenu, setShowListMenu] = useState(false);

  const [deleteMode, setDeleteMode] = useState(false);

  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  const [chatDeleteMode, setChatDeleteMode] = useState(false);

  const [selectedConversationIds, setSelectedConversationIds] = useState<
    string[]
  >([]);

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const [openMessageMenu, setOpenMessageMenu] = useState<string | null>(null);

  /* ================================================================ */
  /* Reply state                                                       */
  /* ================================================================ */

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  /* ================================================================ */
  /* Facilities                                                        */
  /* ================================================================ */

  const [showFacilities, setShowFacilities] = useState(false);

  const [showCustomFacility, setShowCustomFacility] = useState(false);

  const [facilitySearch, setFacilitySearch] = useState("");

  const [customFacility, setCustomFacility] = useState({
    facility_id: "",
    facility_name: "",
    location: "",
    contact: "",
    notes: "",
  });

  const [facilities, setFacilities] = useState<RecommendationFacility[]>(
    FACILITIES.map((f: Facility) => ({
      facility_id: f.facility_id,
      facility_name: f.facility_name,
      location: f.location,
      contact: f.contact,
      description: f.description,
      support_types: f.support_types,
    })),
  );

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  /* ================================================================ */
  /* Load facilities                                                   */
  /* ================================================================ */

  useEffect(() => {
    void (async () => {
      try {
        const list = await getFacilities();

        if (list.length > 0) {
          setFacilities(list.map(mapMongoFacility));
        }
      } catch (error) {
        console.error("Failed to load facilities from MongoDB:", error);
      }
    })();
  }, []);

  /* ================================================================ */
  /* Load conversations                                                */
  /* ================================================================ */

  const loadConversations = async () => {
    try {
      const data = await getPendingConversations();

      const unique = Array.from(
        new Map(
          data.map((conversation) => [
            conversation.conversation_id,
            conversation,
          ]),
        ).values(),
      );

      setConversations((current) =>
        JSON.stringify(current) === JSON.stringify(unique) ? current : unique,
      );

      if (selectedConversation) {
        const updated = unique.find(
          (conversation) =>
            conversation.conversation_id ===
            selectedConversation.conversation_id,
        );

        if (updated) {
          setSelectedConversation((current) =>
            current && JSON.stringify(current) === JSON.stringify(updated)
              ? current
              : updated,
          );
        }
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  useEffect(() => {
    loadConversations();

    const interval = setInterval(loadConversations, 2000);

    return () => clearInterval(interval);
  }, []);

  /* ================================================================ */
  /* Refresh selected conversation + mark seen                         */
  /* ================================================================ */

  useEffect(() => {
    if (!selectedConversation) return;

    const refreshSelectedConversation = async () => {
      try {
        const updated = await getConversation(
          selectedConversation.conversation_id,
        );

        setSelectedConversation((current) =>
          current && JSON.stringify(current) === JSON.stringify(updated)
            ? current
            : updated,
        );
      } catch (error) {
        console.error("Failed to refresh selected conversation:", error);
      }
    };

    const markSeen = async () => {
      try {
        await markMessagesSeen(selectedConversation.conversation_id, "advisor");
      } catch (error) {
        console.error("Failed to mark messages as seen:", error);
      }
    };

    markSeen();

    const interval = setInterval(async () => {
      await refreshSelectedConversation();
      await markSeen();
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedConversation?.conversation_id]);

  /* ================================================================ */
  /* Scroll to bottom                                                  */
  /* ================================================================ */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedConversation?.messages.length]);

  /* ================================================================ */
  /* Selection helpers                                                 */
  /* ================================================================ */

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);

    setShowMobileChat(true);

    setShowFacilities(false);
    setShowCustomFacility(false);

    setShowHeaderMenu(false);
    setShowListMenu(false);

    setDeleteMode(false);
    setSelectedMessageIds([]);

    setChatDeleteMode(false);
    setSelectedConversationIds([]);

    setOpenMessageMenu(null);

    setEditingMessageId(null);
    setEditingText("");

    setReplyingTo(null);
  };

  const toggleConversationSelection = (conversationId: string) => {
    setSelectedConversationIds((current) =>
      current.includes(conversationId)
        ? current.filter((id) => id !== conversationId)
        : [...current, conversationId],
    );
  };

  const cancelChatDeleteMode = () => {
    setChatDeleteMode(false);
    setSelectedConversationIds([]);
    setShowListMenu(false);
  };

  const confirmSelectedConversationsDeletion = async () => {
    if (selectedConversationIds.length === 0 || loading) {
      return;
    }

    const confirmed = window.confirm(
      t(
        selectedConversationIds.length === 1
          ? "advisorWorkspace.deleteSelectedChatConfirm"
          : "advisorWorkspace.deleteSelectedChatsConfirm",
        { count: selectedConversationIds.length },
      ),
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await deleteSelectedConversations(selectedConversationIds);

      if (
        selectedConversation &&
        selectedConversationIds.includes(selectedConversation.conversation_id)
      ) {
        setSelectedConversation(null);
        setShowMobileChat(false);
      }

      setChatDeleteMode(false);
      setSelectedConversationIds([]);
    } catch (error) {
      console.error("Failed to delete selected conversations:", error);

      alert(t("advisorWorkspace.deleteSelectedChatsFailed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================ */
  /* Send message                                                      */
  /* ================================================================ */

  const handleSendMessage = async () => {
    if (!selectedConversation || !message.trim() || loading) {
      return;
    }

    try {
      setLoading(true);

      /*
       * The current backend accepts plain text.
       *
       * When replying, we include the replied
       * message as a quote so the existing API
       * does not need to change.
       */
      let messageToSend = message.trim();

      if (replyingTo) {
        const quotedText = replyingTo.text.trim();

        messageToSend = t("advisorWorkspace.replyToQuotedMessage", {
          message: quotedText,
          reply: messageToSend,
        });
      }

      const updated = await sendAdvisorMessage(
        selectedConversation.conversation_id,
        messageToSend,
      );

      setSelectedConversation(updated);

      setMessage("");

      setReplyingTo(null);

      await loadConversations();

      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      console.error("Failed to send advisor message:", error);

      alert(t("advisorWorkspace.sendMessageFailed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================ */
  /* Copy message                                                      */
  /* ================================================================ */

  const handleCopyMessage = async (currentMessage: Message) => {
    if (currentMessage.deleted || !currentMessage.text) {
      return;
    }

    try {
      await navigator.clipboard.writeText(currentMessage.text);

      setOpenMessageMenu(null);
    } catch (error) {
      console.error("Failed to copy message:", error);

      /*
       * Fallback for browsers where clipboard
       * permission is unavailable.
       */
      try {
        const textarea = document.createElement("textarea");

        textarea.value = currentMessage.text;

        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        document.execCommand("copy");

        document.body.removeChild(textarea);

        setOpenMessageMenu(null);
      } catch (fallbackError) {
        console.error("Clipboard fallback failed:", fallbackError);

        alert(t("advisorWorkspace.copyMessageFailed"));
      }
    }
  };

  /* ================================================================ */
  /* Reply message                                                     */
  /* ================================================================ */

  const handleReplyMessage = (currentMessage: Message) => {
    if (currentMessage.deleted) return;

    setReplyingTo(currentMessage);

    setOpenMessageMenu(null);

    setEditingMessageId(null);
    setEditingText("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  /* ================================================================ */
  /* Cancel reply                                                      */
  /* ================================================================ */

  const cancelReply = () => {
    setReplyingTo(null);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  /* ================================================================ */
  /* Edit message                                                      */
  /* ================================================================ */

  const startEditing = (currentMessage: Message) => {
    if (currentMessage.sender !== "advisor" || currentMessage.deleted) {
      return;
    }

    setEditingMessageId(currentMessage.message_id);

    setEditingText(currentMessage.text);

    setReplyingTo(null);

    setOpenMessageMenu(null);

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEditedMessage = async () => {
    if (
      !selectedConversation ||
      !editingMessageId ||
      !editingText.trim() ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);

      const updated = await editMessage(
        selectedConversation.conversation_id,
        editingMessageId,
        editingText.trim(),
        "advisor",
      );

      setSelectedConversation(updated);

      cancelEditing();
    } catch (error) {
      console.error("Failed to edit message:", error);

      alert(t("advisorWorkspace.editMessageFailed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================ */
  /* Delete message                                                    */
  /* ================================================================ */

  const deleteOneMessage = async (currentMessage: Message) => {
    if (
      !selectedConversation ||
      currentMessage.sender !== "advisor" ||
      currentMessage.deleted ||
      loading
    ) {
      return;
    }

    const confirmed = window.confirm(t("advisorWorkspace.deleteMessageConfirm"));

    if (!confirmed) return;

    try {
      setLoading(true);

      const updated = await deleteMessage(
        selectedConversation.conversation_id,
        currentMessage.message_id,
        "advisor",
      );

      setSelectedConversation(updated);

      setOpenMessageMenu(null);
    } catch (error) {
      console.error("Failed to delete message:", error);

      alert(t("advisorWorkspace.deleteMessageFailed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================ */
  /* Message selection                                                 */
  /* ================================================================ */

  const toggleMessageSelection = (currentMessage: Message) => {
    if (currentMessage.sender !== "advisor" || currentMessage.deleted) {
      return;
    }

    setSelectedMessageIds((current) =>
      current.includes(currentMessage.message_id)
        ? current.filter((id) => id !== currentMessage.message_id)
        : [...current, currentMessage.message_id],
    );
  };

  const cancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedMessageIds([]);
    setShowListMenu(false);
  };

  const confirmSelectedDeletion = async () => {
    if (!selectedConversation || selectedMessageIds.length === 0 || loading) {
      return;
    }

    const confirmed = window.confirm(
      t(
        selectedMessageIds.length === 1
          ? "advisorWorkspace.deleteSelectedMessageConfirm"
          : "advisorWorkspace.deleteSelectedMessagesConfirm",
        { count: selectedMessageIds.length },
      ),
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const updated = await deleteSelectedMessages(
        selectedConversation.conversation_id,
        selectedMessageIds,
        "advisor",
      );

      setSelectedConversation(updated);

      cancelDeleteMode();
    } catch (error) {
      console.error("Failed to delete selected messages:", error);

      alert(t("advisorWorkspace.deleteSelectedMessagesFailed"));
    } finally {
      setLoading(false);
    }
  };

  /* ================================================================ */
  /* Facilities                                                        */
  /* ================================================================ */

  const handleRecommendFacility = async (facility: {
    facility_id: string;
    facility_name: string;
    location: string;
    contact: string;
    notes: string;
  }) => {
    if (!selectedConversation) return;

    try {
      setLoading(true);

      const updated = await recommendFacility(
        selectedConversation.conversation_id,
        facility,
      );

      setSelectedConversation(updated);

      setShowFacilities(false);
      setShowCustomFacility(false);
      setFacilitySearch("");

      setCustomFacility({
        facility_id: "",
        facility_name: "",
        location: "",
        contact: "",
        notes: "",
      });

      await loadConversations();
    } catch (error) {
      console.error("Failed to recommend facility:", error);

      alert(t("advisorWorkspace.recommendFacilityFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleManualFacilitySubmit = async () => {
    if (!selectedConversation) return;

    const token = localStorage.getItem("advisor_token");

    if (token) {
      try {
        await addFacility(
          {
            facility_name: customFacility.facility_name.trim(),

            location: customFacility.location.trim(),

            contact: customFacility.contact.trim(),

            support_types: ["general"],

            description:
              customFacility.notes.trim() ||
              t("advisorWorkspace.facilityAddedDuringConversation"),
          },
          token,
        );

        try {
          const list = await getFacilities();

          if (list.length > 0) {
            setFacilities(list.map(mapMongoFacility));
          }
        } catch {
          // Ignore refresh errors.
        }
      } catch (error) {
        console.error("Failed to save facility to MongoDB:", error);
      }
    }

    await handleRecommendFacility(customFacility);
  };

  /* ================================================================ */
  /* Derived                                                           */
  /* ================================================================ */

  const latestMessage = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return t("advisorWorkspace.noMessagesYet");
    }

    const last = conversation.messages[conversation.messages.length - 1];

    if (last.deleted) {
      return t("advisorWorkspace.messageDeleted");
    }

    return last.sender === "advisor"
      ? t("advisorWorkspace.youMessage", { message: last.text })
      : last.text;
  };

  const latestMessageTime = (conversation: Conversation) => {
    if (conversation.messages.length === 0) {
      return "";
    }

    const last = conversation.messages[conversation.messages.length - 1];

    return formatTime(last.timestamp);
  };

  const filteredConversations = useMemo(() => {
    const query = conversationSearch.trim().toLowerCase();

    if (!query) {
      return conversations;
    }

    return conversations.filter(
      (conversation) =>
        conversation.session_id.toLowerCase().includes(query) ||
        conversation.conversation_id.toLowerCase().includes(query),
    );
  }, [conversations, conversationSearch]);

  const filteredFacilities = facilities.filter((facility) => {
    const query = facilitySearch.trim().toLowerCase();

    if (!query) return true;

    return (
      facility.facility_id.toLowerCase().includes(query) ||
      facility.facility_name.toLowerCase().includes(query) ||
      facility.location.toLowerCase().includes(query)
    );
  });

  const sessionDisplay =
    selectedConversation?.session_id || t("advisorWorkspace.safeLinkUser");

  const shouldShowDateSeparator = (messages: Message[], index: number) => {
    if (index === 0) return true;

    return (
      new Date(messages[index].timestamp).toDateString() !==
      new Date(messages[index - 1].timestamp).toDateString()
    );
  };

  /* ================================================================ */
  /* UI                                                               */
  /* ================================================================ */

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#FAFBF7] text-[#173B28]">
      <div className="flex h-full w-full overflow-hidden">
        {/* ==========================================================
            CONVERSATION LIST
        =========================================================== */}

        <aside
          className={`${
            showMobileChat ? "hidden" : "flex"
          } h-full w-full flex-col border-r border-[#DCE8DD] bg-[#FAFBF7] md:flex md:w-[350px] lg:w-[390px]`}
        >
          <div className="shrink-0 px-6 pb-4 pt-7">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#176B3A]">
                  {t("advisorWorkspace.messages")}
                </h1>

                <p className="mt-1 text-sm text-[#2F8F4E]">
                  {t("advisorWorkspace.chatWithSafeLinkUsers")}
                </p>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowListMenu((current) => !current)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#173B28] transition hover:bg-[#E7F1E3]"
                  aria-label={t("advisorWorkspace.conversationListMenu")}
                >
                  <MoreVertical size={19} />
                </button>

                {showListMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowListMenu(false)}
                    />

                    <div className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-xl border border-[#DCE8DD] bg-white shadow-xl">
                      {!chatDeleteMode ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setChatDeleteMode(true);

                              setSelectedConversationIds([]);

                              setShowListMenu(false);

                              setDeleteMode(false);

                              setSelectedMessageIds([]);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                          >
                            {t("advisorWorkspace.deleteChats")}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowListMenu(false);

                              setDeleteMode(true);

                              setSelectedMessageIds([]);

                              setChatDeleteMode(false);

                              setSelectedConversationIds([]);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                          >
                            {t("advisorWorkspace.deleteMessages")}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={cancelChatDeleteMode}
                          className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                        >
                          {t("advisorWorkspace.cancelSelection")}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Search */}

            <div className="relative mt-5">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2F8F4E]"
              />

              <input
                value={conversationSearch}
                onChange={(event) => setConversationSearch(event.target.value)}
                placeholder={t("advisorWorkspace.searchUsers")}
                className="h-12 w-full rounded-2xl border border-[#DCE8DD] bg-white pl-11 pr-4 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
              />
            </div>
          </div>

          {/* Chat deletion bar */}

          {chatDeleteMode && (
            <div className="flex shrink-0 items-center justify-between border-y border-[#DCE8DD] bg-[#E7F1E3] px-5 py-3">
              <span className="text-sm font-medium text-[#173B28]">
                {t("advisorWorkspace.selectedCount", {
                  count: selectedConversationIds.length,
                })}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelChatDeleteMode}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-[#173B28] hover:bg-white"
                >
                  {t("advisorWorkspace.cancel")}
                </button>

                <button
                  type="button"
                  disabled={selectedConversationIds.length === 0 || loading}
                  onClick={confirmSelectedConversationsDeletion}
                  className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("advisorWorkspace.deleteSelected")}
                </button>
              </div>
            </div>
          )}

          {/* Message deletion bar */}

          {deleteMode && (
            <div className="flex shrink-0 items-center justify-between border-y border-[#DCE8DD] bg-[#E7F1E3] px-5 py-3">
              <span className="text-sm font-medium text-[#173B28]">
                {t(
                  selectedMessageIds.length === 1
                    ? "advisorWorkspace.selectedMessageCount"
                    : "advisorWorkspace.selectedMessagesCount",
                  { count: selectedMessageIds.length },
                )}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelDeleteMode}
                  className="rounded-full px-3 py-1.5 text-xs font-medium text-[#173B28] hover:bg-white"
                >
                  {t("advisorWorkspace.cancel")}
                </button>

                <button
                  type="button"
                  disabled={selectedMessageIds.length === 0 || loading}
                  onClick={confirmSelectedDeletion}
                  className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("advisorWorkspace.deleteSelected")}
                </button>
              </div>
            </div>
          )}

          {/* Conversation list */}

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E7F1E3] text-[#176B3A]">
                  <Send size={22} />
                </div>

                <p className="font-semibold text-[#173B28]">
                  {conversationSearch
                    ? t("advisorWorkspace.noUsersFound")
                    : t("advisorWorkspace.noConversationsYet")}
                </p>

                <p className="mt-1 text-sm leading-6 text-[#6B7D70]">
                  {conversationSearch
                    ? t("advisorWorkspace.tryAnotherSearch")
                    : t("advisorWorkspace.newSupportRequestsAppear")}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isSelected =
                  selectedConversation?.conversation_id ===
                  conversation.conversation_id;

                const isChatSelected = selectedConversationIds.includes(
                  conversation.conversation_id,
                );

                return (
                  <button
                    key={conversation.conversation_id}
                    type="button"
                    onClick={() => {
                      if (chatDeleteMode) {
                        toggleConversationSelection(
                          conversation.conversation_id,
                        );

                        return;
                      }

                      handleSelectConversation(conversation);
                    }}
                    className={`flex w-full items-center gap-3 border-b border-[#DCE8DD] px-5 py-4 text-left transition ${
                      isChatSelected || isSelected
                        ? "bg-[#E7F1E3]"
                        : "bg-[#FAFBF7] hover:bg-[#F3F7F1]"
                    }`}
                  >
                    {chatDeleteMode && (
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          isChatSelected
                            ? "border-[#2F8F4E] bg-[#2F8F4E] text-white"
                            : "border-[#DCE8DD] bg-white text-transparent"
                        }`}
                      >
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}

                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-semibold text-[#176B3A]">
                        {getInitials(conversation.session_id)}
                      </div>

                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#2F8F4E]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate font-semibold text-[#173B28]">
                          {conversation.session_id}
                        </p>

                        <span className="shrink-0 text-[11px] text-[#6B7D70]">
                          {latestMessageTime(conversation)}
                        </span>
                      </div>

                      <div className="mt-1 flex items-center gap-2">
                        <p className="min-w-0 flex-1 truncate text-sm text-[#6B7D70]">
                          {latestMessage(conversation)}
                        </p>

                        {conversation.urgent && (
                          <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-600">
                            {t("advisorWorkspace.urgent")}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ==========================================================
            CHAT
        =========================================================== */}

        <main
          className={`${
            showMobileChat ? "flex" : "hidden"
          } relative h-full min-w-0 flex-1 flex-col bg-[#FAFBF7] md:flex`}
        >
          {!selectedConversation ? (
            <div className="hidden h-full flex-col items-center justify-center md:flex">
              <div className="max-w-sm px-8 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F1E3] text-[#176B3A]">
                  <Send size={26} />
                </div>

                <h2 className="text-xl font-semibold text-[#173B28]">
                  {t("advisorWorkspace.safeLinkAdvisor")}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6B7D70]">
                  {t("advisorWorkspace.selectConversationToConnect")}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ======================================================
                  HEADER
              ======================================================= */}

              <header className="relative z-20 flex h-[76px] shrink-0 items-center gap-3 border-b border-[#DCE8DD] bg-white px-4 shadow-sm sm:px-6">
                <button
                  type="button"
                  onClick={() => setShowMobileChat(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#173B28] transition hover:bg-[#F3F7F1] md:hidden"
                  aria-label={t("advisorWorkspace.backToConversations")}
                >
                  <ArrowLeft size={19} />
                </button>

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-sm font-semibold text-[#176B3A]">
                  {getInitials(sessionDisplay)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#173B28]">
                    {sessionDisplay}
                  </p>

                  <p className="truncate text-sm text-[#6B7D70]">
                    {selectedConversation.conversation_id}
                  </p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowHeaderMenu((current) => !current)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#173B28] transition hover:bg-[#F3F7F1]"
                    aria-label={t("advisorWorkspace.conversationMenu")}
                  >
                    <MoreVertical size={19} />
                  </button>

                  {showHeaderMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setShowHeaderMenu(false)}
                      />

                      <div className="absolute right-0 top-12 z-40 w-52 overflow-hidden rounded-xl border border-[#DCE8DD] bg-white shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderMenu(false);

                            setDeleteMode(true);

                            setSelectedMessageIds([]);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                        >
                          {t("advisorWorkspace.deleteMessages")}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderMenu(false);

                            setShowFacilities(true);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-[#173B28] transition hover:bg-[#F3F7F1]"
                        >
                          {t("advisorWorkspace.recommendFacility")}
                        </button>

                        <div className="border-t border-[#DCE8DD]" />

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderMenu(false);

                            setSelectedConversation(null);

                            setShowMobileChat(false);

                            setEditingMessageId(null);

                            setSelectedMessageIds([]);

                            setReplyingTo(null);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                        >
                          {t("advisorWorkspace.closeChat")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </header>

              {/* ======================================================
                  MESSAGES
              ======================================================= */}

              <div className="relative min-h-0 flex-1 bg-[#F3F7F1]/60">
                <div className="pointer-events-none absolute inset-0 opacity-[0.05]">
                  <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#2F8F4E_1px,transparent_1px)] [background-size:24px_24px]" />
                </div>

                <div className="relative h-full overflow-y-auto px-3 py-5 sm:px-8">
                  <div className="mx-auto flex max-w-4xl flex-col">
                    {selectedConversation.messages.length === 0 && (
                      <div className="flex min-h-[45vh] items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E7F1E3] text-[#176B3A]">
                            <Send size={23} />
                          </div>

                          <h2 className="text-sm font-semibold text-[#173B28]">
                            {t("advisorWorkspace.noMessagesYet")}
                          </h2>

                          <p className="mt-1 text-sm text-[#6B7D70]">
                            {t("advisorWorkspace.sayHelloToStart")}
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedConversation.messages.map(
                      (currentMessage, index, all) => {
                        const isAdvisor = currentMessage.sender === "advisor";

                        const isSelectedForDelete = selectedMessageIds.includes(
                          currentMessage.message_id,
                        );

                        const showDate = shouldShowDateSeparator(all, index);

                        const messageMenuOpen =
                          openMessageMenu === currentMessage.message_id;

                        return (
                          <div key={currentMessage.message_id}>
                            {showDate && (
                              <div className="my-4 flex justify-center">
                                <span className="rounded-full border border-[#DCE8DD] bg-white px-3 py-1 text-[10px] text-[#6B7D70] shadow-sm sm:text-xs">
                                  {formatDate(
                                    currentMessage.timestamp,
                                    t("advisorWorkspace.today"),
                                    t("advisorWorkspace.yesterday"),
                                  )}
                                </span>
                              </div>
                            )}

                            <div
                              className={`group mb-2 flex ${
                                isAdvisor ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`flex max-w-[88%] items-end gap-2 sm:max-w-[70%] ${
                                  isAdvisor ? "flex-row-reverse" : "flex-row"
                                }`}
                              >
                                {/* Delete selection */}

                                {deleteMode &&
                                  isAdvisor &&
                                  !currentMessage.deleted && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleMessageSelection(currentMessage)
                                      }
                                      className={`mb-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                                        isSelectedForDelete
                                          ? "border-[#2F8F4E] bg-[#2F8F4E] text-white"
                                          : "border-[#DCE8DD] bg-white text-transparent"
                                      }`}
                                      aria-label={t("advisorWorkspace.selectMessage")}
                                    >
                                      <Check size={14} strokeWidth={3} />
                                    </button>
                                  )}

                                <div className="relative min-w-0">
                                  {/* Message bubble */}

                                  <div
                                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                                      isAdvisor
                                        ? "rounded-br-md bg-[#E7F1E3] text-[#173B28]"
                                        : "rounded-bl-md border border-[#DCE8DD] bg-white text-[#173B28]"
                                    } ${
                                      currentMessage.deleted ? "opacity-75" : ""
                                    } ${
                                      isSelectedForDelete
                                        ? "ring-2 ring-[#2F8F4E]/40"
                                        : ""
                                    }`}
                                  >
                                    {currentMessage.deleted ? (
                                      <p className="text-sm italic text-[#6B7D70]">
                                        {t("advisorWorkspace.messageWasDeleted")}
                                      </p>
                                    ) : (
                                      <>
                                        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                                          {currentMessage.text}
                                        </p>

                                        <div className="mt-1 flex items-center justify-end gap-1.5">
                                          <span className="whitespace-nowrap text-[11px] leading-none text-[#6B7D70]">
                                            {formatTime(
                                              currentMessage.timestamp,
                                            )}
                                          </span>

                                          {currentMessage.edited && (
                                            <span className="text-[10px] leading-none text-slate-400">
                                              {t("advisorWorkspace.edited")}
                                            </span>
                                          )}

                                          {isAdvisor &&
                                            (currentMessage.seen_at ? (
                                              <CheckCheck
                                                size={15}
                                                strokeWidth={2.8}
                                                className="text-sky-500"
                                              />
                                            ) : (
                                              <Check
                                                size={15}
                                                strokeWidth={2.8}
                                                className="text-slate-400"
                                              />
                                            ))}
                                        </div>
                                      </>
                                    )}
                                  </div>

                                  {/* ==================================================
                                      MESSAGE MENU
                                  =================================================== */}

                                  {messageMenuOpen && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setOpenMessageMenu(null)}
                                      />

                                      <div className="absolute right-0 top-full z-30 mt-1 w-36 overflow-hidden rounded-xl border border-[#DCE8DD] bg-white shadow-xl">
                                        {/* Reply */}

                                        {!currentMessage.deleted && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleReplyMessage(currentMessage)
                                            }
                                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#173B28] hover:bg-[#F3F7F1]"
                                          >
                                            <span className="text-base">↩</span>

                                            <span>{t("advisorWorkspace.reply")}</span>
                                          </button>
                                        )}

                                        {/* Copy */}

                                        {!currentMessage.deleted && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleCopyMessage(currentMessage)
                                            }
                                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#173B28] hover:bg-[#F3F7F1]"
                                          >
                                            <Copy size={15} />

                                            <span>{t("advisorWorkspace.copy")}</span>
                                          </button>
                                        )}

                                        {/* Edit */}

                                        {isAdvisor &&
                                          !currentMessage.deleted && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                startEditing(currentMessage)
                                              }
                                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-[#173B28] hover:bg-[#F3F7F1]"
                                            >
                                              <span>✏️</span>

                                              <span>{t("advisorWorkspace.edit")}</span>
                                            </button>
                                          )}

                                        {/* Delete */}

                                        {isAdvisor &&
                                          !currentMessage.deleted && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                deleteOneMessage(currentMessage)
                                              }
                                              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                            >
                                              <span>🗑️</span>

                                              <span>{t("advisorWorkspace.delete")}</span>
                                            </button>
                                          )}
                                      </div>
                                    </>
                                  )}
                                </div>

                                {/* More button */}

                                {!deleteMode && !currentMessage.deleted && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOpenMessageMenu((current) =>
                                        current === currentMessage.message_id
                                          ? null
                                          : currentMessage.message_id,
                                      )
                                    }
                                    className="mb-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6B7D70] opacity-0 transition hover:bg-white group-hover:opacity-100"
                                    aria-label={t("advisorWorkspace.messageActions")}
                                  >
                                    <MoreVertical size={15} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      },
                    )}

                    {/* Facility recommendation */}

                    {selectedConversation.recommendation && (
                      <div className="mt-2 flex justify-end">
                        <div className="max-w-[88%] rounded-2xl border border-[#DCE8DD] bg-white p-4 shadow-sm sm:max-w-[70%]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#176B3A]">
                            ✓ {t("advisorWorkspace.facilityRecommended")}
                          </p>

                          <div className="mt-2 space-y-1 text-[13px] text-[#173B28]">
                            <p className="font-semibold">
                              {
                                selectedConversation.recommendation
                                  .facility_name
                              }
                            </p>

                            <p className="text-[#6B7D70]">
                              {selectedConversation.recommendation.location}
                            </p>

                            <p className="text-[#6B7D70]">
                              {selectedConversation.recommendation.contact}
                            </p>

                            <p className="text-xs italic text-[#6B7D70]">
                              {selectedConversation.recommendation.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>
              </div>

              {/* ======================================================
                  REPLY BAR
              ======================================================= */}

              {replyingTo && (
                <div className="flex shrink-0 items-center gap-3 border-t border-[#DCE8DD] bg-white px-4 py-2.5 sm:px-6">
                  <div className="h-10 w-1 shrink-0 rounded-full bg-[#2F8F4E]" />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#2F8F4E]">
                        {t("advisorWorkspace.replyingTo")}{" "}
                        {replyingTo.sender === "advisor"
                          ? t("advisorWorkspace.yourself")
                          : sessionDisplay}
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-sm text-[#6B7D70]">
                      {replyingTo.text}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelReply}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6B7D70] hover:bg-[#F3F7F1]"
                    aria-label={t("advisorWorkspace.cancelReply")}
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* ======================================================
                  EDIT BAR
              ======================================================= */}

              {editingMessageId && (
                <div className="flex shrink-0 items-center gap-3 border-t border-[#DCE8DD] bg-white px-4 py-2.5 sm:px-6">
                  <div className="h-9 w-1 shrink-0 rounded-full bg-[#2F8F4E]" />

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#2F8F4E]">
                      {t("advisorWorkspace.editingMessage")}
                    </p>

                    <p className="truncate text-sm text-[#6B7D70]">
                      {editingText}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-[#F3F7F1]"
                    aria-label={t("advisorWorkspace.cancelEditing")}
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {/* ======================================================
                  COMPOSER
              ======================================================= */}

              <footer className="shrink-0 border-t border-[#DCE8DD] bg-white px-4 py-4 sm:px-6">
                <div className="mx-auto flex max-w-4xl items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={editingMessageId ? editingText : message}
                    onChange={(event) =>
                      editingMessageId
                        ? setEditingText(event.target.value)
                        : setMessage(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();

                        if (editingMessageId) {
                          saveEditedMessage();
                        } else {
                          handleSendMessage();
                        }
                      }
                    }}
                    rows={1}
                    placeholder={
                      editingMessageId
                        ? t("advisorWorkspace.editMessagePlaceholder")
                        : replyingTo
                          ? t("advisorWorkspace.writeReply")
                          : t("advisorWorkspace.messageSession", {
                              session: sessionDisplay,
                            })
                    }
                    className="max-h-32 min-h-[48px] flex-1 resize-none rounded-3xl border border-[#DCE8DD] bg-[#FAFBF7] px-5 py-3 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#2F8F4E]"
                  />

                  <button
                    type="button"
                    onClick={
                      editingMessageId ? saveEditedMessage : handleSendMessage
                    }
                    disabled={
                      loading ||
                      !(editingMessageId ? editingText.trim() : message.trim())
                    }
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#2F8F4E] text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={
                      editingMessageId
                        ? t("advisorWorkspace.saveEdit")
                        : t("advisorWorkspace.sendMessage")
                    }
                  >
                    {editingMessageId ? (
                      <Check size={19} />
                    ) : (
                      <Send size={19} className="-ml-0.5" />
                    )}
                  </button>
                </div>

                <p className="mx-auto mt-2 max-w-4xl text-[11px] text-[#6B7D70]">
                  {t("advisorWorkspace.keyboardHint", {
                    action: editingMessageId
                      ? t("advisorWorkspace.save")
                      : t("advisorWorkspace.send"),
                  })}
                </p>
              </footer>
            </>
          )}
        </main>

        {/* ==========================================================
            FACILITY MODAL
        =========================================================== */}

        {showFacilities && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-0 backdrop-blur-[1px] sm:items-center sm:p-4"
            onClick={() => {
              setShowFacilities(false);
              setShowCustomFacility(false);
              setFacilitySearch("");
            }}
          >
            <div
              className="max-h-[85vh] w-full overflow-hidden rounded-t-2xl border border-[#DCE8DD] bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#DCE8DD] px-5 py-4">
                <div>
                  <h3 className="font-semibold text-[#173B28]">
                    {t("advisorWorkspace.recommendFacilityTitle")}
                  </h3>

                  <p className="text-xs text-[#6B7D70]">
                    {t("advisorWorkspace.chooseSupportFacility")}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowFacilities(false);

                    setShowCustomFacility(false);

                    setFacilitySearch("");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#173B28] hover:bg-[#F3F7F1]"
                  aria-label={t("advisorWorkspace.closeFacilityPanel")}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-5">
                <div className="relative mb-4">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7D70]"
                  />

                  <input
                    value={facilitySearch}
                    onChange={(event) => setFacilitySearch(event.target.value)}
                    placeholder={t("advisorWorkspace.searchFacility")}
                    className="h-11 w-full rounded-xl border border-transparent bg-[#F3F7F1] pl-9 pr-4 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#DCE8DD]"
                  />
                </div>

                <div className="space-y-3">
                  {filteredFacilities.length === 0 ? (
                    <div className="rounded-xl bg-[#F3F7F1] p-5 text-center text-sm text-[#6B7D70]">
                      {t("advisorWorkspace.noFacilitiesFound")}
                    </div>
                  ) : (
                    filteredFacilities.map((facility) => (
                      <button
                        key={facility.facility_id}
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          handleRecommendFacility({
                            facility_id: facility.facility_id,

                            facility_name: facility.facility_name,

                            location: facility.location,

                            contact: facility.contact,

                            notes: facility.notes || "",
                          })
                        }
                        className="w-full rounded-xl border border-[#DCE8DD] bg-white p-4 text-left transition hover:border-[#2F8F4E] hover:bg-[#F3F7F1] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <p className="font-mono text-xs font-semibold text-[#176B3A]">
                          {facility.facility_id}
                        </p>

                        <p className="mt-1 font-semibold text-[#173B28]">
                          {facility.facility_name}
                        </p>

                        <p className="mt-1 text-sm text-[#6B7D70]">
                          {facility.location}
                        </p>

                        <p className="mt-1 text-xs text-[#6B7D70]">
                          {facility.contact}
                        </p>

                        <p className="mt-2 text-xs text-[#6B7D70]">
                          {facility.notes}
                        </p>
                      </button>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomFacility((current) => !current)}
                  className="mt-4 w-full rounded-xl border border-dashed border-[#2F8F4E] bg-[#E7F1E3] px-4 py-3 text-sm font-semibold text-[#176B3A] hover:bg-[#DCE8DD]"
                >
                  {showCustomFacility
                    ? `− ${t("advisorWorkspace.hideManualFacility")}`
                    : `+ ${t("advisorWorkspace.addFacilityManually")}`}
                </button>

                {showCustomFacility && (
                  <div className="mt-4 rounded-xl border border-[#DCE8DD] bg-white p-4">
                    <p className="mb-3 font-semibold text-[#173B28]">
                      {t("advisorWorkspace.newFacility")}
                    </p>

                    <div className="space-y-2">
                      {(
                        [
                          ["facility_id", t("advisorWorkspace.facilityId")],
                          ["facility_name", t("advisorWorkspace.facilityName")],
                          ["location", t("advisorWorkspace.location")],
                          ["contact", t("advisorWorkspace.contact")],
                          ["notes", t("advisorWorkspace.notes")],
                        ] as const
                      ).map(([field, placeholder]) => (
                        <input
                          key={field}
                          value={customFacility[field]}
                          onChange={(event) =>
                            setCustomFacility((current) => ({
                              ...current,
                              [field]: event.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          className="w-full rounded-xl border border-transparent bg-[#F3F7F1] px-3 py-2.5 text-sm text-[#173B28] outline-none placeholder:text-[#8A968D] focus:border-[#DCE8DD]"
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleManualFacilitySubmit}
                      disabled={
                        loading ||
                        !customFacility.facility_id.trim() ||
                        !customFacility.facility_name.trim() ||
                        !customFacility.location.trim() ||
                        !customFacility.contact.trim() ||
                        !customFacility.notes.trim()
                      }
                      className="mt-3 w-full rounded-xl bg-[#2F8F4E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loading
                        ? t("advisorWorkspace.recommending")
                        : t("advisorWorkspace.recommendThisFacility")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
