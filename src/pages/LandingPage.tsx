import { useLanguage } from "../context/LanguageContext";
import { getTranslations } from "../i18n/translations";

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

  return (
    <main className="min-h-screen text-white overflow-hidden">
      {/* ================= HERO / BACKGROUND ================= */}
      <section className="relative min-h-screen">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/safelink-hero.png')",
          }}
        />

        {/* Dark/soft overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#062f3f]/90 via-[#0b5365]/55 to-transparent" />

        {/* Additional bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#062f3f]/70 via-transparent to-transparent" />

        {/* ================= HEADER ================= */}
        <header className="relative z-10 max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur flex items-center justify-center shadow-lg">
                <span className="text-3xl text-[#1685a5]">♡</span>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">SafeLink</h1>

                <p className="text-xs tracking-[0.3em] text-white/80 font-semibold">
                  ETHIOPIA
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) =>
                setLanguage(e.target.value as "en" | "am" | "om")
              }
              aria-label="Select language"
              className="
                bg-white/90
                text-[#12304a]
                px-5
                py-3
                rounded-full
                shadow-lg
                backdrop-blur
                outline-none
                cursor-pointer
                font-medium
                hover:bg-white
                transition
              "
            >
              <option value="en">English</option>
              <option value="am">አማርኛ</option>
              <option value="om">Afaan Oromoo</option>
            </select>
          </div>
        </header>

        {/* ================= HERO CONTENT ================= */}
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="min-h-[calc(100vh-96px)] flex items-center">
            <div className="max-w-2xl pb-20">
              {/* Small label */}
              <div className="flex items-center gap-3 text-sm font-semibold mb-7">
                <span>{t.privateSafeSupportive}</span>
              </div>

              {/* Main heading */}
              <h2 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
                {t.youreNotAlone}
              </h2>

              {/* Description */}
              <p className="text-lg md:text-xl text-white/85 mt-7 max-w-xl leading-relaxed">
                {t.landingDescription}
              </p>

              {/* ================= ACTION BUTTONS ================= */}
              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                {/* I NEED HELP */}
                <button
                  type="button"
                  onClick={onNeedHelp}
                  className="
                    group
                    flex
                    items-center
                    justify-center
                    gap-3
                    bg-[#126d85]
                    hover:bg-[#0d5d73]
                    text-white
                    px-8
                    py-4
                    rounded-full
                    font-semibold
                    shadow-xl
                    transition-all
                    hover:scale-[1.02]
                  "
                >
                  <span className="text-xl">♡</span>

                  <span>{t.iNeedHelp}</span>

                  <span className="group-hover:translate-x-1 transition">
                    →
                  </span>
                </button>

                {/* I'M HELPING */}
                <button
                  type="button"
                  onClick={onHelping}
                  className="
                    group
                    flex
                    items-center
                    justify-center
                    gap-3
                    bg-white/95
                    hover:bg-white
                    text-[#12304a]
                    px-8
                    py-4
                    rounded-full
                    font-semibold
                    shadow-xl
                    transition-all
                    hover:scale-[1.02]
                  "
                >
                  <span className="text-xl">♧</span>

                  <span>{t.imHelping}</span>

                  <span className="group-hover:translate-x-1 transition">
                    →
                  </span>
                </button>
              </div>

              {/* ================= CONTINUE SESSION ================= */}
              {hasSavedSession && (
                <button
                  type="button"
                  onClick={onContinueSession}
                  className="
                    mt-5
                    flex
                    items-center
                    gap-3
                    bg-white/15
                    hover:bg-white/25
                    backdrop-blur-md
                    border
                    border-white/30
                    px-6
                    py-3
                    rounded-full
                    text-white
                    transition
                  "
                >
                  <span>🔒</span>

                  <span>{t.continueExistingSession}</span>

                  <span>→</span>
                </button>
              )}

              {/* Privacy note */}
              <div className="mt-10 flex items-center gap-3 text-sm text-white/75">
                <span className="text-lg">🔒</span>

                <span>{t.privacyNote}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM FEATURES ================= */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-white/95 backdrop-blur-md text-[#12304a]">
            <div className="max-w-7xl mx-auto px-6 py-7">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
    </main>
  );
}

/* ================= FEATURE COMPONENT ================= */

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
      <div className="w-11 h-11 rounded-full bg-[#e5f4ed] flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-sm md:text-base">{title}</h3>

        <p className="text-xs md:text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
}

export default LandingPage;
