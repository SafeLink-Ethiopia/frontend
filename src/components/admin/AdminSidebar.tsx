import { NavLink, useNavigate } from "react-router-dom";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/safelink-logo.png"
      alt="SafeLink logo"
      className={`${className} object-contain`}
      draggable={false}
    />
  );
}

export default function AdminSidebar({
  isOpen = false,
  onClose,
}: AdminSidebarProps = {}) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      if (token) {
        await fetch("http://localhost:5000/api/admin/logout", {
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
      navigate("/admin/login", { replace: true });
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Awareness", path: "/admin/awareness" },
    { label: "Create Advisor", path: "/admin/advisors/create" },
    { label: "Advisors", path: "/admin/advisors", end: true },
    { label: "Messages", path: "/admin/messages" },
  ];

  const handleNavClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && onClose && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-[#173B28]/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/*
        Sidebar behavior:
        - Mobile: fixed, slides in/out via translate-x
        - Desktop: sticky, always visible, pinned to viewport height
        The aside itself has h-screen + its own internal scroll for nav.
      */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-[#2F8F4E]/20 bg-[#FAFBF7] text-[#173B28] shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand — pinned top */}
        <div className="shrink-0 border-b border-[#2F8F4E]/15 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center">
              <LogoMark className="h-8 w-8" />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-bold leading-none tracking-tight text-[#176B3A]">
                SafeLink
              </h1>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#2F8F4E]">
                Administration
              </p>
            </div>
          </div>
        </div>

        {/* Navigation — scrolls internally if too long */}
        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
            Management
          </p>

          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#2F8F4E] text-white shadow-md"
                      : "text-[#173B28]/70 hover:-translate-y-0.5 hover:bg-[#E7F1E3] hover:text-[#176B3A]"
                  }`
                }
              >
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom — pinned to bottom */}
        <div className="shrink-0 border-t border-[#2F8F4E]/15 px-4 py-5">
          <div className="mb-4 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
              Admin account
            </p>

            <p className="mt-1 truncate text-sm text-[#173B28]/70">
              Manage SafeLink
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-[#2F8F4E]/40 bg-white px-4 py-3 text-sm font-semibold text-[#2F8F4E] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2F8F4E] hover:bg-[#2F8F4E] hover:text-white"
          >
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}