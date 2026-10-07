function QuickExitPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919]">
      {/* Header */}
      <header className="border-b border-[#a79093]/30 bg-[#f7f5f6]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3e1919]" />

              <h1 className="text-xl font-semibold tracking-tight text-[#3e1919]">
                Community Updates
              </h1>
            </div>

            <p className="text-xs text-[#a79093] mt-2 ml-5.5">
              News <span className="mx-2">•</span> Community{" "}
              <span className="mx-2">•</span> Daily Information
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-sm text-[#a79093]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#a79093]" />
            <span>Today</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="max-w-6xl mx-auto px-6 py-14 md:py-20">
        {/* Intro */}
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a79093]">
            Daily Updates
          </p>

          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-[#3e1919] mt-4 leading-tight">
            What's happening today?
          </h2>

          <p className="text-[#a79093] mt-5 text-base md:text-lg leading-7 max-w-2xl">
            Explore community updates, useful information, and today's
            highlights.
          </p>
        </div>

        {/* Updates */}
        <div className="mt-14 border-y border-[#a79093]/30">
          {/* Weather */}
          <div className="group grid md:grid-cols-[90px_1fr_auto] gap-6 md:gap-10 py-8 border-b border-[#a79093]/25">
            <div className="text-4xl">☀️</div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a79093]">
                Weather
              </p>

              <h3 className="text-xl font-semibold text-[#3e1919] mt-2">
                Today's Weather
              </h3>

              <p className="text-sm text-[#a79093] mt-2 leading-6 max-w-2xl">
                Check today's weather conditions and plan your day.
              </p>
            </div>

            <div className="hidden md:flex items-center">
              <span className="text-sm font-medium text-[#3e1919] group-hover:translate-x-1 transition-transform">
                View
              </span>
            </div>
          </div>

          {/* Community */}
          <div className="group grid md:grid-cols-[90px_1fr_auto] gap-6 md:gap-10 py-8 border-b border-[#a79093]/25">
            <div className="text-4xl">📰</div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a79093]">
                Community
              </p>

              <h3 className="text-xl font-semibold text-[#3e1919] mt-2">
                Local Updates
              </h3>

              <p className="text-sm text-[#a79093] mt-2 leading-6 max-w-2xl">
                Discover recent community events and important updates.
              </p>
            </div>

            <div className="hidden md:flex items-center">
              <span className="text-sm font-medium text-[#3e1919] group-hover:translate-x-1 transition-transform">
                View
              </span>
            </div>
          </div>

          {/* Events */}
          <div className="group grid md:grid-cols-[90px_1fr_auto] gap-6 md:gap-10 py-8">
            <div className="text-4xl">📅</div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a79093]">
                Events
              </p>

              <h3 className="text-xl font-semibold text-[#3e1919] mt-2">
                What's Coming Up
              </h3>

              <p className="text-sm text-[#a79093] mt-2 leading-6 max-w-2xl">
                Find activities and events happening in the community.
              </p>
            </div>

            <div className="hidden md:flex items-center">
              <span className="text-sm font-medium text-[#3e1919] group-hover:translate-x-1 transition-transform">
                View
              </span>
            </div>
          </div>
        </div>

        {/* Information note */}
        <div className="mt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-t border-[#a79093]/30 pt-6">
          <p className="text-xs text-[#a79093]">
            Community information and daily updates.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-[#3e1919]">
            <span className="w-7 h-px bg-[#3e1919]" />
            <span>SafeLink Community</span>
          </div>
        </div>

        {/* Small accent section */}
        <div className="mt-14 bg-[#f0e2d6] px-6 py-5 md:px-8 md:py-6 border-l-4 border-[#3e1919]">
          <p className="text-sm text-[#3e1919] leading-6 max-w-3xl">
            Stay informed with useful information from your community. Check
            back regularly for new updates and important announcements.
          </p>
        </div>
      </section>
    </main>
  );
}

export default QuickExitPage;