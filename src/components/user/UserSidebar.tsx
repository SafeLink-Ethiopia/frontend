import { NavLink } from "react-router-dom";
import {
  BookOpen,
  Info,
  LayoutDashboard,
  MessageCircle,
  User,
  X,
} from "lucide-react";
import QuickExit from "../QuickExit";

const navItems = [
  { label: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
  { label: "Profile", path: "/user/profile", icon: User },
  { label: "Advisor Chat", path: "/user/dashboard/chat", icon: MessageCircle },
  { label: "Awareness", path: "/awareness", icon: BookOpen },
  
];

type UserSidebarProps = {
  mobileMenuOpen: boolean;
  unreadMessages: number;
  onClose: () => void;
  onLogout: () => void;
};

export default function UserSidebar({
  mobileMenuOpen,
  unreadMessages,
  onClose,
  onLogout,
}: UserSidebarProps) {
  return (
    <aside
      id="user-dashboard-sidebar"
      aria-label="Dashboard navigation"
      className={`${
        mobileMenuOpen
          ? "fixed inset-y-0 left-0 z-50 flex w-[min(85vw,280px)] shadow-xl lg:z-30 lg:w-[230px] lg:shadow-none"
          : "fixed inset-y-0 left-0 z-30 hidden w-[230px] lg:flex"
      } shrink-0 flex-col overflow-y-auto border-r border-[#DCE8D9] bg-white`}
    >
      <div className="flex items-center justify-between px-5 pb-7 pt-7">
        <NavLink
          to="/user/dashboard"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <img
            src="/safelink-logo.png"
            alt="SafeLink logo"
            className="h-auto w-10 object-contain"
          />
          <span className="text-left">
            <span className="block text-[19px] font-bold leading-none text-[#173B28]">
              SafeLink
            </span>
            <span className="mt-1 block text-[8px] font-semibold tracking-[0.18em] text-[#7B8F82]">
              PRIVATE SUPPORT
            </span>
          </span>
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="rounded-lg p-2 text-[#607568] transition hover:bg-[#F4F7F2] hover:text-[#173B28] lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8A9A90]">
          Your space
        </p>
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            onClick={onClose}
            className={({ isActive }) =>
              `mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                isActive
                  ? "bg-[#E7F1E3] font-semibold text-[#176B3A]"
                  : "text-[#607568] hover:bg-[#F4F7F2] hover:text-[#173B28]"
              }`
            }
          >
            <Icon size={18} />
            <span className="flex-1 text-left">{label}</span>
            {label === "Advisor Chat" && unreadMessages > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2F8F4E] px-1.5 text-[9px] font-bold text-white">
                {unreadMessages > 9 ? "9+" : unreadMessages}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 pb-6">
        <div className="mt-4">
          <QuickExit />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[#DCE8D9] px-3 py-3 text-sm font-semibold text-[#607568] transition hover:border-[#AFCDAF] hover:bg-[#F4F7F2] hover:text-[#173B28] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2"
        >
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
