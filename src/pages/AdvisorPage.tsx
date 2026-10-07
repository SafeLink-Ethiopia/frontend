import { useEffect, useRef, useState } from "react";

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

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
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

function mapMongoFacility(
  f: MongoFacility
): RecommendationFacility {
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

export default function AdvisorPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [showMobileChat, setShowMobileChat] =
    useState(false);

  const [showHeaderMenu, setShowHeaderMenu] =
    useState(false);

  const [showListMenu, setShowListMenu] =
    useState(false);

  const [deleteMode, setDeleteMode] = useState(false);

  const [selectedMessageIds, setSelectedMessageIds] =
    useState<string[]>([]);

  const [chatDeleteMode, setChatDeleteMode] =
    useState(false);

  const [
    selectedConversationIds,
    setSelectedConversationIds,
  ] = useState<string[]>([]);

  const [editingMessageId, setEditingMessageId] =
    useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const [openMessageMenu, setOpenMessageMenu] =
    useState<string | null>(null);

  const [showFacilities, setShowFacilities] =
    useState(false);

  const [showCustomFacility, setShowCustomFacility] =
    useState(false);

  const [facilitySearch, setFacilitySearch] = useState("");

  const [customFacility, setCustomFacility] = useState({
    facility_id: "",
    facility_name: "",
    location: "",
    contact: "",
    notes: "",
  });

  const [facilities, setFacilities] = useState<
    RecommendationFacility[]
  >(
    FACILITIES.map((f: Facility) => ({
      facility_id: f.facility_id,
      facility_name: f.facility_name,
      location: f.location,
      contact: f.contact,
      description: f.description,
      support_types: f.support_types,
    }))
  );

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const list = await getFacilities();
        if (list.length > 0) {
          setFacilities(list.map(mapMongoFacility));
        }
      } catch (error) {
        console.error(
          "Failed to load facilities from MongoDB:",
          error
        );
      }
    })();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getPendingConversations();

      const unique = Array.from(
        new Map(
          data.map((conversation) => [
            conversation.conversation_id,
            conversation,
          ])
        ).values()
      );

      setConversations((current) =>
        JSON.stringify(current) === JSON.stringify(unique)
          ? current
          : unique
      );

      if (selectedConversation) {
        const updated = unique.find(
          (conversation) =>
            conversation.conversation_id ===
            selectedConversation.conversation_id
        );

        if (updated) {
          setSelectedConversation((current) =>
            current && JSON.stringify(current) === JSON.stringify(updated)
              ? current
              : updated
          );
        }
      }
    } catch (error) {
      console.error(
        "Failed to load conversations:",
        error
      );
    }
  };

  useEffect(() => {
    loadConversations();

    const interval = setInterval(
      loadConversations,
      2000
    );

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    const refreshSelectedConversation = async () => {
      try {
        const updated = await getConversation(
          selectedConversation.conversation_id
        );

        setSelectedConversation((current) =>
          current && JSON.stringify(current) === JSON.stringify(updated)
            ? current
            : updated
        );
      } catch (error) {
        console.error(
          "Failed to refresh selected conversation:",
          error
        );
      }
    };

    const markSeen = async () => {
      try {
        await markMessagesSeen(
          selectedConversation.conversation_id,
          "advisor"
        );
      } catch (error) {
        console.error(
          "Failed to mark messages as seen:",
          error
        );
      }
    };

    markSeen();

    const interval = setInterval(async () => {
      await refreshSelectedConversation();
      await markSeen();
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedConversation?.conversation_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [selectedConversation?.messages.length]);

  const handleSelectConversation = (
    conversation: Conversation
  ) => {
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
  };

  const toggleConversationSelection = (
    conversationId: string
  ) => {
    setSelectedConversationIds((current) => {
      if (current.includes(conversationId)) {
        return current.filter(
          (id) => id !== conversationId
        );
      }

      return [...current, conversationId];
    });
  };

  const cancelChatDeleteMode = () => {
    setChatDeleteMode(false);
    setSelectedConversationIds([]);
    setShowListMenu(false);
  };

  const confirmSelectedConversationsDeletion =
    async () => {
      if (
        selectedConversationIds.length === 0 ||
        loading
      ) {
        return;
      }

      const confirmed = window.confirm(
        `Delete ${selectedConversationIds.length} selected chat${
          selectedConversationIds.length === 1
            ? ""
            : "s"
        } from the advisor list?`
      );

      if (!confirmed) return;

      try {
        setLoading(true);

        await deleteSelectedConversations(
          selectedConversationIds
        );

        if (
          selectedConversation &&
          selectedConversationIds.includes(
            selectedConversation.conversation_id
          )
        ) {
          setSelectedConversation(null);
          setShowMobileChat(false);
        }

        setChatDeleteMode(false);
        setSelectedConversationIds([]);
      } catch (error) {
        console.error(
          "Failed to delete selected conversations:",
          error
        );

        alert("Failed to delete selected chats.");
      } finally {
        setLoading(false);
      }
    };

  const handleSendMessage = async () => {
    if (
      !selectedConversation ||
      !message.trim() ||
      loading
    ) {
      return;
    }

    try {
      setLoading(true);

      const updated = await sendAdvisorMessage(
        selectedConversation.conversation_id,
        message.trim()
      );

      setSelectedConversation(updated);
      setMessage("");

      await loadConversations();
    } catch (error) {
      console.error(
        "Failed to send advisor message:",
        error
      );

      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (currentMessage: Message) => {
    if (
      currentMessage.sender !== "advisor" ||
      currentMessage.deleted
    ) {
      return;
    }

    setEditingMessageId(
      currentMessage.message_id
    );

    setEditingText(currentMessage.text);
    setOpenMessageMenu(null);
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
        "advisor"
      );

      setSelectedConversation(updated);
      cancelEditing();
    } catch (error) {
      console.error(
        "Failed to edit message:",
        error
      );

      alert("Failed to edit message.");
    } finally {
      setLoading(false);
    }
  };

  const deleteOneMessage = async (
    currentMessage: Message
  ) => {
    if (
      !selectedConversation ||
      currentMessage.sender !== "advisor" ||
      currentMessage.deleted ||
      loading
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Delete this message?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const updated = await deleteMessage(
        selectedConversation.conversation_id,
        currentMessage.message_id,
        "advisor"
      );

      setSelectedConversation(updated);
      setOpenMessageMenu(null);
    } catch (error) {
      console.error(
        "Failed to delete message:",
        error
      );

      alert("Failed to delete message.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMessageSelection = (
    currentMessage: Message
  ) => {
    if (
      currentMessage.sender !== "advisor" ||
      currentMessage.deleted
    ) {
      return;
    }

    setSelectedMessageIds((current) => {
      if (
        current.includes(currentMessage.message_id)
      ) {
        return current.filter(
          (id) => id !== currentMessage.message_id
        );
      }

      return [
        ...current,
        currentMessage.message_id,
      ];
    });
  };

  const cancelDeleteMode = () => {
    setDeleteMode(false);
    setSelectedMessageIds([]);
    setShowListMenu(false);
  };

  const confirmSelectedDeletion = async () => {
    if (
      !selectedConversation ||
      selectedMessageIds.length === 0 ||
      loading
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedMessageIds.length} selected message${
        selectedMessageIds.length === 1 ? "" : "s"
      }?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const updated = await deleteSelectedMessages(
        selectedConversation.conversation_id,
        selectedMessageIds,
        "advisor"
      );

      setSelectedConversation(updated);
      cancelDeleteMode();
    } catch (error) {
      console.error(
        "Failed to delete selected messages:",
        error
      );

      alert("Failed to delete selected messages.");
    } finally {
      setLoading(false);
    }
  };

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
        facility
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
      console.error(
        "Failed to recommend facility:",
        error
      );

      alert("Failed to recommend facility.");
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
              "Added by advisor during a conversation.",
          },
          token
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
        console.error(
          "Failed to save facility to MongoDB:",
          error
        );
      }
    }

    await handleRecommendFacility(customFacility);
  };

  const latestMessage = (
    conversation: Conversation
  ) => {
    if (conversation.messages.length === 0) {
      return "No messages yet";
    }

    const last =
      conversation.messages[
        conversation.messages.length - 1
      ];

    if (last.deleted) {
      return "Message deleted";
    }

    return last.text;
  };

  const latestMessageTime = (
    conversation: Conversation
  ) => {
    if (conversation.messages.length === 0) {
      return "";
    }

    const last =
      conversation.messages[
        conversation.messages.length - 1
      ];

    return new Date(
      last.timestamp
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredFacilities =
    facilities.filter((facility) => {
      const query =
        facilitySearch.trim().toLowerCase();

      if (!query) return true;

      return (
        facility.facility_id
          .toLowerCase()
          .includes(query) ||
        facility.facility_name
          .toLowerCase()
          .includes(query) ||
        facility.location
          .toLowerCase()
          .includes(query)
      );
    });

  const sessionDisplay =
    selectedConversation?.session_id ||
    "SafeLink user";

  return (
    <div className="h-screen w-full overflow-hidden bg-[#f7f5f6] text-[#3e1919]">
      <div className="mx-auto flex h-full w-full max-w-[1600px] overflow-hidden bg-[#f7f5f6]">

        <aside
          className={`${
            showMobileChat ? "hidden" : "flex"
          } h-full w-full flex-col border-r border-[#f0e2d6] bg-[#3e1919] md:flex md:w-[350px] lg:w-[390px]`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-[#f0e2d6]/20 px-5 py-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-[#f7f5f6]">
                SafeLink
              </h1>

              <p className="mt-0.5 text-xs text-[#a79093]">
                Advisor conversations
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setShowListMenu((current) => !current)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-[#f0e2d6] transition hover:bg-[#f0e2d6] hover:text-[#3e1919]"
                aria-label="Conversation list menu"
              >
                ⋮
              </button>

              {showListMenu && (
                <div className="absolute right-0 top-12 z-30 w-56 overflow-hidden rounded-2xl border border-[#f0e2d6] bg-white shadow-2xl">
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
                        className="w-full px-4 py-3 text-left text-sm font-medium text-[#3e1919] transition hover:bg-[#f0e2d6]"
                      >
                        Delete chats
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
                        className="w-full px-4 py-3 text-left text-sm font-medium text-[#3e1919] transition hover:bg-[#f0e2d6]"
                      >
                        Delete messages
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={cancelChatDeleteMode}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-[#3e1919] transition hover:bg-[#f0e2d6]"
                    >
                      Cancel selection
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {chatDeleteMode && (
            <div className="flex shrink-0 items-center justify-between border-b border-[#f0e2d6]/20 bg-[#f0e2d6] px-4 py-3">
              <span className="text-sm font-medium text-[#3e1919]">
                {selectedConversationIds.length} selected
              </span>

              <button
                type="button"
                disabled={
                  selectedConversationIds.length === 0 ||
                  loading
                }
                onClick={
                  confirmSelectedConversationsDeletion
                }
                className="rounded-full bg-[#3e1919] px-3 py-1.5 text-xs font-semibold text-[#f7f5f6] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete selected
              </button>
            </div>
          )}

          {deleteMode && (
            <div className="flex shrink-0 items-center justify-between border-b border-[#f0e2d6]/20 bg-[#f0e2d6] px-4 py-3">
              <span className="text-sm font-medium text-[#3e1919]">
                {selectedMessageIds.length} selected
              </span>

              <button
                type="button"
                disabled={
                  selectedMessageIds.length === 0 || loading
                }
                onClick={confirmSelectedDeletion}
                className="rounded-full bg-[#3e1919] px-3 py-1.5 text-xs font-semibold text-[#f7f5f6] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete selected
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto bg-[#3e1919]">
            {conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#f0e2d6]/20 bg-[#f0e2d6]/10 text-xl text-[#a79093]">
                  ✦
                </div>

                <p className="font-semibold text-[#f7f5f6]">
                  No conversations yet
                </p>

                <p className="mt-1 text-sm leading-6 text-[#a79093]">
                  New SafeLink support requests will appear here.
                </p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const isSelected =
                  selectedConversation?.conversation_id ===
                  conversation.conversation_id;

                const isChatSelected =
                  selectedConversationIds.includes(
                    conversation.conversation_id
                  );

                return (
                  <button
                    key={conversation.conversation_id}
                    type="button"
                    onClick={() => {
                      if (chatDeleteMode) {
                        toggleConversationSelection(
                          conversation.conversation_id
                        );
                        return;
                      }

                      handleSelectConversation(conversation);
                    }}
                    className={`flex w-full gap-3 border-b border-[#f0e2d6]/20 px-4 py-4 text-left transition ${
                      isChatSelected
                        ? "bg-[#f0e2d6] text-[#3e1919]"
                        : isSelected
                        ? "bg-[#a79093] text-[#f7f5f6]"
                        : "text-[#f7f5f6] hover:bg-[#f0e2d6]/20"
                    }`}
                  >
                    {chatDeleteMode && (
                      <div
                        className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs ${
                          isChatSelected
                            ? "border-[#3e1919] bg-[#3e1919] text-[#f7f5f6]"
                            : "border-[#f0e2d6]/50 bg-[#f0e2d6]/10 text-[#f7f5f6]"
                        }`}
                      >
                        {isChatSelected ? "✓" : ""}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p
                          className={`truncate font-semibold ${
                            isChatSelected
                              ? "text-[#3e1919]"
                              : "text-[#f7f5f6]"
                          }`}
                        >
                          {conversation.session_id}
                        </p>

                        <span
                          className={`shrink-0 text-[11px] ${
                            isChatSelected
                              ? "text-[#a79093]"
                              : "text-[#a79093]"
                          }`}
                        >
                          {latestMessageTime(conversation)}
                        </span>
                      </div>

                      <p
                        className={`mt-1 truncate font-mono text-[10px] ${
                          isChatSelected
                            ? "text-[#a79093]"
                            : "text-[#a79093]"
                        }`}
                      >
                        {conversation.conversation_id}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        <p
                          className={`min-w-0 flex-1 truncate text-sm ${
                            isChatSelected
                              ? "text-[#3e1919]/70"
                              : "text-[#f0e2d6]/70"
                          }`}
                        >
                          {latestMessage(conversation)}
                        </p>

                        {conversation.urgent && (
                          <span className="shrink-0 rounded-full bg-[#f0e2d6] px-2 py-0.5 text-[9px] font-bold text-[#3e1919]">
                            URGENT
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

        <main
          className={`${
            showMobileChat ? "flex" : "hidden"
          } relative h-full min-w-0 flex-1 flex-col bg-[#f7f5f6] md:flex`}
        >
          {!selectedConversation ? (
            <div className="hidden h-full flex-col items-center justify-center bg-[#f7f5f6] md:flex">
              <div className="max-w-sm px-8 text-center">
                <div className="mb-6 text-4xl text-[#a79093]">
                  ✦
                </div>

                <h2 className="text-xl font-semibold text-[#3e1919]">
                  SafeLink Advisor
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#a79093]">
                  Select a conversation to connect with a SafeLink user.
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="relative z-20 flex shrink-0 items-center gap-3 border-b border-[#f0e2d6] bg-white px-4 py-3 shadow-sm">
                <button
                  type="button"
                  onClick={() => setShowMobileChat(false)}
                  className="rounded-full p-2 text-xl text-[#3e1919] transition hover:bg-[#f0e2d6] md:hidden"
                  aria-label="Back to conversations"
                >
                  ←
                </button>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#3e1919]">
                    {sessionDisplay}
                  </p>

                  <p className="truncate font-mono text-[10px] text-[#a79093]">
                    {selectedConversation.conversation_id}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="hidden rounded-full bg-[#f0e2d6] px-3 py-1 text-[10px] font-semibold text-[#3e1919] sm:block">
                    <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#3e1919]" />
                    Connected
                  </span>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setShowHeaderMenu((current) => !current)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#a79093] transition hover:bg-[#f0e2d6] hover:text-[#3e1919]"
                      aria-label="Conversation menu"
                    >
                      ⋮
                    </button>

                    {showHeaderMenu && (
                      <div className="absolute right-0 top-11 z-40 w-52 overflow-hidden rounded-2xl border border-[#f0e2d6] bg-white shadow-2xl">
                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderMenu(false);
                            setDeleteMode(true);
                            setSelectedMessageIds([]);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-[#3e1919] transition hover:bg-[#f0e2d6]"
                        >
                          Delete messages
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderMenu(false);
                            setShowFacilities(true);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-[#3e1919] transition hover:bg-[#f0e2d6]"
                        >
                          Recommend facility
                        </button>

                        <div className="my-1 border-t border-[#f0e2d6]" />

                        <button
                          type="button"
                          onClick={() => {
                            setShowHeaderMenu(false);
                            setSelectedConversation(null);
                            setShowMobileChat(false);
                            setEditingMessageId(null);
                            setSelectedMessageIds([]);
                          }}
                          className="w-full px-4 py-3 text-left text-sm font-medium text-[#3e1919] transition hover:bg-[#f0e2d6]"
                        >
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </header>

              <div className="relative flex min-h-0 flex-1 flex-col bg-[#f7f5f6] p-0 md:p-6">
                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f7f5f6] text-[#3e1919] shadow-2xl md:rounded-[2rem] md:border md:border-[#f0e2d6]">
                  <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#3e1919_1px,transparent_1px)] [background-size:24px_24px]" />
                  </div>

                  <div className="relative flex-1 overflow-y-auto px-3 py-5 sm:px-6">
                    <div className="mx-auto flex max-w-4xl flex-col gap-2">
                      {selectedConversation.messages.map(
                        (currentMessage) => {
                          const isAdvisor =
                            currentMessage.sender === "advisor";

                          const isSelectedForDelete =
                            selectedMessageIds.includes(
                              currentMessage.message_id
                            );

                          if (currentMessage.deleted) {
                            return (
                              <div
                                key={currentMessage.message_id}
                                className={`flex ${
                                  isAdvisor
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div className="rounded-2xl border border-[#f0e2d6] bg-[#f0e2d6] px-4 py-2.5 text-sm italic text-[#a79093]">
                                  Message deleted
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={currentMessage.message_id}
                              className={`group flex ${
                                isAdvisor
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`flex max-w-[88%] flex-col sm:max-w-[70%] ${
                                  isAdvisor
                                    ? "items-end"
                                    : "items-start"
                                }`}
                              >
                                <div
                                  className={`relative flex items-end gap-1 ${
                                    isAdvisor
                                      ? "flex-row-reverse"
                                      : "flex-row"
                                  }`}
                                >
                                  {deleteMode && isAdvisor && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleMessageSelection(
                                          currentMessage
                                        )
                                      }
                                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs transition ${
                                        isSelectedForDelete
                                          ? "border-[#3e1919] bg-[#3e1919] text-[#f7f5f6]"
                                          : "border-[#a79093] bg-white text-[#3e1919]"
                                      }`}
                                      aria-label="Select message"
                                    >
                                      {isSelectedForDelete ? "✓" : ""}
                                    </button>
                                  )}

                                  <div
                                    className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
                                      isAdvisor
                                        ? "rounded-br-md bg-[#3e1919] text-[#f7f5f6]"
                                        : "rounded-bl-md bg-[#f0e2d6] text-[#3e1919]"
                                    } ${
                                      isSelectedForDelete
                                        ? "ring-2 ring-[#a79093]"
                                        : ""
                                    }`}
                                  >
                                    <p
                                      className={`mb-1 text-[11px] font-semibold ${
                                        isAdvisor
                                          ? "text-[#f0e2d6]"
                                          : "text-[#a79093]"
                                      }`}
                                    >
                                      {isAdvisor ? "Advisor" : "You"}
                                    </p>

                                    <div className="flex items-end gap-2">
                                      <p className="whitespace-pre-wrap break-words text-[14px] leading-6">
                                        {currentMessage.text}
                                      </p>

                                      {isAdvisor && !deleteMode && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setOpenMessageMenu((current) =>
                                              current ===
                                              currentMessage.message_id
                                                ? null
                                                : currentMessage.message_id
                                            )
                                          }
                                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-lg leading-none text-[#f0e2d6]/70 opacity-0 transition hover:bg-[#f0e2d6]/20 group-hover:opacity-100"
                                          aria-label="Message actions"
                                        >
                                          ⋮
                                        </button>
                                      )}
                                    </div>

                                    {isAdvisor && (
                                      <div className="mt-1 flex items-center justify-end">
                                        <span
                                          className={`text-[11px] font-semibold leading-none ${
                                            currentMessage.seen_at
                                              ? "text-[#a79093]"
                                              : "text-[#f0e2d6]/60"
                                          }`}
                                          title={
                                            currentMessage.seen_at
                                              ? "Seen"
                                              : "Sent"
                                          }
                                        >
                                          {currentMessage.seen_at
                                            ? "✓✓"
                                            : "✓"}
                                        </span>
                                      </div>
                                    )}

                                    {openMessageMenu ===
                                      currentMessage.message_id && (
                                      <div className="absolute bottom-8 right-0 z-30 w-32 overflow-hidden rounded-xl border border-[#f0e2d6] bg-white shadow-xl">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            startEditing(currentMessage)
                                          }
                                          className="w-full px-3 py-2.5 text-left text-xs text-[#3e1919] hover:bg-[#f0e2d6]"
                                        >
                                          Edit
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteOneMessage(currentMessage)
                                          }
                                          className="w-full px-3 py-2.5 text-left text-xs text-[#3e1919] hover:bg-[#f0e2d6]"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-1 px-1 text-[11px] text-[#a79093]">
                                  <span>
                                    {formatDate(currentMessage.timestamp)}
                                  </span>
                                  <span>·</span>
                                  <span>
                                    {formatTime(currentMessage.timestamp)}
                                  </span>

                                  {currentMessage.edited && (
                                    <>
                                      <span>·</span>
                                      <span>edited</span>
                                    </>
                                  )}

                                  {isAdvisor && !deleteMode && (
                                    <>
                                      <span>·</span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          startEditing(currentMessage)
                                        }
                                        className="hover:underline"
                                      >
                                        Edit
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}

                      {selectedConversation.recommendation && (
                        <div className="flex justify-end">
                          <div className="max-w-[88%] rounded-2xl border border-[#a79093] bg-[#f0e2d6] p-4 shadow-sm sm:max-w-[70%]">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#3e1919]">
                              ✓ Facility Recommended
                            </p>

                            <div className="mt-2 space-y-1 text-[13px] text-[#3e1919]">
                              <p className="font-mono text-[10px] text-[#a79093]">
                                For: {selectedConversation.session_id}
                              </p>

                              <p className="font-semibold">
                                {
                                  selectedConversation
                                    .recommendation
                                    .facility_name
                                }
                              </p>

                              <p className="text-[#a79093]">
                                {
                                  selectedConversation
                                    .recommendation
                                    .location
                                }
                              </p>

                              <p className="text-[#a79093]">
                                {
                                  selectedConversation
                                    .recommendation
                                    .contact
                                }
                              </p>

                              <p className="text-xs italic text-[#a79093]">
                                {
                                  selectedConversation
                                    .recommendation
                                    .notes
                                }
                              </p>

                              <p className="pt-1 font-mono text-[10px] text-[#a79093]">
                                From: {selectedConversation.advisor_id}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {editingMessageId && (
                    <div className="relative flex shrink-0 items-center justify-between border-t border-[#f0e2d6] bg-[#f0e2d6] px-4 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#3e1919]">
                          Editing message
                        </p>

                        <p className="truncate text-xs text-[#a79093]">
                          {editingText}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="ml-4 rounded-full px-3 py-1.5 text-xs font-medium text-[#3e1919] hover:bg-white"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="relative shrink-0 border-t border-[#f0e2d6] bg-white px-3 py-3 sm:px-5">
                    <div className="mx-auto flex max-w-4xl items-end gap-2">
                      <textarea
                        value={
                          editingMessageId ? editingText : message
                        }
                        onChange={(event) =>
                          editingMessageId
                            ? setEditingText(event.target.value)
                            : setMessage(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            !event.shiftKey
                          ) {
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
                            ? "Edit your message..."
                            : "Type a message..."
                        }
                        className="max-h-32 min-h-[46px] flex-1 resize-none rounded-2xl border border-[#f0e2d6] bg-[#f7f5f6] px-4 py-3 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#a79093] focus:ring-2 focus:ring-[#f0e2d6]"
                      />

                      {editingMessageId ? (
                        <button
                          type="button"
                          onClick={saveEditedMessage}
                          disabled={
                            loading || !editingText.trim()
                          }
                          className="flex h-11 shrink-0 items-center justify-center rounded-full bg-[#3e1919] px-5 text-sm font-semibold text-[#f7f5f6] transition hover:bg-[#a79093] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendMessage}
                          disabled={loading || !message.trim()}
                          className="flex h-11 shrink-0 items-center justify-center rounded-2xl bg-[#3e1919] px-5 text-sm font-semibold text-[#f7f5f6] transition hover:bg-[#a79093] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {loading ? "..." : "Send"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>

        {showFacilities && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3e1919]/50 p-4"
            onClick={() => {
              setShowFacilities(false);
              setShowCustomFacility(false);
              setFacilitySearch("");
            }}
          >
            <div
              className="max-h-[85vh] w-full max-w-xl overflow-hidden rounded-[2rem] bg-[#f7f5f6] shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#f0e2d6] px-5 py-4">
                <div>
                  <h3 className="font-semibold text-[#3e1919]">
                    Recommend a facility
                  </h3>

                  <p className="text-xs text-[#a79093]">
                    Choose a support facility for this user.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowFacilities(false);
                    setShowCustomFacility(false);
                    setFacilitySearch("");
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-[#a79093] hover:bg-[#f0e2d6] hover:text-[#3e1919]"
                  aria-label="Close facility panel"
                >
                  ×
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto p-5">
                <input
                  value={facilitySearch}
                  onChange={(event) =>
                    setFacilitySearch(event.target.value)
                  }
                  placeholder="Search facility..."
                  className="mb-4 w-full rounded-xl border border-[#f0e2d6] bg-white px-4 py-3 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#a79093] focus:ring-2 focus:ring-[#f0e2d6]"
                />

                <div className="space-y-3">
                  {filteredFacilities.length === 0 ? (
                    <div className="rounded-2xl bg-white p-5 text-center text-sm text-[#a79093]">
                      No facilities found.
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
                        className="w-full rounded-2xl border border-[#f0e2d6] bg-white p-4 text-left transition hover:border-[#a79093] hover:bg-[#f0e2d6] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <p className="font-mono text-xs font-semibold text-[#3e1919]">
                          {facility.facility_id}
                        </p>

                        <p className="mt-1 font-semibold text-[#3e1919]">
                          {facility.facility_name}
                        </p>

                        <p className="mt-1 text-sm text-[#a79093]">
                          {facility.location}
                        </p>

                        <p className="mt-1 text-xs text-[#a79093]">
                          {facility.contact}
                        </p>

                        <p className="mt-2 text-xs text-[#a79093]">
                          {facility.notes}
                        </p>
                      </button>
                    ))
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCustomFacility((current) => !current)
                  }
                  className="mt-4 w-full rounded-2xl border border-dashed border-[#a79093] bg-[#f0e2d6] px-4 py-3 text-sm font-semibold text-[#3e1919] hover:bg-[#a79093]/20"
                >
                  {showCustomFacility
                    ? "− Hide manual facility"
                    : "+ Add a facility manually"}
                </button>

                {showCustomFacility && (
                  <div className="mt-4 rounded-2xl border border-[#f0e2d6] bg-white p-4">
                    <p className="mb-3 font-semibold text-[#3e1919]">
                      New facility
                    </p>

                    <div className="space-y-2">
                      {(
                        [
                          ["facility_id", "Facility ID"],
                          ["facility_name", "Facility name"],
                          ["location", "Location"],
                          ["contact", "Contact"],
                          ["notes", "Notes"],
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
                          className="w-full rounded-xl border border-[#f0e2d6] bg-[#f7f5f6] px-3 py-2.5 text-sm text-[#3e1919] outline-none placeholder:text-[#a79093] focus:border-[#a79093]"
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
                      className="mt-3 w-full rounded-xl bg-[#3e1919] px-4 py-3 text-sm font-semibold text-[#f7f5f6] hover:bg-[#a79093] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loading
                        ? "Recommending..."
                        : "Recommend this facility"}
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