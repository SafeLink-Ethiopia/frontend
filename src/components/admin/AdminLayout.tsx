import { useEffect, useState } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <AdminSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#173B28]/35 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <main className="min-w-0 bg-[#FAFBF7] lg:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#DCE9D8] bg-[#FAFBF7]/95 px-4 py-3 backdrop-blur-md sm:px-6 lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
              <img
                src="/safelink-logo.png"
                alt="SafeLink logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#173B28]">
                SafeLink
              </p>
              <p className="text-[11px] text-[#718575]">Administration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 text-xs font-medium text-[#55705D] sm:inline-flex">
              <ShieldCheck size={14} className="text-[#2F8F4E]" aria-hidden="true" />
              Admin workspace
            </span>
            <button
              type="button"
              aria-label="Open admin navigation"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#176B3A] transition hover:bg-[#E7F1E3] focus:outline-none focus:ring-2 focus:ring-[#2F8F4E] focus:ring-offset-2"
            >
              <Menu size={21} aria-hidden="true" />
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
