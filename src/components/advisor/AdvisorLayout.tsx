import { Outlet, useNavigate } from "react-router-dom";
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

export default function AdvisorLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("advisor_token");
    localStorage.removeItem("advisor_profile");

    navigate("/advisor/login");
  }

  return (
    <div className="min-h-screen bg-[#33484D]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[300px] flex-col bg-white px-5 py-9">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-4 px-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#19A7A0]">
            <Heart
              size={29}
              strokeWidth={2}
              className="text-white"
            />
          </div>

          <div>
            <h1 className="text-[25px] font-bold leading-none text-[#33484D]">
              SafeLink
            </h1>

            <p className="mt-2 text-[10px] font-bold tracking-[3px] text-[#19A7A0]">
              PRIVATE SUPPORT
            </p>
          </div>
        </div>

        {/* Navigation title */}
        <p className="mb-4 px-5 text-[12px] font-bold tracking-[2px] text-[#91A8AD]">
          YOUR SPACE
        </p>

        {/* Navigation */}
        <nav className="space-y-2">
          {/* Dashboard */}
          <SidebarLink
            label="Dashboard"
            icon={<Home size={21} />}
            onClick={() => navigate("/advisor/dashboard")}
          />

          {/* Advisor ↔ User Chat */}
          <SidebarLink
            label="Advisor User Chat"
            icon={<MessageSquare size={21} />}
            onClick={() => navigate("/advisor")}
          />

          {/* Advisor ↔ Admin Chat */}
          <SidebarLink
            label="Admin Chat"
            icon={<MessageCircle size={21} />}
            onClick={() => navigate("/advisor/messages")}
          />

          {/* Awareness */}
          <SidebarLink
            label="Awareness"
            icon={<Diamond size={21} />}
            onClick={() => navigate("/awareness")}
          />

          {/* Information */}
          <SidebarLink
            label="Information"
            icon={<Info size={21} />}
            onClick={() => navigate("/information")}
          />

          {/* Profile */}
          <SidebarLink
            label="Profile"
            icon={<User size={21} />}
            onClick={() => navigate("/advisor/profile")}
          />
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

      {/* Page content */}
      <main className="ml-[300px] min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

type SidebarLinkProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

function SidebarLink({
  label,
  icon,
  onClick,
}: SidebarLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-5 rounded-2xl px-5 py-5 text-left text-[17px] text-[#435D64] transition hover:bg-[#E4F5F3] hover:text-[#009F99]"
    >
      {icon}

      <span>{label}</span>
    </button>
  );
}