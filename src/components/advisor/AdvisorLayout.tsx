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
    <div className="min-h-screen bg-[#f7f5f6]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[300px] flex-col bg-[#3e1919] px-5 py-9">

        {/* Logo */}
        <div className="mb-10 flex items-center gap-4 px-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f0e2d6]">
            <Heart
              size={29}
              strokeWidth={2}
              className="text-[#3e1919]"
            />
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

        {/* Navigation title */}
        <p className="mb-4 px-5 text-[12px] font-bold tracking-[2px] text-[#a79093]">
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

      {/* Page content */}
      <main className="ml-[300px] min-h-screen bg-[#f7f5f6]">
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
      className="
        flex
        w-full
        items-center
        gap-5
        rounded-2xl
        px-5
        py-5
        text-left
        text-[17px]
        text-[#f0e2d6]
        transition
        hover:bg-[#f0e2d6]
        hover:text-[#3e1919]
      "
    >
      {icon}

      <span>{label}</span>
    </button>
  );
}