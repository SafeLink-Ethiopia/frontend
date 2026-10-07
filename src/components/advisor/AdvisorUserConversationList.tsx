import { useEffect, useState } from "react";
import { Clock, MessageCircle, User } from "lucide-react";
import axios from "axios";
import AdvisorUserChat from "./AdvisorUserChat";

type AdvisorType = "general" | "legal" | "medical" | "psychological";

interface Message {
  message_id: string;
  sender: "user" | "advisor";
  text: string;
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
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
  advisorId: string;
}

export default function AdvisorUserConversationList({
  advisorId,
}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(
    [],
  );

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /*
   * -----------------------------------------------
   * LOAD CONVERSATIONS
   * -----------------------------------------------
   */
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "/api/advisor/user-conversations",
      );

      setConversations(response.data.conversations || []);
    } catch (error: any) {
      console.error(
        "Error loading advisor conversations:",
        error,
      );

      setError(
        error.response?.data?.message ||
          "Failed to load conversations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  /*
   * -----------------------------------------------
   * FORMAT TIME
   * -----------------------------------------------
   */
  const formatTime = (timestamp?: string) => {
    if (!timestamp) {
      return "";
    }

    return new Date(timestamp).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * -----------------------------------------------
   * GET LAST MESSAGE
   * -----------------------------------------------
   */
  const getLastMessage = (conversation: Conversation) => {
    if (
      !conversation.messages ||
      conversation.messages.length === 0
    ) {
      return "No messages yet";
    }

    const lastMessage =
      conversation.messages[
        conversation.messages.length - 1
      ];

    if (lastMessage.deleted) {
      return "Message deleted";
    }

    return lastMessage.text;
  };

  /*
   * -----------------------------------------------
   * OPEN CHAT
   * -----------------------------------------------
   */
  if (selectedConversationId) {
    return (
      <AdvisorUserChat
        conversationId={selectedConversationId}
        advisorId={advisorId}
        onBack={() => {
          setSelectedConversationId(null);
          loadConversations();
        }}
      />
    );
  }

  /*
   * -----------------------------------------------
   * LOADING
   * -----------------------------------------------
   */
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#f7f5f6]">
        <p className="text-sm text-[#a79093]">
          Loading conversations...
        </p>
      </div>
    );
  }

  /*
   * -----------------------------------------------
   * PAGE
   * -----------------------------------------------
   */
  return (
    <div className="flex h-full flex-col bg-[#f7f5f6]">

      {/* Header */}
      <div className="border-b border-[#f0e2d6] bg-white px-6 py-4">
        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e2d6]">
            <MessageCircle className="h-5 w-5 text-[#3e1919]" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#3e1919]">
              User Conversations
            </h2>

            <p className="text-sm text-[#a79093]">
              Conversations assigned to you
            </p>
          </div>

        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 rounded-lg border border-[#a79093]/30 bg-[#f0e2d6] p-3 text-sm text-[#3e1919]">
          {error}

          <button
            onClick={loadConversations}
            className="ml-3 font-medium text-[#3e1919] underline transition hover:text-[#a79093]"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!error && conversations.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">

          <MessageCircle className="mb-3 h-10 w-10 text-[#a79093]" />

          <h3 className="font-medium text-[#3e1919]">
            No conversations yet
          </h3>

          <p className="mt-1 text-sm text-[#a79093]">
            Users assigned to you will appear here.
          </p>

        </div>
      )}

      {/* Conversations */}
      {!error && conversations.length > 0 && (
        <div className="flex-1 divide-y divide-[#f0e2d6] overflow-y-auto">

          {conversations.map((conversation) => (
            <button
              key={conversation.conversation_id}
              onClick={() =>
                setSelectedConversationId(
                  conversation.conversation_id,
                )
              }
              className="
                flex
                w-full
                items-center
                gap-4
                px-6
                py-4
                text-left
                transition
                hover:bg-[#f0e2d6]/60
              "
            >

              {/* User avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f0e2d6]">
                <User className="h-6 w-6 text-[#3e1919]" />
              </div>

              {/* Information */}
              <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between gap-3">

                  <span className="font-medium text-[#3e1919]">
                    User {conversation.session_id}
                  </span>

                  {conversation.updatedAt && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-[#a79093]">
                      <Clock className="h-3 w-3" />

                      {formatTime(
                        conversation.updatedAt,
                      )}
                    </span>
                  )}

                </div>

                <div className="mt-1 flex items-center gap-2">

                  {/* Advisor type */}
                  <span className="rounded-full bg-[#f0e2d6] px-2 py-0.5 text-xs font-medium capitalize text-[#3e1919]">
                    {conversation.advisor_type}
                  </span>

                  {/* Status */}
                  <span
                    className={`
                      rounded-full
                      px-2
                      py-0.5
                      text-xs
                      ${
                        conversation.status === "active"
                          ? "bg-[#3e1919] text-[#f0e2d6]"
                          : "bg-[#a79093]/20 text-[#a79093]"
                      }
                    `}
                  >
                    {conversation.status}
                  </span>

                </div>

                <p className="mt-2 truncate text-sm text-[#a79093]">
                  {getLastMessage(conversation)}
                </p>

              </div>
            </button>
          ))}

        </div>
      )}
    </div>
  );
}