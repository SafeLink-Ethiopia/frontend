
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Edit3,
  MoreVertical,
  Send,
  Trash2,
  WifiOff,
  X,
} from "lucide-react";

import socket from "../../services/socket";

/* =========================================================
   TYPES
========================================================= */

interface Message {
  message_id: string;
  sender: "admin" | "advisor" | "user";
  text: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  deleted_at?: string | null;
  delivered_at?: string | null;
  seen_at?: string | null;
}

interface Conversation {
  conversation_id: string;
  session_id: string;
  advisor_id: string;
  advisor_type?: string;
  urgent?: boolean;
  hidden_for_advisor?: boolean;
  hidden_for_user?: boolean;
  created_at?: string;
  messages: Message[];
}

/* =========================================================
   CONSTANTS
========================================================= */

const API_URL = "http://localhost:5000";

/* =========================================================
   COMPONENT
========================================================= */

interface AdvisorAdminChatProps {
  onBack?: () => void;
}

function AdvisorAdminChat({ onBack }: AdvisorAdminChatProps) {
  /* =======================================================
     GET CONVERSATION ID FROM URL

     Route:
     /advisor/messages/:conversationId
  ======================================================= */

  const { conversationId } = useParams<{
    conversationId: string;
  }>();

  /* =======================================================
     STATE
  ======================================================= */

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [messageText, setMessageText] = useState("");

  const [editingMessageId, setEditingMessageId] =
    useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const [menuMessageId, setMenuMessageId] =
    useState<string | null>(null);

  const [deleteMenuId, setDeleteMenuId] =
    useState<string | null>(null);

  const [isConnected, setIsConnected] =
    useState(socket.connected);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  /* =======================================================
     CURRENT CONVERSATION ID
  ======================================================= */

  const currentConversationId = useMemo(
    () =>
      conversation?.conversation_id ||
      conversationId ||
      "",
    [conversation?.conversation_id, conversationId],
  );

  /* =========================================================
     LOAD CONVERSATION
  ========================================================= */

  useEffect(() => {
    const loadConversation = async () => {
      try {
        setLoading(true);
        setError("");

        /* -----------------------------------------------
           Make sure URL contains conversation ID
        ----------------------------------------------- */

        if (!conversationId) {
          throw new Error(
            "Conversation ID is missing from the URL.",
          );
        }

        /* -----------------------------------------------
           Check advisor authentication
        ----------------------------------------------- */

        const token =
          localStorage.getItem("advisor_token");

        if (!token) {
          window.location.href = "/advisor/login";
          return;
        }

        /* -----------------------------------------------
           Request conversation
        ----------------------------------------------- */

        const response = await fetch(
          `${API_URL}/api/advisor/admin-conversations/${conversationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorText = await response.text();

          console.error(
            "Conversation API error:",
            response.status,
            errorText,
          );

          throw new Error(
            `Failed to load conversation (${response.status})`,
          );
        }

        const data = await response.json();

        console.log(
          "[AdvisorAdminChat] Conversation loaded:",
          data,
        );

        setConversation(
          data.conversation || data,
        );
      } catch (err) {
        console.error(
          "Failed to load conversation:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load this conversation.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  /* =========================================================
     SOCKET CONNECTION
  ========================================================= */

  useEffect(() => {
    const handleConnect = () => {
      console.log(
        "[AdvisorAdminChat] Socket connected:",
        socket.id,
      );

      setIsConnected(true);

      if (currentConversationId) {
        console.log(
          "[AdvisorAdminChat] Joining conversation:",
          currentConversationId,
        );

        socket.emit(
          "join_conversation",
          currentConversationId,
        );
      }
    };

    const handleDisconnect = () => {
      console.log(
        "[AdvisorAdminChat] Socket disconnected",
      );

      setIsConnected(false);
    };

    const handleConnectError = (err: Error) => {
      console.error(
        "[AdvisorAdminChat] Socket connection error:",
        err,
      );

      setIsConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on(
      "connect_error",
      handleConnectError,
    );

    /* -------------------------------------------------------
       If socket is already connected
    ------------------------------------------------------- */

    if (
      socket.connected &&
      currentConversationId
    ) {
      socket.emit(
        "join_conversation",
        currentConversationId,
      );
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off(
        "disconnect",
        handleDisconnect,
      );
      socket.off(
        "connect_error",
        handleConnectError,
      );
    };
  }, [currentConversationId]);

  /* =========================================================
     SOCKET MESSAGE EVENTS
  ========================================================= */

  useEffect(() => {
    if (!currentConversationId) {
      return;
    }

    /* -------------------------------------------------------
       NEW MESSAGE
    ------------------------------------------------------- */

    const handleNewMessage = (
      message: Message,
    ) => {
      console.log(
        "[AdvisorAdminChat] New message:",
        message,
      );

      setConversation((prev) => {
        if (!prev) {
          return prev;
        }

        const alreadyExists =
          prev.messages.some(
            (existingMessage) =>
              existingMessage.message_id ===
              message.message_id,
          );

        if (alreadyExists) {
          return prev;
        }

        return {
          ...prev,
          messages: [
            ...prev.messages,
            message,
          ],
        };
      });

      /* -----------------------------------------------------
         Mark admin message delivered/read
      ----------------------------------------------------- */

      if (message.sender === "admin") {
        socket.emit("message_delivered", {
          conversation_id:
            currentConversationId,
          message_id: message.message_id,
          sender: "advisor",
        });

        socket.emit("message_read", {
          conversation_id:
            currentConversationId,
          message_id: message.message_id,
          sender: "advisor",
        });
      }
    };

    /* -------------------------------------------------------
       EDITED MESSAGE
    ------------------------------------------------------- */

    const handleEditedMessage = (
      message: Message,
    ) => {
      setConversation((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          messages: prev.messages.map(
            (item) =>
              item.message_id ===
              message.message_id
                ? message
                : item,
          ),
        };
      });
    };

    /* -------------------------------------------------------
       DELETE FOR ME
    ------------------------------------------------------- */

    const handleDeletedForMe = (data: {
      message_id: string;
    }) => {
      setConversation((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          messages: prev.messages.filter(
            (message) =>
              message.message_id !==
              data.message_id,
          ),
        };
      });
    };

    /* -------------------------------------------------------
       DELETE FOR EVERYONE
    ------------------------------------------------------- */

    const handleDeletedForEveryone = (
      message: Message,
    ) => {
      setConversation((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          messages: prev.messages.map(
            (item) =>
              item.message_id ===
              message.message_id
                ? message
                : item,
          ),
        };
      });
    };

    /* -------------------------------------------------------
       GENERIC MESSAGE DELETE
    ------------------------------------------------------- */

    const handleDeletedMessage = (
      message: Message,
    ) => {
      setConversation((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          messages: prev.messages.map(
            (item) =>
              item.message_id ===
              message.message_id
                ? message
                : item,
          ),
        };
      });
    };

    /* -------------------------------------------------------
       MESSAGE DELIVERED
    ------------------------------------------------------- */

    const handleMessageDelivered = (data: {
      message_id: string;
      delivered_at?: string;
    }) => {
      setConversation((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          messages: prev.messages.map(
            (message) =>
              message.message_id ===
              data.message_id
                ? {
                    ...message,
                    delivered_at:
                      data.delivered_at ||
                      new Date().toISOString(),
                  }
                : message,
          ),
        };
      });
    };

    /* -------------------------------------------------------
       MESSAGE READ
    ------------------------------------------------------- */

    const handleMessageRead = (data: {
      message_id: string;
      seen_at?: string;
    }) => {
      setConversation((prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          messages: prev.messages.map(
            (message) =>
              message.message_id ===
              data.message_id
                ? {
                    ...message,
                    seen_at:
                      data.seen_at ||
                      new Date().toISOString(),
                  }
                : message,
          ),
        };
      });
    };

    /* -------------------------------------------------------
       CONVERSATION DELETED
    ------------------------------------------------------- */

    const handleConversationDeleted = () => {
      if (onBack) {
        onBack();
      }
    };

    /* -------------------------------------------------------
       SOCKET ERROR
    ------------------------------------------------------- */

    const handleMessageError = (data: {
      message?: string;
    }) => {
      console.error(
        "[AdvisorAdminChat] Socket message error:",
        data,
      );

      if (data?.message) {
        setError(data.message);
      }
    };

    /* -------------------------------------------------------
       REGISTER LISTENERS
    ------------------------------------------------------- */

    socket.on(
      "new_message",
      handleNewMessage,
    );

    socket.on(
      "message_edited",
      handleEditedMessage,
    );

    socket.on(
      "message_deleted_for_me",
      handleDeletedForMe,
    );

    socket.on(
      "message_deleted_for_everyone",
      handleDeletedForEveryone,
    );

    socket.on(
      "message_deleted",
      handleDeletedMessage,
    );

    socket.on(
      "message_delivered",
      handleMessageDelivered,
    );

    socket.on(
      "message_read",
      handleMessageRead,
    );

    socket.on(
      "conversation_deleted",
      handleConversationDeleted,
    );

    socket.on(
      "message_error",
      handleMessageError,
    );

    /* -------------------------------------------------------
       CLEANUP
    ------------------------------------------------------- */

    return () => {
      socket.off(
        "new_message",
        handleNewMessage,
      );

      socket.off(
        "message_edited",
        handleEditedMessage,
      );

      socket.off(
        "message_deleted_for_me",
        handleDeletedForMe,
      );

      socket.off(
        "message_deleted_for_everyone",
        handleDeletedForEveryone,
      );

      socket.off(
        "message_deleted",
        handleDeletedMessage,
      );

      socket.off(
        "message_delivered",
        handleMessageDelivered,
      );

      socket.off(
        "message_read",
        handleMessageRead,
      );

      socket.off(
        "conversation_deleted",
        handleConversationDeleted,
      );

      socket.off(
        "message_error",
        handleMessageError,
      );
    };
  }, [
    currentConversationId,
    onBack,
  ]);

  /* =========================================================
     AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation?.messages]);

  /* =========================================================
     SEND MESSAGE
  ========================================================= */

  const sendMessage = () => {
    const text = messageText.trim();

    if (!text) {
      return;
    }

    if (!currentConversationId) {
      console.error(
        "Cannot send message: conversation ID missing.",
      );
      return;
    }

    socket.emit("send_message", {
      conversation_id:
        currentConversationId,
      sender: "advisor",
      text,
    });

    setMessageText("");
  };

  /* =========================================================
     KEYBOARD
  ========================================================= */

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  /* =========================================================
     START EDITING
  ========================================================= */

  const startEditing = (
    message: Message,
  ) => {
    setEditingMessageId(
      message.message_id,
    );

    setEditingText(message.text);

    setMenuMessageId(null);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  /* =========================================================
     CANCEL EDITING
  ========================================================= */

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  /* =========================================================
     SAVE EDITED MESSAGE
  ========================================================= */

  const saveEditedMessage = () => {
    const text = editingText.trim();

    if (
      !text ||
      !editingMessageId ||
      !currentConversationId
    ) {
      return;
    }

    socket.emit("edit_message", {
      conversation_id:
        currentConversationId,
      message_id: editingMessageId,
      sender: "advisor",
      text,
    });

    cancelEditing();
  };

  /* =========================================================
     DELETE MESSAGE
  ========================================================= */

  const deleteMessage = (
    messageId: string,
    deleteType: "me" | "everyone",
  ) => {
    if (!currentConversationId) {
      return;
    }

    socket.emit("delete_message", {
      conversation_id:
        currentConversationId,
      message_id: messageId,
      sender: "advisor",
      deleteType,
    });

    setDeleteMenuId(null);
    setMenuMessageId(null);
  };

  /* =========================================================
     HIDE CONVERSATION
  ========================================================= */

  const hideConversation = () => {
    if (!currentConversationId) {
      return;
    }

    socket.emit("delete_conversation", {
      conversation_id:
        currentConversationId,
      sender: "advisor",
    });
  };

  /* =========================================================
     MESSAGE STATUS
  ========================================================= */

  const renderMessageStatus = (
    message: Message,
  ) => {
    if (message.sender !== "advisor") {
      return null;
    }

    if (message.seen_at) {
      return (
        <CheckCheck
          size={14}
          className="text-[#2F8F4E]"
        />
      );
    }

    if (message.delivered_at) {
      return (
        <CheckCheck
          size={14}
          className="text-[#6B7280]"
        />
      );
    }

    return (
      <Check
        size={14}
        className="text-[#6B7280]"
      />
    );
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center bg-[#FAFBF7]">
        <div className="text-sm text-[#173B28]">
          Loading conversation...
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error && !conversation) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center bg-[#FAFBF7] px-6">
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-center">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="rounded-xl bg-[#2F8F4E] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#176B3A]"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  /* =========================================================
     NO CONVERSATION
  ========================================================= */

  if (!conversation) {
    return null;
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="flex h-full min-h-[600px] flex-col bg-[#FAFBF7]">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between border-b border-[#D7E7D3] bg-[#E7F1E3] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#173B28] transition hover:bg-white"
              title="Back"
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-[#173B28]">
              Admin Support
            </h2>

            <div className="flex items-center gap-2 text-xs text-[#4B6654]">
              <span>
                Conversation #
                {conversation.conversation_id}
              </span>

              {!isConnected && (
                <span className="flex items-center gap-1 text-red-600">
                  <WifiOff size={13} />
                  Offline
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={hideConversation}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#173B28] transition hover:bg-white"
          title="Hide conversation"
        >
          <X size={19} />
        </button>
      </div>

      {/* =====================================================
          ERROR BANNER
      ===================================================== */}

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
          {error}
        </div>
      )}

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
          {conversation.messages.length === 0 ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7F1E3] text-[#2F8F4E]">
                  <Send size={20} />
                </div>

                <p className="text-sm font-medium text-[#173B28]">
                  No messages yet
                </p>

                <p className="mt-1 text-xs text-[#6B7F70]">
                  Start the conversation with the admin.
                </p>
              </div>
            </div>
          ) : (
            conversation.messages.map(
              (message) => {
                const isAdvisor =
                  message.sender ===
                  "advisor";

                const isDeleted =
                  message.deleted;

                return (
                  <div
                    key={message.message_id}
                    className={`flex w-full ${
                      isAdvisor
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative flex max-w-[75%] items-end gap-2 ${
                        isAdvisor
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      {/* =================================================
                          MESSAGE BUBBLE

                          ADMIN / LEFT
                          → WHITE

                          ADVISOR / RIGHT
                          → MINT
                      ================================================= */}

                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          isAdvisor
                            ? "rounded-br-md bg-[#E7F1E3] text-[#173B28]"
                            : "rounded-bl-md border border-[#E7F1E3] bg-white text-[#173B28]"
                        }`}
                      >
                        {isDeleted ? (
                          <p className="text-sm italic text-[#7A8B7F]">
                            This message was
                            deleted
                          </p>
                        ) : (
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {message.text}
                          </p>
                        )}

                        <div
                          className={`mt-1.5 flex items-center gap-1 ${
                            isAdvisor
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <span className="text-[10px] text-[#718277]">
                            {new Date(
                              message.timestamp,
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute:
                                  "2-digit",
                              },
                            )}
                          </span>

                          {message.edited &&
                            !isDeleted && (
                              <span className="text-[10px] text-[#718277]">
                                edited
                              </span>
                            )}

                          {renderMessageStatus(
                            message,
                          )}
                        </div>
                      </div>

                      {/* =================================================
                          MESSAGE MENU
                      ================================================= */}

                      {isAdvisor &&
                        !isDeleted && (
                          <div className="relative">
                            <button
                              onClick={() =>
                                setMenuMessageId(
                                  menuMessageId ===
                                    message.message_id
                                    ? null
                                    : message.message_id,
                                )
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7F70] transition hover:bg-[#E7F1E3] hover:text-[#173B28]"
                              title="Message options"
                            >
                              <MoreVertical
                                size={16}
                              />
                            </button>

                            {menuMessageId ===
                              message.message_id && (
                              <div className="absolute right-0 top-8 z-20 w-36 overflow-hidden rounded-xl border border-[#D7E7D3] bg-white shadow-lg">
                                <button
                                  onClick={() =>
                                    startEditing(
                                      message,
                                    )
                                  }
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-[#173B28] transition hover:bg-[#E7F1E3]"
                                >
                                  <Edit3
                                    size={14}
                                  />
                                  Edit
                                </button>

                                <button
                                  onClick={() => {
                                    setDeleteMenuId(
                                      message.message_id,
                                    );

                                    setMenuMessageId(
                                      null,
                                    );
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2
                                    size={14}
                                  />
                                  Delete
                                </button>
                              </div>
                            )}

                            {/* =================================================
                                DELETE OPTIONS
                            ================================================= */}

                            {deleteMenuId ===
                              message.message_id && (
                              <div className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-[#D7E7D3] bg-white shadow-lg">
                                <button
                                  onClick={() =>
                                    deleteMessage(
                                      message.message_id,
                                      "me",
                                    )
                                  }
                                  className="w-full px-3 py-2.5 text-left text-xs text-[#173B28] transition hover:bg-[#E7F1E3]"
                                >
                                  Delete for me
                                </button>

                                <button
                                  onClick={() =>
                                    deleteMessage(
                                      message.message_id,
                                      "everyone",
                                    )
                                  }
                                  className="w-full px-3 py-2.5 text-left text-xs text-red-600 transition hover:bg-red-50"
                                >
                                  Delete for
                                  everyone
                                </button>

                                <button
                                  onClick={() =>
                                    setDeleteMenuId(
                                      null,
                                    )
                                  }
                                  className="w-full border-t border-[#E7F1E3] px-3 py-2.5 text-left text-xs text-[#6B7F70] transition hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                );
              },
            )
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* =====================================================
          EDITING BAR
      ===================================================== */}

      {editingMessageId && (
        <div className="border-t border-[#D7E7D3] bg-white px-4 py-2.5">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Edit3
                size={15}
                className="shrink-0 text-[#2F8F4E]"
              />

              <span className="truncate text-xs text-[#4B6654]">
                Editing message
              </span>
            </div>

            <button
              onClick={cancelEditing}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#6B7F70] transition hover:bg-[#E7F1E3]"
              title="Cancel editing"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="border-t border-[#D7E7D3] bg-[#E7F1E3] px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={
              editingMessageId
                ? editingText
                : messageText
            }
            onChange={(event) => {
              if (editingMessageId) {
                setEditingText(
                  event.target.value,
                );
              } else {
                setMessageText(
                  event.target.value,
                );
              }
            }}
            onKeyDown={(event) => {
              if (editingMessageId) {
                if (event.key === "Enter") {
                  event.preventDefault();
                  saveEditedMessage();
                }

                if (event.key === "Escape") {
                  cancelEditing();
                }

                return;
              }

              handleKeyDown(event);
            }}
            placeholder={
              editingMessageId
                ? "Edit your message..."
                : "Type a message..."
            }
            className="min-w-0 flex-1 rounded-xl border border-[#C8DDC4] bg-white px-4 py-3 text-sm text-[#173B28] outline-none transition placeholder:text-[#8A9B90] focus:border-[#2F8F4E] focus:ring-2 focus:ring-[#2F8F4E]/20"
          />

          {editingMessageId ? (
            <button
              onClick={saveEditedMessage}
              disabled={!editingText.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F8F4E] text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50"
              title="Save edited message"
            >
              <Check size={19} />
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!messageText.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#2F8F4E] text-white transition hover:bg-[#176B3A] disabled:cursor-not-allowed disabled:opacity-50"
              title="Send message"
            >
              <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdvisorAdminChat;


