import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar() {
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
    {
      label: "Dashboard",
      path: "/admin/dashboard",
    },
    {
      label: "Awareness",
      path: "/admin/awareness",
    },
    {
      label: "Create Advisor",
      path: "/admin/advisors/create",
    },
    {
      label: "Advisors",
      path: "/admin/advisors",
    },
    {
      label: "Messages",
      path: "/admin/messages",
    },
  ];

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[#3e1919] text-[#f7f5f6]">
      {/* Brand */}
      <div className="border-b border-[#a79093]/30 px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[#f0e2d6]/40 bg-[#f0e2d6] text-sm font-bold text-[#3e1919]">
            SL
          </div>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">SafeLink</h1>
            <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-[#a79093]">
              Administration
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-7">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a79093]">
          Management
        </p>

        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative block border-l-2 px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "border-[#f0e2d6] bg-[#f0e2d6]/10 text-[#f0e2d6]"
                    : "border-transparent text-[#f7f5f6]/75 hover:border-[#a79093] hover:bg-[#f0e2d6]/5 hover:text-[#f7f5f6]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-[#a79093]/30 px-4 py-5">
        <div className="mb-4 px-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#a79093]">
            Admin account
          </p>
          <p className="mt-1 text-sm text-[#f7f5f6]/80">
            Manage SafeLink
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full border border-[#f0e2d6]/40 px-4 py-3 text-sm font-medium text-[#f0e2d6] transition hover:bg-[#f0e2d6] hover:text-[#3e1919]"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}