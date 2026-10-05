import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingConversations } from "../../api/advisorConversationApi";
import type { Conversation } from "../../api/conversationApi";

export default function UserConversations() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("advisor_token")) {
      navigate("/advisor/login");
      return;
    }

    const loadConversations = async () => {
      try {
        setConversations(await getPendingConversations());
      } catch (err) {
        console.error(err);
        setError("Failed to load user conversations.");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [navigate]);

  if (loading) {
    return <div>Loading conversations...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>User Conversations</h1>

      {conversations.length === 0 ? (
        <p>No user conversations yet.</p>
      ) : (
        <div>
          {conversations.map((conversation) => (
            <button
              key={conversation.conversation_id}
              onClick={() =>
                navigate(
                  `/advisor/user-messages/${conversation.conversation_id}`,
                )
              }
            >
              <div>
                <strong>{conversation.advisor_type} conversation</strong>
              </div>

              <div>
                {conversation.messages.length > 0
                  ? conversation.messages[conversation.messages.length - 1].text
                  : "No messages yet"}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
