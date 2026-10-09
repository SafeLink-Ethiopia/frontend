import {
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Megaphone,
  UserRoundPlus,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type AdminSidebarProps = {
  mobileMenuOpen: boolean;
  onClose: () => void;
};

const navItems = [
  {
    labelKey: "admin.navigation.dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    labelKey: "admin.navigation.awareness",
    path: "/admin/awareness",
    icon: Megaphone,
  },
  {
    labelKey: "admin.navigation.createAdvisor",
    path: "/admin/advisors/create",
    icon: UserRoundPlus,
  },
  {
    labelKey: "admin.navigation.advisors",
    path: "/admin/advisors",
    icon: UsersRound,
  },
  {
    labelKey: "admin.navigation.messages",
    path: "/admin/messages",
    icon: MessageSquare,
  },
];

export default function AdminSidebar({
  mobileMenuOpen,
  onClose,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      if (token) {
        await fetch("https://backend-tncs.onrender.com/api/admin/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");
      navigate("/", { replace: true });
    }
  };

  return (
    <aside
      aria-label={t("admin.navigation.sidebar")}
      className={`${
        mobileMenuOpen
          ? "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,88vw)] shadow-xl"
          : "fixed inset-y-0 left-0 z-30 hidden w-64 lg:flex"
      } h-screen shrink-0 flex-col overflow-y-auto border-r border-[#DCE9D8] bg-white text-[#173B28]`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-[#E5ECE2] px-5 py-6 sm:px-6">
        <button
          type="button"
          onClick={() => {
            navigate("/admin/dashboard");
            onClose();
          }}
          className="flex min-w-0 items-center gap-3 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2"
          aria-label={t("admin.navigation.goToDashboard")}
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
            <img
              src="/safelink-logo.png"
              alt={t("admin.brand.logoAlt")}
              className="h-full w-full object-contain"
            />
          </span>
          <span className="min-w-0">
            <span className="block text-xl font-semibold tracking-tight text-[#173B28]">
              SafeLink
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#718575]">
              {t("admin.brand.privateSupport")}
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onClose}
          aria-label={t("admin.layout.closeNavigation")}
          className="ml-2 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#55705D] transition hover:bg-[#E7F1E3] hover:text-[#176B3A] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] lg:hidden"
        >
          <X size={19} aria-hidden="true" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-7" aria-label={t("admin.navigation.label")}>
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#718575]">
          {t("admin.navigation.management")}
        </p>

        <div className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex min-h-12 items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] ${
                    isActive
                      ? "bg-[#E7F1E3] font-semibold text-[#176B3A]"
                      : "font-medium text-[#55705D] hover:bg-[#F3F7F0] hover:text-[#176B3A]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={19}
                      strokeWidth={isActive ? 2.1 : 1.8}
                      className={`shrink-0 ${
                        isActive
                          ? "text-[#176B3A]"
                          : "text-[#718575] transition group-hover:text-[#176B3A]"
                      }`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">{t(item.labelKey)}</span>
                    {isActive && (
                      <ChevronRight
                        size={15}
                        className="shrink-0 text-[#2F8F4E]"
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Account and logout */}
      <div className="border-t border-[#E5ECE2] px-4 py-5">
        <div className="mb-4 flex items-center gap-2.5 px-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#2F8F4E]" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#55705D]">{t("admin.brand.workspace")}</p>
            <p className="mt-0.5 truncate text-xs text-[#718575]">
              {t("admin.navigation.manageSafeLink")}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="group inline-flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium text-[#55705D] transition hover:bg-[#F3F7F0] hover:text-[#176B3A] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2"
        >
          <LogOut
            size={18}
            className="shrink-0 text-[#718575] transition group-hover:text-[#176B3A]"
            aria-hidden="true"
          />
          {t("admin.navigation.logOut")}
        </button>
      </div>
    </aside>
  );
}
