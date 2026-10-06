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
} from "lucide-react";

export default function AdvisorSidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("advisor_token");
    localStorage.removeItem("advisor_profile");
    navigate("/advisor/login");
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[300px] flex-col bg-white px-5 py-9">

      {/* Logo */}
      {/* ...your existing logo code... */}

      <p className="mb-4 px-5 text-[12px] font-bold tracking-[2px] text-[#91A8AD]">
        YOUR SPACE
      </p>

      {/* 👇 ADD/REPLACE THE NAVIGATION HERE */}
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
            path: "/awareness",
            icon: Diamond,
          },
          {
            label: "Information",
            path: "/information",
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
              className={({ isActive }) =>
                `flex items-center gap-5 rounded-2xl px-5 py-5 text-[17px] transition ${
                  isActive
                    ? "bg-[#E4F5F3] text-[#009F99]"
                    : "text-[#435D64] hover:bg-[#F2F7F7]"
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
        className="mt-auto flex items-center gap-5 rounded-2xl px-5 py-4 text-[16px] text-[#435D64] transition hover:bg-[#F2F7F7]"
      >
        <LogOut size={20} />
        <span>Logout</span>
      </button>

    </aside>
  );
}