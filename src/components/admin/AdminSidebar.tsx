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
      label: "Reports",
      path: "/admin/reports",
    },

    {
      label: "Settings",
      path: "/admin/settings",
    },
  ];

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-[#126d85] text-white">
      {/* Logo / Title */}
      <div className="border-b border-white/20 p-6">
        <h1 className="text-2xl font-bold">SafeLink</h1>
        <p className="mt-1 text-sm text-white/70">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 font-medium transition ${
                  isActive
                    ? "bg-white text-[#126d85]"
                    : "text-white hover:bg-white/10"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/20 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full rounded-lg bg-red-500 px-4 py-3 font-medium text-white transition hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
