import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFBF7]">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main area scrolls independently — sidebar never moves */}
      <main className="min-w-0 flex-1 overflow-y-auto">
        {/* Mobile hamburger bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#2F8F4E]/20 bg-[#FAFBF7]/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2F8F4E]/30 bg-white text-[#2F8F4E] shadow-sm transition hover:bg-[#E7F1E3]"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2F8F4E]">
              <span className="text-xs font-bold text-white">SL</span>
            </div>

            <span className="text-sm font-semibold text-[#176B3A]">
              Admin
            </span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
