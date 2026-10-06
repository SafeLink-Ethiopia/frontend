import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { getTranslations } from "../i18n/translations";
import { useNavigate } from "react-router-dom";

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

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate("/login");
  };

  const scrollToSection = (id: string) => {
    setMenuOpen(false);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

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

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
          <nav className="rounded-2xl border border-white/20 bg-[#062f3f]/90 px-4 py-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between">
              {/* Logo */}

              <button
                type="button"
                onClick={() => scrollToSection("home")}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
                  <span className="text-2xl text-[#1685a5]">♡</span>
                </div>

                <div className="text-left">
                  <p className="text-lg font-bold leading-none text-white">
                    SafeLink
                  </p>

                  <p className="mt-1 text-[9px] font-semibold tracking-[0.25em] text-white/70">
                    ETHIOPIA
                  </p>
                </div>
              </button>

              {/* Desktop Navigation */}

              <div className="hidden items-center gap-8 md:flex">
                <button
                  type="button"
                  onClick={() => scrollToSection("home")}
                  className="text-sm font-medium text-white transition hover:text-cyan-200"
                >
                  Home
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("about")}
                  className="text-sm font-medium text-white/80 transition hover:text-white"
                >
                  About
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("faq")}
                  className="text-sm font-medium text-white/80 transition hover:text-white"
                >
                  FAQ
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("footer")}
                  className="text-sm font-medium text-white/80 transition hover:text-white"
                >
                  Contact
                </button>
              </div>

              {/* Right Side */}

              <div className="hidden items-center gap-3 md:flex">
                <select
                  value={language}
                  onChange={(e) =>
                    setLanguage(e.target.value as "en" | "am" | "om")
                  }
                  aria-label="Select language"
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white outline-none backdrop-blur transition hover:bg-white/20"
                >
                  <option className="text-slate-900" value="en">
                    English
                  </option>

                  <option className="text-slate-900" value="am">
                    አማርኛ
                  </option>

                  <option className="text-slate-900" value="om">
                    Afaan Oromoo
                  </option>
                </select>

                <button
                  type="button"
                  onClick={handleLogin}
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#12304a] transition hover:bg-cyan-50"
                >
                  Login
                </button>
              </div>

              {/* Mobile Menu Button */}

              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-2 text-white md:hidden"
                aria-label="Toggle menu"
              >
                <div className="space-y-1.5">
                  <span className="block h-0.5 w-6 bg-white" />
                  <span className="block h-0.5 w-6 bg-white" />
                  <span className="block h-0.5 w-6 bg-white" />
                </div>
              </button>
            </div>

            {/* Mobile Navigation */}

            {menuOpen && (
              <div className="mt-4 border-t border-white/10 pt-4 md:hidden">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => scrollToSection("home")}
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10"
                  >
                    Home
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("about")}
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10"
                  >
                    About
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("faq")}
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10"
                  >
                    FAQ
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection("footer")}
                    className="rounded-lg px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10"
                  >
                    Contact
                  </button>

                  <button
                    type="button"
                    onClick={handleLogin}
                    className="mt-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#12304a]"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        id="home"
        className="relative min-h-screen scroll-mt-24 overflow-hidden"
      >
        {/* Hero Image */}

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/safelink-hero.png')",
          }}
        />

        {/* Overlay */}

        <div className="absolute inset-0 bg-gradient-to-r from-[#062f3f]/95 via-[#062f3f]/75 to-[#062f3f]/20" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#062f3f]/80 via-transparent to-[#062f3f]/30" />

        {/* Hero Content */}

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-32 pt-32 lg:px-8">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              A private space for support
            </div>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              You are not
              <span className="block text-cyan-200">alone.</span>
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
              SafeLink provides a private and supportive space for anyone
              experiencing Gender-Based Violence. Your safety, your voice, and
              your story matter.
            </p>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              GBV can affect girls, boys, women, and men. SafeLink is here for
              everyone who needs a safe path toward support.
            </p>

            {/* CTA Buttons */}

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onNeedHelp}
                className="group flex items-center justify-center gap-3 rounded-full bg-[#1685a5] px-7 py-4 font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#12748f]"
              >
                <span className="text-xl">♡</span>

                <span>{t.iNeedHelp}</span>

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </button>

              <button
                type="button"
                onClick={onHelping}
                className="group flex items-center justify-center gap-3 rounded-full bg-white px-7 py-4 font-semibold text-[#12304a] shadow-xl transition hover:-translate-y-0.5 hover:bg-cyan-50"
              >
                <span className="text-xl">♧</span>

                <span>{t.imHelping}</span>

                <span className="transition group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>

            {hasSavedSession && (
              <button
                type="button"
                onClick={onContinueSession}
                className="mt-5 flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <span>🔒</span>

                <span>{t.continueExistingSession}</span>

                <span>→</span>
              </button>
            )}

            <div className="mt-8 flex items-center gap-3 text-sm text-white/70">
              <span>🔒</span>

              <span>
                Your privacy matters. Seek support at your own pace.
              </span>
            </div>
          </div>
        </div>

        {/* Hero Bottom Features */}

        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-white/95 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <Feature
                  icon="🔒"
                  title={t.private}
                  description={t.privateDescription}
                />

                <Feature
                  icon="🛡️"
                  title={t.trustedSupport}
                  description={t.trustedSupportDescription}
                />

                <Feature
                  icon="🌐"
                  title={t.yourLanguage}
                  description={t.yourLanguageDescription}
                />

                <Feature
                  icon="♡"
                  title={t.youMatter}
                  description={t.youMatterDescription}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT SECTION
      ====================================================== */}

      <section
        id="about"
        className="scroll-mt-24 bg-white px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* Left */}

            <div>
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#1685a5]">
                About SafeLink
              </span>

              <h2 className="mt-4 text-4xl font-bold leading-tight text-[#12304a] sm:text-5xl">
                A safer link between you and the support you deserve.
              </h2>

              <p className="mt-6 text-lg leading-relaxed text-slate-600">
                SafeLink is built to make it easier for people affected by
                Gender-Based Violence to find information, seek support, and
                connect with trusted people in a safer environment.
              </p>

              <p className="mt-5 leading-relaxed text-slate-500">
                We believe that asking for help should never be something to
                feel ashamed of. Whether you are a girl, boy, woman, or man,
                your experience matters and you deserve to be heard.
              </p>

              <button
                type="button"
                onClick={onNeedHelp}
                className="mt-8 rounded-full bg-[#126d85] px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-[#0d5d73]"
              >
                Find Support →
              </button>
            </div>

            {/* Right */}

            <div className="grid gap-5 sm:grid-cols-2">
              <AboutCard
                icon="🔐"
                title="Privacy First"
                description="Designed to give people a safer and more private way to seek support."
              />

              <AboutCard
                icon="🤝"
                title="Human Support"
                description="Connect with trusted advisors when you need someone to listen."
              />

              <AboutCard
                icon="🌍"
                title="Inclusive"
                description="Support is for everyone affected by Gender-Based Violence."
              />

              <AboutCard
                icon="💙"
                title="You Matter"
                description="Your safety, dignity, voice, and wellbeing matter."
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="bg-[#f4f9fa] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#1685a5]">
              How SafeLink Works
            </span>

            <h2 className="mt-4 text-4xl font-bold text-[#12304a]">
              Support when you need it.
            </h2>

            <p className="mt-5 leading-relaxed text-slate-500">
              Getting support doesn't have to be complicated.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <Step
              number="01"
              title="Create a Safe Session"
              description="Start a private session and choose the kind of support you need."
            />

            <Step
              number="02"
              title="Tell Us What You Need"
              description="Share only what you feel comfortable sharing and explore available resources."
            />

            <Step
              number="03"
              title="Connect With Support"
              description="Access trusted advisors and relevant support for your situation."
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FAQ
      ====================================================== */}

      <section
        id="faq"
        className="scroll-mt-24 bg-white px-6 py-24 lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-[#1685a5]">
              FAQ
            </span>

            <h2 className="mt-4 text-4xl font-bold text-[#12304a] sm:text-5xl">
              Frequently asked questions
            </h2>

            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-slate-500">
              Have questions about SafeLink? Here are some answers to help you
              get started.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                  >
                    <span className="font-semibold text-[#12304a]">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf7f9] text-[#1685a5] transition ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-6 pb-6 pt-5">
                      <p className="leading-relaxed text-slate-500">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#062f3f] px-8 py-16 text-center shadow-xl sm:px-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            You deserve to feel safe.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-white/70">
            You don't have to face everything alone. When you're ready,
            SafeLink is here to help you find a path toward support.
          </p>

          <button
            type="button"
            onClick={onNeedHelp}
            className="mt-8 rounded-full bg-white px-8 py-4 font-semibold text-[#12304a] shadow-lg transition hover:bg-cyan-50"
          >
            Get Support →
          </button>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer
        id="footer"
        className="scroll-mt-24 bg-[#041f2a] px-6 pb-8 pt-16 text-white lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}

            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                  <span className="text-2xl text-[#1685a5]">♡</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold">SafeLink</h3>

                  <p className="text-[9px] font-semibold tracking-[0.25em] text-white/50">
                    ETHIOPIA
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-md leading-relaxed text-white/55">
                A private and supportive platform helping people affected by
                Gender-Based Violence find information, trusted support, and a
                safer path forward.
              </p>
            </div>

            {/* Navigation */}

            <div>
              <h4 className="font-semibold">Navigation</h4>

              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                <button
                  onClick={() => scrollToSection("home")}
                  className="text-left transition hover:text-white"
                >
                  Home
                </button>

                <button
                  onClick={() => scrollToSection("about")}
                  className="text-left transition hover:text-white"
                >
                  About
                </button>

                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-left transition hover:text-white"
                >
                  FAQ
                </button>
              </div>
            </div>

            {/* Support */}

            <div>
              <h4 className="font-semibold">Support</h4>

              <div className="mt-5 flex flex-col gap-3 text-sm text-white/55">
                <button
                  onClick={onNeedHelp}
                  className="text-left transition hover:text-white"
                >
                  I Need Help
                </button>

                <button
                  onClick={onHelping}
                  className="text-left transition hover:text-white"
                >
                  I'm Helping
                </button>

                <button
                  onClick={handleLogin}
                  className="text-left transition hover:text-white"
                >
                  Login
                </button>
              </div>
            </div>
          </div>

          <div className="mt-14 border-t border-white/10 pt-7 text-center text-sm text-white/40">
            <p>
              © {new Date().getFullYear()} SafeLink Ethiopia. Built with care
              for safer communities.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* =========================================================
   FEATURE
========================================================= */

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e5f4ed] text-lg">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-bold text-[#12304a] md:text-base">
          {title}
        </h3>

        <p className="mt-1 text-xs text-slate-500 md:text-sm">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   ABOUT CARD
========================================================= */

function AboutCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf7f9] text-xl">
        {icon}
      </div>

      <h3 className="mt-5 font-bold text-[#12304a]">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   STEP
========================================================= */

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
    <div className="rounded-2xl bg-white p-7 shadow-sm">
      <span className="text-sm font-bold tracking-widest text-[#1685a5]">
        {number}
      </span>

      <h3 className="mt-4 text-xl font-bold text-[#12304a]">{title}</h3>

      <p className="mt-3 leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export default LandingPage;