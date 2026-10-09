import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, MessageCircle, Send, User } from "lucide-react";
import axios from "axios";
import socket from "../../services/socket";

type AdvisorType = "general" | "legal" | "medical" | "psychological";

interface Message {
  message_id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  deletedForEveryone?: boolean;
}

interface Conversation {
  conversation_id: string;
  session_id: string;
  advisor_id: string;
  advisor_type: AdvisorType;
  status: "active" | "closed";
  messages: Message[];
  createdAt?: string;
  updatedAt?: string;
}

interface Props {
  conversationId: string;
  advisorId: string;
  onBack?: () => void;
}

export default function AdvisorUserChat({
  conversationId,
  advisorId,
  onBack,
}: Props) {
  const { t } = useTranslation();
  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  const conversationIdRef = useRef(conversationId);

  /*
   * -----------------------------------------------
   * LOAD CONVERSATION
   * -----------------------------------------------
   */
  const loadConversation = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `/api/advisor/user-conversations/${conversationId}`,
      );

      const loadedConversation: Conversation =
        response.data.conversation;

      setConversation(loadedConversation);

      setMessages(loadedConversation.messages || []);
    } catch (error: any) {
      console.error("Error loading conversation:", error);

      setError(
        error.response?.data?.message ||
          t("conversation.loadError"),
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * -----------------------------------------------
   * SEND MESSAGE
   * -----------------------------------------------
   */
  const sendMessage = () => {
    const text = messageText.trim();

    if (
      !text ||
      !conversation ||
      conversation.status !== "active" ||
      sending
    ) {
      return;
    }

    setSending(true);

    socket.emit("advisor_user_send_message", {
      conversation_id: conversation.conversation_id,
      advisor_id: advisorId,
      text,
    });

    setMessageText("");

    setTimeout(() => {
      setSending(false);
    }, 300);
  };

  /*
   * -----------------------------------------------
   * RECEIVE MESSAGE
   * -----------------------------------------------
   */
  useEffect(() => {
    const handleMessage = (data: {
      conversation_id: string;
      message: Message;
    }) => {
      if (
        data.conversation_id !== conversationIdRef.current
      ) {
        return;
      }

      setMessages((previous) => {
        if (
          previous.some(
            (message) =>
              message.message_id ===
              data.message.message_id,
          )
        ) {
          return previous;
        }

        return [...previous, data.message];
      });
    };

    socket.on("user_advisor_message", handleMessage);

    return () => {
      socket.off("user_advisor_message", handleMessage);
    };
  }, []);

  /*
   * -----------------------------------------------
   * LOAD + JOIN SOCKET ROOM
   * -----------------------------------------------
   */
  useEffect(() => {
    conversationIdRef.current = conversationId;

    loadConversation();

    socket.emit("advisor_user_join", {
      conversation_id: conversationId,
      advisor_id: advisorId,
    });

    return () => {
      socket.emit(
        "advisor_user_leave",
        conversationId,
      );
    };
  }, [conversationId, advisorId]);

  /*
   * -----------------------------------------------
   * FORMAT TIME
   * -----------------------------------------------
   */
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * -----------------------------------------------
   * LOADING
   * -----------------------------------------------
   */
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f7f5f6]">
        <p className="text-sm text-[#a79093]">
          {t("conversation.loading")}
        </p>
      </div>
    );
  }

  /*
   * -----------------------------------------------
   * ERROR
   * -----------------------------------------------
   */
  if (error && !conversation) {
    return (
      <div className="flex h-full flex-col bg-[#f7f5f6]">
        <div className="border-b border-[#f0e2d6] p-4">
          {onBack && (
            <button
              onClick={onBack}
              className="
                rounded-lg
                p-2
                text-[#3e1919]
                transition
                hover:bg-[#f0e2d6]
              "
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="rounded-lg border border-[#a79093]/30 bg-[#f0e2d6] p-4 text-sm text-[#3e1919]">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return null;
  }

  /*
   * -----------------------------------------------
   * CHAT
   * -----------------------------------------------
   */
  return (
    <div className="flex h-full flex-col bg-[#f7f5f6]">

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#f0e2d6] bg-white px-4 py-3">

        {onBack && (
          <button
            onClick={onBack}
            className="
              rounded-lg
              p-2
              text-[#3e1919]
              transition
              hover:bg-[#f0e2d6]
            "
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e2d6]">
          <User className="h-5 w-5 text-[#3e1919]" />
        </div>

        <div>
          <h2 className="font-semibold text-[#3e1919]">
            {t("conversation.user")}
          </h2>

          <p className="text-xs text-[#a79093]">
            {t("conversation.sessionLabel", {
              session: conversation.session_id,
            })}
          </p>

          <p className="text-xs capitalize text-[#a79093]">
            {t(`conversation.advisor.${conversation.advisor_type}`, {
              defaultValue: conversation.advisor_type,
            })}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 rounded-lg border border-[#a79093]/30 bg-[#f0e2d6] p-3 text-sm text-[#3e1919]">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">

        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <MessageCircle className="mx-auto mb-2 h-8 w-8 text-[#a79093]" />

              <p className="text-sm text-[#a79093]">
                {t("conversation.noMessages")}
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isAdvisor =
            message.sender === "advisor";

          const isDeleted =
            message.deleted ||
            message.deletedForEveryone;

          return (
            <div
              key={message.message_id}
              className={`flex ${
                isAdvisor
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  isAdvisor
                    ? "rounded-br-md bg-[#3e1919] text-[#f7f5f6]"
                    : "rounded-bl-md bg-[#f0e2d6] text-[#3e1919]"
                }`}
              >
                <p
                  className={`whitespace-pre-wrap break-words text-sm ${
                    isDeleted
                      ? "italic opacity-70"
                      : ""
                  }`}
                >
                  {isDeleted
                    ? t("conversation.messageDeleted")
                    : message.text}
                </p>

                <div
                  className={`mt-1 text-[10px] ${
                    isAdvisor
                      ? "text-[#f0e2d6]"
                      : "text-[#a79093]"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      {conversation.status === "active" ? (
        <div className="border-t border-[#f0e2d6] bg-white p-3">

          <div className="flex items-end gap-2">

            <textarea
              value={messageText}
              onChange={(event) =>
                setMessageText(event.target.value)
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={t("conversation.writeMessage")}
              rows={1}
              className="
                max-h-32
                min-h-[42px]
                flex-1
                resize-none
                rounded-xl
                border
                border-[#f0e2d6]
                bg-[#f7f5f6]
                px-4
                py-2
                text-sm
                text-[#3e1919]
                outline-none
                transition
                placeholder:text-[#a79093]
                focus:border-[#a79093]
                focus:ring-2
                focus:ring-[#a79093]/20
              "
            />

            <button
              onClick={sendMessage}
              disabled={
                !messageText.trim() || sending
              }
              className="
                flex
                h-[42px]
                w-[42px]
                items-center
                justify-center
                rounded-xl
                bg-[#3e1919]
                text-[#f7f5f6]
                transition
                hover:bg-[#a79093]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <Send className="h-5 w-5" />
            </button>

          </div>

          <p className="mt-1 text-[11px] text-[#a79093]">
            {t("conversation.sendKeyboardHint")}
          </p>
        </div>
      ) : (
        <div className="border-t border-[#f0e2d6] bg-[#f0e2d6] p-4 text-center text-sm text-[#a79093]">
          {t("conversation.status.closed")}
        </div>
      )}
    </div>
  );
}