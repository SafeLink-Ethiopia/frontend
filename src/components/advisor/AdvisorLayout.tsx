import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdvisorSidebar from "./AdvisorSidebar";

export default function AdvisorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      <AdvisorSidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label={t("advisorPortal.layout.closeNavigationOverlay")}
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-[#173B28]/35 lg:hidden"
        />
      )}

      {/* Sidebar stays fixed; route content changes inside this area. */}
      <div className="min-h-screen min-w-0 lg:ml-[230px]">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-[#DCE8D9] bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label={t("advisorPortal.layout.openNavigation")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-lg p-2 text-[#176B3A] transition hover:bg-[#E7F1E3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]"
          >
            <Menu size={22} />
          </button>

          <button
            type="button"
            onClick={() => navigate("/advisor/dashboard")}
            className="flex min-w-0 items-center gap-2.5 rounded-lg text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F8F4E]"
            aria-label={t("advisorPortal.sidebar.goToDashboard")}
          >
            <img
              src="/safelink-logo.png"
              alt={t("advisorPortal.sidebar.logoAlt")}
              className="h-auto w-8 shrink-0 object-contain"
            />
            <span className="min-w-0">
              <span className="block font-bold leading-tight text-[#173B28]">
                SafeLink
              </span>
              <span className="block text-[7px] font-semibold tracking-[0.16em] text-[#7B8F82]">
                {t("advisorPortal.common.privateSupport")}
              </span>
            </span>
          </button>
        </header>

        <main className="min-h-[calc(100vh-56px)] min-w-0 bg-[#FAFBF7] lg:min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
