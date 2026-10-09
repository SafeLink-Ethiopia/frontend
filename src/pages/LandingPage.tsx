


import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslations } from "../i18n/translations";
import { useNavigate } from "react-router-dom";

/*
  Palette (soft leaf green)
  #FAFBF7  mist     - light page background
  #E7F1E3  mint     - soft green cards, highlights
  #2F8F4E  leaf     - accent, borders, light green
  #2F8F4E  green    - primary buttons, logo
  #176B3A  forest   - dark surfaces
  #173B28  ink      - body text
*/

interface LandingPageProps {
  onNeedHelp: () => void;
  // onHelping: () => void;
  hasSavedSession: boolean;
  onContinueSession: () => void;
}

const navLinks = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "faq", label: "FAQ" },
  { id: "footer", label: "Contact" },
];

const faqs = [
  {
    question: "What is SafeLink?",
    answer:
      "SafeLink is a private and supportive platform designed to connect people experiencing Gender-Based Violence with trusted support, information, and resources.",
  },
  {
    question: "Who can use SafeLink?",
    answer:
      "SafeLink is for everyone. Gender-Based Violence can affect girls, boys, women, and men. Anyone who needs support can use SafeLink.",
  },
  {
    question: "Is my information private?",
    answer:
      "SafeLink is designed with privacy in mind. Your personal information and support conversations should be handled with care and confidentiality.",
  },
  {
    question: "Can I use SafeLink without sharing my identity?",
    answer:
      "SafeLink supports private access so that people can seek help without feeling pressured to reveal more information than they are comfortable sharing.",
  },
  {
    question: "What kind of support can I find?",
    answer:
      "Depending on your needs, SafeLink can connect you with trusted advisors, relevant information, and appropriate support resources.",
  },
];

/* ---------- LOGO ----------
   Leaf + face profile + cupped hands, drawn as SVG.
   To use your exact logo file instead, replace the <svg> with:
   <img src="/safelink-logo.png" alt="SafeLink" className={className} />
*/
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

/* ---------- SMALL ICONS ---------- */
type IconName = "lock" | "mic" | "pin" | "shield" | "heart" | "users";

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "lock":
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "mic":
      return (
        <svg {...common}>
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.3" />
          <path d="M16.5 14.2c2.6.2 4.5 2.3 4.5 5" />
        </svg>
      );
  }
}

function LandingPage({
  onNeedHelp,
  // onHelping,
  hasSavedSession,
  onContinueSession,
}: LandingPageProps) {
  const { language, setLanguage } = useLanguage();
  const t = getTranslations(language);
  const navigate = useNavigate();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => navigate("/login");

  const scrollToSection = (id: string) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#FAFBF7] text-[#173B28]">
      {/* NAVBAR */}
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <nav className="rounded-2xl border border-[#2F8F4E]/30 bg-white/85 px-4 py-3 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => scrollToSection("home")}
                className="flex items-center gap-3"
              >
                <LogoMark className="h-10 w-10" />
                <div className="text-left">
                  <p className="text-xl font-extrabold leading-none tracking-tight text-[#2F8F4E]">
                    SafeLink
                  </p>
                  <p className="mt-1 text-[9px] font-semibold tracking-[0.25em] text-[#2F8F4E]">
                    ETHIOPIA
                  </p>
                </div>
              </button>

              <div className="hidden items-center gap-8 md:flex">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm font-medium text-[#173B28]/75 transition hover:text-[#2F8F4E]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as "en" | "am" | "om")
                  }
                  aria-label="Select language"
                  className="rounded-full bg-[#E7F1E3] px-4 py-2 text-sm font-medium text-[#173B28] outline-none transition hover:bg-[#E7F1E3]"
                >
                  <option value="en">English</option>
                  <option value="am">አማርኛ</option>
                  <option value="om">Afaan Oromoo</option>
                </select>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="rounded-full bg-[#2F8F4E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176B3A]"
                >
                  Login
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-2 md:hidden"
                aria-label="Toggle menu"
              >
                <div className="space-y-1.5">
                  <span className="block h-0.5 w-6 bg-[#2F8F4E]" />
                  <span className="block h-0.5 w-6 bg-[#2F8F4E]" />
                  <span className="block h-0.5 w-6 bg-[#2F8F4E]" />
                </div>
              </button>
            </div>

            {menuOpen && (
              <div className="mt-4 border-t border-[#2F8F4E]/30 pt-4 md:hidden">
                <div className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => scrollToSection(link.id)}
                      className="rounded-lg px-4 py-3 text-left text-sm font-medium text-[#173B28] hover:bg-[#E7F1E3]"
                    >
                      {link.label}
                    </button>
                  ))}

                  <select
                    value={language}
                    onChange={(e) =>
                      setLanguage(e.target.value as "en" | "am" | "om")
                    }
                    aria-label="Select language"
                    className="rounded-lg bg-[#E7F1E3] px-4 py-3 text-sm font-medium text-[#173B28] outline-none"
                  >
                    <option value="en">English</option>
                    <option value="am">አማርኛ</option>
                    <option value="om">Afaan Oromoo</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-2 rounded-lg bg-[#2F8F4E] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section
        id="home"
        className="relative min-h-screen scroll-mt-24 overflow-hidden bg-gradient-to-br from-[#FAFBF7] via-[#E7F1E3] to-[#E7F1E3]"
      >
        {/* hero photo on the right */}
        <div
          className="absolute inset-y-0 right-0 w-full bg-cover bg-center opacity-90 md:w-3/5"
          style={{ backgroundImage: "url('/hero.png')" }}
        />
        {/* fade photo into the light green on the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#FAFBF7] via-[#FAFBF7]/90 to-transparent md:via-[#E7F1E3]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#FAFBF7]/70 via-transparent to-transparent" />

        {/* soft leaf glow */}
        <div className="pointer-events-none absolute -left-24 top-1/3 h-80 w-80 rounded-full bg-[#2F8F4E]/20 blur-3xl" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-40 pt-32 lg:px-8">
          <div className="max-w-2xl">
            
            

            <h1 className="mt-10 text-4xl font-bold leading-[1.1] tracking-tight text-[#176B3A] sm:text-5xl lg:text-6xl">
              You are not alone.
              <span className="block text-[#2F8F4E]">
                Help is closer than you think.
              </span>
            </h1>

            <div className="mt-6 h-1 w-20 rounded-full bg-[#2F8F4E]" />

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#173B28]/85">
              SafeLink connects you to trusted services for medical care,
              counseling, legal assistance and protection — safely and
              privately.
            </p>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#173B28]/65 sm:text-base">
              GBV can affect girls, boys, women, and men. SafeLink is here for
              everyone who needs a safe path toward support.
            </p>

            {/* Two main actions */}
            <div className="mt-9 grid max-w-xl gap-4 sm:grid-cols-2">
            {/* I Need Help */}
  <button
          type="button"
          onClick={onNeedHelp}
          className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[#2F8F4E] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#176B3A]"
        >
    <span className="text-base font-medium sm:text-lg">
      {t.iNeedHelp}
    </span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </button>
{/* 
              <button
                type="button"
                onClick={onHelping}
                className="group flex flex-col items-start gap-1 rounded-2xl border border-[#2F8F4E]/40 bg-white/80 p-5 text-left text-[#173B28] shadow-xl backdrop-blur transition hover:-translate-y-0.5 hover:bg-[#E7F1E3]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F1E3] text-[#2F8F4E]">
                  <Icon name="users" className="h-6 w-6" />
                </span>
                <span className="mt-2 text-lg font-bold">{t.imHelping}</span>
                <span className="text-sm text-[#173B28]/70">
                  Support a friend or loved one.
                </span>
                <span className="mt-2 text-[#2F8F4E] transition group-hover:translate-x-1">
                  →
                </span>
              </button> */}
            </div>

            {hasSavedSession && (
              <button
                type="button"
                onClick={onContinueSession}
                className="mt-5 flex items-center gap-3 rounded-full border border-[#2F8F4E]/50 bg-white/70 px-6 py-3 text-sm font-medium text-[#176B3A] backdrop-blur-md transition hover:bg-[#E7F1E3]"
              >
                <Icon name="lock" className="h-4 w-4" />
                <span>{t.continueExistingSession}</span>
                <span>→</span>
              </button>
            )}

            <div className="mt-6 flex items-center gap-2 text-sm text-[#173B28]/70">
              <Icon name="lock" className="h-4 w-4 text-[#2F8F4E]" />
              <span>Your privacy matters. Seek support at your own pace.</span>
            </div>
          </div>
        </div>

        {/* Floating tagline card */}
        {/* <div className="absolute bottom-32 right-6 z-10 hidden rounded-2xl bg-[#E7F1E3]/90 p-5 shadow-xl backdrop-blur-md lg:flex lg:items-center lg:gap-4 xl:right-12">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2F8F4E] text-white">
            <Icon name="lock" className="h-6 w-6" />
          </span>
          <p className="text-lg font-semibold leading-snug text-[#176B3A]">
            Your safety.
            <br />
            Your voice.
            <br />
            Our priority.
          </p>
        </div> */}

        
      </section>

      {/* ABOUT */}
      <section
  id="about"
  className="scroll-mt-24 bg-[#FAFBF7] px-6 py-20 lg:px-8 lg:py-28"
>
  <div className="mx-auto max-w-6xl">
    <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

      {/* Left: About */}
      <div>
        <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
          About SafeLink
        </span>

        <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-[#176B3A] sm:text-4xl lg:text-5xl">
          A safer link between you and the support you deserve.
        </h2>

        <p className="mt-6 max-w-xl text-base leading-7 text-[#173B28]/75 sm:text-lg">
          SafeLink makes it easier for people affected by Gender-Based
          Violence to find reliable information, seek support, and connect
          with trusted people in a safer environment.
        </p>

        <p className="mt-4 max-w-xl text-base leading-7 text-[#173B28]/65">
          Asking for help should never be something to feel ashamed of.
          Your experience matters, and you deserve to be heard.
        </p>

        <button
          type="button"
          onClick={onNeedHelp}
          className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[#2F8F4E] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#176B3A]"
        >
          <span>Find Support</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>

      {/* Right: Simple statement */}
      <div className="border-l-2 border-[#2F8F4E] pl-8 lg:pl-10">

        <p className="text-2xl font-medium leading-relaxed text-[#176B3A] sm:text-3xl">
          “You do not have to face it alone.”
        </p>

        <div className="mt-8 space-y-5">

          <div>
            <h3 className="text-base font-semibold text-[#176B3A]">
              Privacy matters
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#173B28]/65">
              Your journey deserves respect, privacy, and care.
            </p>
          </div>

          <div>
            <h3 className="text-base font-semibold text-[#176B3A]">
              Support is for everyone
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#173B28]/65">
              Everyone affected by Gender-Based Violence deserves access
              to support.
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
</section>

      {/* HOW IT WORKS */}
<section className="bg-[#E7F1E3] px-6 py-20 lg:px-8 lg:py-24">
  <div className="mx-auto max-w-6xl">

    {/* Header */}
    <div className="max-w-2xl">
      <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2F8F4E]">
        How SafeLink Works
      </span>

      <h2 className="mt-4 text-3xl font-semibold text-[#176B3A] sm:text-4xl">
        Support when you need it.
      </h2>

      <p className="mt-4 text-base leading-7 text-[#173B28]/70">
        Getting support doesn't have to be complicated.
      </p>
    </div>

    {/* Flow */}
    <div className="mt-14">

      <div className="flex flex-col lg:flex-row lg:items-start">

        {/* Step 1 */}
        <div className="flex flex-1 items-start gap-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2F8F4E] text-sm font-semibold text-[#2F8F4E]">
            01
          </span>

          <div>
            <h3 className="text-lg font-semibold text-[#176B3A]">
              Create a Safe Session
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-[#173B28]/65">
              Start a private session and choose the kind of support you need.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden px-6 pt-3 text-2xl text-[#2F8F4E] lg:block">
          →
        </div>

        {/* Step 2 */}
        <div className="mt-10 flex flex-1 items-start gap-5 lg:mt-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2F8F4E] text-sm font-semibold text-[#2F8F4E]">
            02
          </span>

          <div>
            <h3 className="text-lg font-semibold text-[#176B3A]">
              Tell Us What You Need
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-[#173B28]/65">
              Share only what you feel comfortable sharing and explore
              available resources.
            </p>
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden px-6 pt-3 text-2xl text-[#2F8F4E] lg:block">
          →
        </div>

        {/* Step 3 */}
        <div className="mt-10 flex flex-1 items-start gap-5 lg:mt-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#2F8F4E] text-sm font-semibold text-[#2F8F4E]">
            03
          </span>

          <div>
            <h3 className="text-lg font-semibold text-[#176B3A]">
              Connect With Support
            </h3>

            <p className="mt-2 max-w-xs text-sm leading-6 text-[#173B28]/65">
              Access trusted advisors and relevant support for your situation.
            </p>
          </div>
        </div>

      </div>

    </div>
  </div>
</section>

      
{/* FAQ */}
<section
  id="faq"
  className="scroll-mt-24 bg-[#FAFBF7] px-6 py-20 lg:px-8 lg:py-28"
>
  <div className="mx-auto max-w-6xl">
    {/* Header */}
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex rounded-full bg-[#E7F1E3] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#2F8F4E]">
        FAQ
      </span>

      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#176B3A] sm:text-4xl lg:text-5xl">
        Questions you may have
      </h2>

      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#173B28]/65">
        Everything you need to know about SafeLink and how you can access
        support.
      </p>
    </div>

    {/* Questions */}
    <div className="mx-auto mt-14 grid max-w-4xl gap-4">
      {faqs.map((faq, index) => {
        const isOpen = openFaq === index;

        return (
          <div
            key={faq.question}
            className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
              isOpen
                ? "border-[#2F8F4E] bg-white shadow-[0_8px_30px_rgba(36,112,58,0.08)]"
                : "border-[#E7F1E3] bg-white/70 hover:border-[#2F8F4E] hover:bg-white"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenFaq(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-7 sm:py-6"
            >
              <div className="flex items-start gap-4">
                {/* Number */}
                <span
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isOpen
                      ? "bg-[#176B3A] text-white"
                      : "bg-[#E7F1E3] text-[#2F8F4E]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className={`pt-1 text-base font-semibold transition-colors sm:text-lg ${
                    isOpen ? "text-[#176B3A]" : "text-[#173B28]"
                  }`}
                >
                  {faq.question}
                </span>
              </div>

              {/* Icon */}
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lg transition-all duration-300 ${
                  isOpen
                    ? "rotate-45 border-[#176B3A] bg-[#176B3A] text-white"
                    : "border-[#2F8F4E] bg-[#FAFBF7] text-[#2F8F4E]"
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>

            {/* Answer */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pl-[4.5rem] pr-8 sm:px-7 sm:pb-7 sm:pl-[4.75rem]">
                  <p className="max-w-3xl text-sm leading-7 text-[#173B28]/65 sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>


  
{/* FINAL CTA */}
<section className="px-6 py-20 lg:px-8 lg:py-28">
  <div className="mx-auto max-w-6xl">
    <div className="relative overflow-hidden rounded-[2rem] bg-[#E7F1E3] px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
      
      {/* Decorative shape */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#2F8F4E]/60" />
      <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-[#E7F1E3]/70" />

      <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        
        {/* Text */}
        <div className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#2F8F4E]">
            We're here for you
          </span>

          <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-[#176B3A] sm:text-4xl lg:text-[2.75rem]">
            You don't have to figure it out alone.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-[#173B28]/75 sm:text-lg">
            If you need someone to talk to or help finding the right support,
            SafeLink can help you take the next step.
          </p>
        </div>

        {/* Action */}
        <div className="relative lg:pr-2">
          <button
            type="button"
            onClick={onNeedHelp}
            className="group inline-flex items-center gap-3 rounded-full bg-[#176B3A] px-7 py-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#176B3A] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#176B3A] focus:ring-offset-4 focus:ring-offset-[#E7F1E3]"
          >
            Get support
            <span className="text-lg leading-none transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>

          <p className="mt-3 text-center text-xs text-[#173B28]/60 lg:text-left">
            Take the first step when you're ready.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>


      {/* FOOTER */}
      {/* =====================================================
    PROFESSIONAL FOOTER
===================================================== */}

<footer
  id="footer"
  className="scroll-mt-24 bg-[#173B28] text-white"
>
  <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

    {/* =================================================
        MAIN FOOTER
    ================================================== */}

    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">

      {/* =================================================
          BRAND
      ================================================== */}

      <div className="lg:col-span-5">

        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className="group flex items-center gap-3"
        >
          {/* Logo */}
          <div className="flex h-11 w-11 items-center justify-center">
            <LogoMark className="h-10 w-10" />
          </div>

          {/* Brand Name */}
          <div className="text-left">
            <h3 className="text-xl font-bold tracking-tight text-white">
              SafeLink
            </h3>

            <p className="mt-0.5 text-[9px] font-semibold tracking-[0.25em] text-[#2F8F4E]">
              ETHIOPIA
            </p>
          </div>
        </button>

      </div>

      {/* =================================================
          CONTACT
      ================================================== */}

      <div className="lg:col-span-3">

        <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2F8F4E]">
          Contact
        </h4>

        <div className="mt-4 space-y-3">

          {/* Email */}
          <a
            href="mailto:support@safelink.org"
            className="block text-sm text-white/70 transition hover:text-[#2F8F4E]"
          >
            support@safelink.org
          </a>

          {/* Phone */}
          <p className="text-sm text-white/70">
            +251912345678
          </p>

        </div>
      </div>

      {/* =================================================
          SAFETY & LEGAL
      ================================================== */}

      <div className="lg:col-span-4">

        <h4 className="text-sm font-semibold uppercase tracking-wide text-[#2F8F4E]">
          Safety & Legal
        </h4>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">

          <button
            type="button"
            className="text-left text-sm text-white/60 transition hover:text-[#2F8F4E]"
          >
            Privacy Policy
          </button>

          <button
            type="button"
            className="text-left text-sm text-white/60 transition hover:text-[#2F8F4E]"
          >
            Terms of Use
          </button>

          <button
            type="button"
            className="text-left text-sm text-white/60 transition hover:text-[#2F8F4E]"
          >
            Safety & Security
          </button>

          <button
            type="button"
            className="text-left text-sm text-white/60 transition hover:text-[#2F8F4E]"
          >
            Accessibility
          </button>

        </div>

      </div>
    </div>

    {/* =================================================
        DIVIDER
    ================================================== */}

    <div className="my-7 h-px bg-white/10" />

    {/* =================================================
        BOTTOM BAR
    ================================================== */}

    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

      <p className="text-xs text-white/50">
        © {new Date().getFullYear()} SafeLink Ethiopia. All rights reserved.
      </p>

      <p className="text-xs text-white/30">
        Built with care for safer communities.
      </p>

    </div>

  </div>
</footer>
    </main>
  );
}

/* FEATURE */
function Feature({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E7F1E3] text-[#2F8F4E]">
        <Icon name={icon} className="h-5 w-5" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-[#176B3A] md:text-base">
          {title}
        </h3>
        <p className="mt-1 text-xs text-[#173B28]/65 md:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ABOUT CARD */
function AboutCard({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[#2F8F4E]/40 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#2F8F4E] hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7F1E3] text-[#2F8F4E]">
        <Icon name={icon} className="h-6 w-6" />
      </div>
      <h3 className="mt-5 font-bold text-[#176B3A]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#173B28]/65">
        {description}
      </p>
    </div>
  );
}

/* STEP */
function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-[#FAFBF7] p-7 shadow-sm">
      <span className="text-sm font-bold tracking-widest text-[#2F8F4E]">
        {number}
      </span>
      <h3 className="mt-4 text-xl font-bold text-[#176B3A]">{title}</h3>
      <p className="mt-3 leading-relaxed text-[#173B28]/70">{description}</p>
    </div>
  );
}

export default LandingPage;
