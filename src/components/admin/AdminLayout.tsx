import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f7f5f6]">
      <AdminSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <main className="min-w-0 bg-[#f7f5f6] lg:ml-64">
        <header className="border-b border-[#a79093]/30 bg-[#f7f5f6] px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Open admin navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="rounded p-2 text-[#3e1919] hover:bg-[#f0e2d6]"
          >
            <Menu size={22} />
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}