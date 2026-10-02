function QuickExitPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fa] text-gray-800">
      {/* Neutral header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Community Updates
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              News • Community • Daily Information
            </p>
          </div>

          <div className="hidden sm:block text-sm text-gray-500">Today</div>
        </div>
      </header>

      {/* Main content */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Daily Updates
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mt-3">
            What's happening today?
          </h2>

          <p className="text-gray-500 mt-4 leading-relaxed">
            Explore community updates, useful information, and today's
            highlights.
          </p>
        </div>

        {/* Neutral cards */}
        <div className="grid md:grid-cols-3 gap-5 mt-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="text-3xl mb-5">☀️</div>

            <p className="text-xs font-semibold text-gray-400 uppercase">
              Weather
            </p>

            <h3 className="text-lg font-bold mt-2">Today's Weather</h3>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Check today's weather conditions and plan your day.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="text-3xl mb-5">📰</div>

            <p className="text-xs font-semibold text-gray-400 uppercase">
              Community
            </p>

            <h3 className="text-lg font-bold mt-2">Local Updates</h3>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Discover recent community events and important updates.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="text-3xl mb-5">📅</div>

            <p className="text-xs font-semibold text-gray-400 uppercase">
              Events
            </p>

            <h3 className="text-lg font-bold mt-2">What's Coming Up</h3>

            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Find activities and events happening in the community.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6">
          <p className="text-xs text-gray-400">
            Community information and daily updates.
          </p>
        </div>
      </section>
    </main>
  );
}

export default QuickExitPage;
