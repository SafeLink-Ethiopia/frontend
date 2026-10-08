import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import AdvisorSidebar from "./AdvisorSidebar";

export default function AdvisorLayout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#f7f5f6]">
      <AdvisorSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close advisor navigation"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}
      <main className="min-h-screen bg-[#f7f5f6] lg:ml-[300px]">
        <header className="flex items-center gap-3 border-b border-[#a79093]/25 bg-[#f7f5f6] px-4 py-3 lg:hidden">
          <button
            type="button"
            aria-label="Open advisor navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-[#3e1919] hover:bg-[#f0e2d6]"
          >
            <Menu size={22} />
          </button>
          <span className="font-bold text-[#3e1919]">SafeLink</span>
        </header>
        <Outlet />
      </main>
    </div>
  );
}