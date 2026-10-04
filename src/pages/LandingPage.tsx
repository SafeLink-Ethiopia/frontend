import { useLanguage } from "../context/LanguageContext";
import { getTranslations } from "../i18n/translations";
import { useNavigate } from "react-router-dom";

import femaleIllustration from "../assets/illustrations/female.svg";

interface LandingPageProps {
  onNeedHelp: () => void;
  onHelping: () => void;
  hasSavedSession: boolean;
  onContinueSession: () => void;
}

function LandingPage({
  onNeedHelp,
  onHelping,
  hasSavedSession,
  onContinueSession,
}: LandingPageProps) {
  const { language, setLanguage } = useLanguage();
  const t = getTranslations(language);
  const navigate = useNavigate();

  
const handleLogin = () => {
  navigate("/login");
};

  return (
    <main className="min-h-screen overflow-hidden bg-[#001B2E] text-white">
      <section className="relative flex min-h-screen flex-col">
        {/* =========================================================
            BACKGROUND LAYERS
        ========================================================= */}

        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001B2E] via-[#0B2437] to-[#001B2E]" />

        {/* Ambient glow — left */}
        <div className="pointer-events-none absolute -left-40 top-1/4 h-[26rem] w-[26rem] rounded-full bg-[#8DA1B9]/15 blur-3xl" />

        {/* Ambient glow — right, behind the illustration */}
        <div className="pointer-events-none absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-[#8DA1B9]/20 blur-3xl" />

        {/* Accent glow — bottom */}
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-[#CBB3BF]/10 blur-3xl" />

        {/* Female illustration */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] items-end justify-end overflow-hidden md:flex lg:w-[48%]">
          <img
            src={femaleIllustration}
            alt=""
            className="h-[85%] max-h-[680px] w-auto max-w-full object-contain object-bottom pr-6 opacity-95 lg:pr-12 xl:pr-20"
          />
        </div>

        {/* Mobile illustration — smaller, behind the hero text */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center overflow-hidden opacity-30 md:hidden">
          <img
            src={femaleIllustration}
            alt=""
            className="h-72 w-auto object-contain object-bottom"
          />
        </div>

        {/* Readability overlay — darkens the left side for text */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#001B2E] via-[#001B2E]/80 to-transparent md:via-[#001B2E]/60" />

        {/* Bottom fade into the feature strip */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#001B2E] to-transparent" />

        {/* =========================================================
            HEADER
        ========================================================= */}
        <header className="relative z-20 mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate("/")}
              aria-label="SafeLink home"
              className="group flex items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02] active:scale-95 sm:gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8DA1B9] shadow-lg shadow-[#8DA1B9]/30 transition-transform duration-500 group-hover:rotate-6 sm:h-12 sm:w-12">
                <span className="text-xl text-[#001B2E] sm:text-3xl">♡</span>
              </div>

              <div className="text-left">
                <h1 className="text-lg font-bold tracking-tight sm:text-2xl">
                  SafeLink
                </h1>

                <p className="text-[9px] font-semibold tracking-[0.3em] text-[#8DA1B9] sm:text-xs">
                  ETHIOPIA
                </p>
              </div>
            </button>

            {/* Right cluster */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleAdvisorLogin}
                className="hidden rounded-full border border-[#8DA1B9]/30 bg-[#8DA1B9]/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8DA1B9] hover:bg-[#8DA1B9]/20 sm:px-5 sm:py-3 sm:text-sm md:inline-flex"
              >
                Advisor Login
              </button>

              <button
                type="button"
                onClick={handleAdminLogin}
                className="hidden rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 sm:px-5 sm:py-3 sm:text-sm md:inline-flex"
              >
                Admin Login
              </button>

              {/* Mobile staff shortcut */}
              <button
                type="button"
                onClick={handleAdvisorLogin}
                className="rounded-full border border-[#8DA1B9]/30 bg-[#8DA1B9]/10 px-3 py-2 text-[11px] font-semibold text-white backdrop-blur-md transition-colors hover:bg-[#8DA1B9]/20 md:hidden"
              >
                Staff
              </button>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value as "en" | "am" | "om")
                }
                aria-label="Select language"
                className="cursor-pointer rounded-full bg-[#8DA1B9] px-3.5 py-2 text-xs font-semibold text-[#001B2E] shadow-lg shadow-[#8DA1B9]/20 outline-none transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] sm:px-5 sm:py-3 sm:text-sm"
              >
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
                <option value="om">Afaan Oromoo</option>
              </select>
            </div>
          </div>
        </header>

        {/* =========================================================
            HERO CONTENT
        ========================================================= */}
        <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6">
          <div className="flex min-h-[calc(100vh-260px)] items-center py-10 sm:py-14">
            <div className="max-w-2xl pb-6 sm:pb-10 lg:pb-20">
              {/* Eyebrow */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8DA1B9]/30 bg-[#8DA1B9]/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md sm:mb-7 sm:px-4 sm:py-2 sm:text-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8DA1B9]" />
                {t.privateSafeSupportive}
              </div>

              {/* Headline */}
              <h2 className="text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl md:text-7xl">
                {t.youreNotAlone}
              </h2>

              {/* Subheadline */}
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:mt-7 sm:text-lg md:text-xl">
                {t.landingDescription}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                {/* Primary — I need help */}
                <button
                  type="button"
                  onClick={onNeedHelp}
                  className="w-full group flex items-center justify-center gap-3 rounded-full bg-[#8DA1B9] px-6 py-3.5 text-sm font-semibold text-[#001B2E] shadow-xl shadow-[#8DA1B9]/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#95ADB6] hover:shadow-2xl hover:shadow-[#8DA1B9]/30 active:translate-y-0 sm:px-8 sm:py-4 sm:text-base"
                >
                 
                  <span>{t.iNeedHelp}</span>
                


                </button>

               {/*  Secondary — I'm helping 
                <button
                  type="button"
                  onClick={onHelping}
                  className="group flex items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/20 active:translate-y-0 sm:px-8 sm:py-4 sm:text-base"
                >
                  <span>{t.imHelping}</span> 
                  
                </button>
                */}
              </div>

              {/* Continue session */}
              {hasSavedSession && (
                <button
                  type="button"
                  onClick={onContinueSession}
                  className="group mt-4 flex items-center gap-3 rounded-full border border-[#95ADB6]/30 bg-[#95ADB6]/10 px-5 py-3 text-xs font-semibold text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#95ADB6]/60 hover:bg-[#95ADB6]/20 sm:mt-5 sm:px-6 sm:text-sm"
                >
                  <span>{t.continueExistingSession}</span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              )}

              {/* Privacy note */}
              <div className="mt-8 flex items-center gap-3 text-xs text-white/70 sm:mt-10 sm:text-sm">
                <span>{t.privacyNote}</span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            FEATURE STRIP — in normal flow
        ========================================================= */}
        <div className="relative z-10 border-t border-white/10 bg-[#001B2E]/85 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-7">
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4">
              <Feature
                
                title={t.private}
                description={t.privateDescription}
              />

              <Feature
                
                title={t.trustedSupport}
                description={t.trustedSupportDescription}
              />

              <Feature
                
                title={t.yourLanguage}
                description={t.yourLanguageDescription}
              />

              <Feature
                
                title={t.youMatter}
                description={t.youMatterDescription}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ===============================================================
   FEATURE
=============================================================== */

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8DA1B9]/30 hover:bg-white/[0.06] sm:items-center sm:p-4">

      <div className="min-w-0">
        <h3 className="text-xs font-bold text-white sm:text-sm md:text-base">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] leading-5 text-white/60 sm:mt-1 sm:text-xs md:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

export default LandingPage;