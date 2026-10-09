import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  MessageSquare,
  MessageCircle,
  Diamond,
  
  User,
  LogOut,
  X,
} from "lucide-react";

type AdvisorSidebarProps = {
  mobileMenuOpen: boolean;
  onClose: () => void;
};

const navigationLinks = [
  {
    label: "dashboard",
    path: "/advisor/dashboard",
    icon: Home,
  },
  {
    label: "userConversations",
    path: "/advisor",
    icon: MessageSquare,
    end: true,
  },
  {
    label: "adminChat",
    path: "/advisor/messages",
    icon: MessageCircle,
  },
  {
    label: "awareness",
    path: "/advisor/awareness",
    icon: Diamond,
  },

  {
    label: "profile",
    path: "/advisor/profile",
    icon: User,
  },
];

export default function AdvisorSidebar({
  mobileMenuOpen,
  onClose,
}: AdvisorSidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleLogout() {
    localStorage.removeItem("advisor_token");
    localStorage.removeItem("advisor_profile");
    navigate("/", { replace: true });
    onClose();
  }

  return (
    <aside
      aria-label={t("advisorPortal.sidebar.navigation")}
      className={`fixed inset-y-0 left-0 z-50 h-screen flex-col overflow-y-auto border-r border-[#DCE8D9] bg-white px-4 py-6 transition-transform duration-200 lg:w-[230px] lg:translate-x-0 ${
        mobileMenuOpen
          ? "flex w-[min(85vw,300px)] shadow-xl lg:w-[230px]"
          : "hidden w-[230px] lg:flex"
      }`}
    >
      {/* SafeLink logo and brand */}
      <div className="mb-8 px-2 pt-1">
        <button
          type="button"
          onClick={() => {
            navigate("/advisor/dashboard");
            onClose();
          }}
          className="flex items-center gap-3 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E] focus-visible:ring-offset-2"
          aria-label={t("advisorPortal.sidebar.goToDashboard")}
        >
          <img
            src="/safelink-logo.png"
            alt={t("advisorPortal.sidebar.logoAlt")}
            className="h-auto w-10 shrink-0 object-contain"
          />

          <span className="min-w-0">
            <span className="block text-[19px] font-bold leading-none text-[#173B28]">
              SafeLink
            </span>
            <span className="mt-1.5 block text-[8px] font-semibold tracking-[0.18em] text-[#7B8F82]">
              {t("advisorPortal.common.privateSupport")}
            </span>
          </span>
        </button>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A9A90]">
        {t("advisorPortal.sidebar.yourSpace")}
      </p>

      {/* Navigation */}
      <nav className="flex-1 space-y-1" aria-label={t("advisorPortal.sidebar.menu")}>
        {navigationLinks.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end ?? false}
              onClick={onClose}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E] ${
                  isActive
                    ? "bg-[#E7F1E3] font-semibold text-[#176B3A]"
                    : "text-[#607568] hover:bg-[#F4F7F2] hover:text-[#173B28]"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{t(`advisorPortal.sidebar.links.${link.label}`)}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Session note and logout */}
      <div className="mt-8 border-t border-[#E4ECE2] pt-4">
        <div className="mb-3 flex items-center gap-2 px-3 text-xs text-[#607568]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#2F8F4E]" />
          {t("advisorPortal.sidebar.workspace")}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#607568] transition-colors hover:bg-[#F4F7F2] hover:text-[#173B28] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>{t("advisorPortal.sidebar.logout")}</span>
        </button>
      </div>

      {/* Close button on mobile */}
      <button
        type="button"
        onClick={onClose}
        aria-label={t("advisorPortal.sidebar.closeNavigation")}
        className="absolute right-3 top-3 rounded-lg p-2 text-[#607568] transition hover:bg-[#F4F7F2] hover:text-[#173B28] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E] lg:hidden"
      >
        <X size={18} />
      </button>
    </aside>
  );
}
