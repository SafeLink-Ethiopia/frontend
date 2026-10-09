import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import QuickExit from "../QuickExit";
import { getUserConversations } from "../../api/conversationApi";
import UserSidebar from "./UserSidebar";
import { getSafelinkId } from "../../services/session";

function readSessionId(): string | null {
  const savedSession = localStorage.getItem("safelink_session");
  if (!savedSession) return null;

  try {
    return JSON.parse(savedSession)?.safelink_id ?? null;
  } catch (error) {
    console.error("Unable to read saved session:", error);
    return null;
  }
}

export default function UserLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const wasMenuOpen = useRef(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const hasSession = Boolean(getSafelinkId());

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const sessionId = readSessionId();
    if (!sessionId) {
      setUnreadMessages(0);
      return;
    }

    let cancelled = false;
    const loadUnreadMessages = async () => {
      try {
        const conversations = await getUserConversations(sessionId);
        const unreadCount = conversations.reduce(
          (total, conversation) =>
            total +
            conversation.messages.filter(
              (message) =>
                message.sender === "advisor" &&
                !message.deleted &&
                !message.seen_at,
            ).length,
          0,
        );

        if (!cancelled) setUnreadMessages(unreadCount);
      } catch (error) {
        console.error("Unable to load unread messages:", error);
      }
    };

    loadUnreadMessages();
    const interval = window.setInterval(loadUnreadMessages, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      if (wasMenuOpen.current) {
        wasMenuOpen.current = false;
        menuTriggerRef.current?.focus();
      }
      return;
    }

    wasMenuOpen.current = true;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    const sessionId = readSessionId();
    if (sessionId) {
      localStorage.removeItem(`safelink_selected_advisor_${sessionId}`);
    }
    localStorage.removeItem("safelink_session");
    setMobileMenuOpen(false);
    navigate("/login", { replace: true });
  };

  if (!hasSession) return <Outlet />;

  return (
    <div className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <UserSidebar
        mobileMenuOpen={mobileMenuOpen}
        unreadMessages={unreadMessages}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label={t("common.closeNavigation")}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#173B28]/35 lg:hidden"
        />
      )}

      <div className="min-w-0 lg:ml-[230px]">
        <header className="border-b border-[#DCE8D9] bg-white px-4 py-4 sm:px-5 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              ref={menuTriggerRef}
              aria-label={t("common.openNavigation")}
              aria-expanded={mobileMenuOpen}
              aria-controls="user-dashboard-sidebar"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-[#176B3A] transition hover:bg-[#F4F7F2]"
            >
              <Menu size={22} />
            </button>
            <img
              src="/safelink-logo.png"
              alt="SafeLink logo"
              className="h-9 w-auto object-contain"
            />
            <QuickExit />
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
