import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  MessageCircle,
  Diamond,
  Heart,
  Info,
  User,
  LogOut,
  X,
} from "lucide-react";

type AdvisorSidebarProps = {
  mobileMenuOpen: boolean;
  onClose: () => void;
};

export default function AdvisorSidebar({
  mobileMenuOpen,
  onClose,
}: AdvisorSidebarProps) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("advisor_token");
    localStorage.removeItem("advisor_profile");
    navigate("/advisor/login");
  }

  return (
    <aside
      className={`${
        mobileMenuOpen
          ? "fixed inset-y-0 left-0 z-50 flex w-[min(85vw,300px)] shadow-xl"
          : "fixed inset-y-0 left-0 z-40 hidden w-[300px] lg:flex"
      } h-screen flex-col overflow-y-auto bg-[#3e1919] px-5 py-9`}
    >
      <div className="mb-10 flex items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e2d6]">
            <Heart size={29} strokeWidth={2} className="text-[#3e1919]" />
          </div>
          <div>
            <h1 className="text-[25px] font-bold leading-none text-[#f7f5f6]">
              SafeLink
            </h1>
            <p className="mt-2 text-[10px] font-bold tracking-[3px] text-[#a79093]">
              PRIVATE SUPPORT
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close advisor navigation"
          className="rounded-lg p-2 text-[#f0e2d6] hover:bg-[#f0e2d6]/10 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <p className="mb-4 px-5 text-[12px] font-bold tracking-[2px] text-[#a79093]">
        YOUR SPACE
      </p>

      {/* Navigation */}
      <nav className="space-y-2">
        {[
          {
            label: "Dashboard",
            path: "/advisor/dashboard",
            icon: Home,
          },
          {
            label: "User Conversations",
            path: "/advisor",
            icon: MessageSquare,
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
        ].map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/advisor"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-5 rounded-2xl px-5 py-5 text-[17px] transition ${
                  isActive
                    ? "bg-[#f0e2d6] text-[#3e1919]"
                    : "text-[#f0e2d6] hover:bg-[#f0e2d6]/80 hover:text-[#3e1919]"
                }`
              }
            >
              <Icon size={21} strokeWidth={1.7} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="
          mt-auto
          flex
          items-center
          gap-5
          rounded-2xl
          px-5
          py-4
          text-[16px]
          text-[#f0e2d6]
          transition
          hover:bg-[#f0e2d6]
          hover:text-[#3e1919]
        "
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>

    </aside>
  );
}