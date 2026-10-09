import { useTranslation } from "react-i18next";

function QuickExitPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      {/* Header */}
      <header className="border-b border-[#a79093]/30 bg-[#f7f5f6]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3e1919]" />

              <h1 className="text-xl font-semibold tracking-tight text-[#3e1919]">
                {t("quickExit.communityUpdates")}
              </h1>
            </div>

            <p className="text-xs text-[#a79093] mt-2 ml-5.5">
              {t("quickExit.news")} <span className="mx-2">•</span>{" "}
              {t("quickExit.community")} <span className="mx-2">•</span>{" "}
              {t("quickExit.dailyInformation")}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-sm text-[#a79093]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a79093]" />
            <span>{t("quickExit.today")}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        {/* Intro */}
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
            {t("quickExit.dailyUpdates")}
          </p>

          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#3e1919] mt-4 leading-tight">
            {t("quickExit.whatsHappening")}
          </h2>

          <p className="text-[#a79093] mt-5 text-base md:text-lg leading-7 max-w-2xl">
            {t("quickExit.intro")}
          </p>
        </div>

        {/* Updates */}
        <div className="mt-14 border-y border-[#a79093]/30">
          {/* Weather */}
          <div className="group grid md:grid-cols-[90px_1fr_auto] gap-6 md:gap-10 py-8 border-b border-[#a79093]/25">
            <div className="text-4xl">☀️</div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a79093]">
                {t("quickExit.weather")}
              </p>

              <h3 className="text-xl font-semibold text-[#3e1919] mt-2">
                {t("quickExit.todaysWeather")}
              </h3>

              <p className="text-sm text-[#a79093] mt-2 leading-6 max-w-2xl">
                {t("quickExit.weatherDescription")}
              </p>
            </div>

            <div className="hidden md:flex items-center">
              <span className="text-sm font-medium text-[#3e1919] group-hover:translate-x-1 transition-transform">
                {t("quickExit.view")}
              </span>
            </div>
          </div>

          {/* Community */}
          <div className="group grid md:grid-cols-[90px_1fr_auto] gap-6 md:gap-10 py-8 border-b border-[#a79093]/25">
            <div className="text-4xl">📰</div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a79093]">
                {t("quickExit.community")}
              </p>

              <h3 className="text-xl font-semibold text-[#3e1919] mt-2">
                {t("quickExit.localUpdates")}
              </h3>

              <p className="text-sm text-[#a79093] mt-2 leading-6 max-w-2xl">
                {t("quickExit.communityDescription")}
              </p>
            </div>

            <div className="hidden md:flex items-center">
              <span className="text-sm font-medium text-[#3e1919] group-hover:translate-x-1 transition-transform">
                {t("quickExit.view")}
              </span>
            </div>
          </div>

          {/* Events */}
          <div className="group grid md:grid-cols-[90px_1fr_auto] gap-6 md:gap-10 py-8">
            <div className="text-4xl">📅</div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a79093]">
                {t("quickExit.events")}
              </p>

              <h3 className="text-xl font-semibold text-[#3e1919] mt-2">
                {t("quickExit.upcoming")}
              </h3>

              <p className="text-sm text-[#a79093] mt-2 leading-6 max-w-2xl">
                {t("quickExit.eventsDescription")}
              </p>
            </div>

            <div className="hidden md:flex items-center">
              <span className="text-sm font-medium text-[#3e1919] group-hover:translate-x-1 transition-transform">
                {t("quickExit.view")}
              </span>
            </div>
          </div>
        </div>

        {/* Information note */}
        <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-t border-[#a79093]/30 pt-6">
          <p className="text-xs text-[#a79093]">
            {t("quickExit.informationNote")}
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-[#3e1919]">
            <span className="w-7 h-px bg-[#3e1919]" />
            <span>{t("quickExit.brand")}</span>
          </div>
        </div>

        {/* Small accent section */}
        <div className="mt-14 bg-[#f0e2d6] px-6 py-5 md:px-8 md:py-6 border-l-4 border-[#3e1919]">
          <p className="text-sm text-[#3e1919] leading-6 max-w-3xl">
            {t("quickExit.reminder")}
          </p>
        </div>
      </section>
    </main>
  );
}

export default QuickExitPage;