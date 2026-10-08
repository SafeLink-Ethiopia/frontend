import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  MessageCircle,
  Diamond,
  Info,
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
    label: "Dashboard",
    path: "/advisor/dashboard",
    icon: Home,
  },
  {
    label: "User Conversations",
    path: "/advisor",
    icon: MessageSquare,
    end: true,
  },
  {
    label: "Admin Chat",
    path: "/advisor/messages",
    icon: MessageCircle,
  },
  {
    label: "Awareness",
    path: "/advisor/awareness",
    icon: Diamond,
  },
  {
    label: "Information",
    path: "/advisor/information",
    icon: Info,
  },
  {
    label: "Profile",
    path: "/advisor/profile",
    icon: User,
  },
];

export default function AdvisorSidebar({
  mobileMenuOpen,
  onClose,
}: AdvisorSidebarProps) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("advisor_token");
    localStorage.removeItem("advisor_profile");
    navigate("/", { replace: true });
    onClose();
  }

  return (
    <aside
      aria-label="Advisor navigation"
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
          aria-label="Go to Advisor Dashboard"
        >
          <img
            src="/safelink-logo.png"
            alt="SafeLink logo"
            className="h-auto w-10 shrink-0 object-contain"
          />

          <span className="min-w-0">
            <span className="block text-[19px] font-bold leading-none text-[#173B28]">
              SafeLink
            </span>
            <span className="mt-1.5 block text-[8px] font-semibold tracking-[0.18em] text-[#7B8F82]">
              PRIVATE SUPPORT
            </span>
          </span>
        </button>
      </div>

      <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A9A90]">
        Your space
      </p>

      {/* Navigation */}
      <nav className="flex-1 space-y-1" aria-label="Advisor menu">
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
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Session note and logout */}
      <div className="mt-8 border-t border-[#E4ECE2] pt-4">
        <div className="mb-3 flex items-center gap-2 px-3 text-xs text-[#607568]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#2F8F4E]" />
          Advisor workspace
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#607568] transition-colors hover:bg-[#F4F7F2] hover:text-[#173B28] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]"
        >
          <LogOut size={18} strokeWidth={1.8} />
          <span>Logout</span>
        </button>
      </div>

      {/* Close button on mobile */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close advisor navigation"
        className="absolute right-3 top-3 rounded-lg p-2 text-[#607568] transition hover:bg-[#F4F7F2] hover:text-[#173B28] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E] lg:hidden"
      >
        <X size={18} />
      </button>
    </aside>
  );
}
