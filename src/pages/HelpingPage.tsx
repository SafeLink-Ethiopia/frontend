interface HelpingPageProps {
  onBack: () => void;
}

function HelpingPage({ onBack }: HelpingPageProps) {
  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#12304a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d9efe5] rounded-full blur-3xl opacity-70" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#dceef4] rounded-full blur-3xl opacity-70" />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-[#126d85] font-medium hover:gap-3 transition-all"
        >
          <span>←</span>
          Back
        </button>
      </header>

      {/* Content */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#239b78] to-[#1685a5] flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl">♡</span>
          </div>

          <p className="mt-7 text-sm font-semibold text-[#239b78] tracking-wider">
            SUPPORTER ACCESS
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">
            Thank you for helping.
          </h1>

          <p className="max-w-2xl mx-auto mt-5 text-gray-600 text-lg leading-relaxed">
            SafeLink connects people seeking support with appropriate services
            and trusted helpers.
          </p>
        </div>

        {/* Helper options */}
        <div className="grid md:grid-cols-2 gap-5 mt-12">
          <div className="bg-white border border-gray-200 rounded-[1.5rem] p-7 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#e5f4ed] flex items-center justify-center text-2xl">
              🩺
            </div>

            <h2 className="text-xl font-bold mt-5">Medical Support</h2>

            <p className="text-gray-500 mt-2 leading-relaxed">
              Support people who are looking for appropriate medical assistance.
            </p>

            <div className="mt-5 inline-flex px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
              Coming soon
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-[1.5rem] p-7 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#eaf3f7] flex items-center justify-center text-2xl">
              🤝
            </div>

            <h2 className="text-xl font-bold mt-5">General Support</h2>

            <p className="text-gray-500 mt-2 leading-relaxed">
              Help connect people with the appropriate resources and services.
            </p>

            <div className="mt-5 inline-flex px-3 py-1 rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
              Coming soon
            </div>
          </div>
        </div>

        {/* Demo notice */}
        <div className="mt-8 rounded-2xl border border-[#d6ebe2] bg-[#eef7f4] p-5">
          <div className="flex gap-3">
            <span className="text-lg">ℹ️</span>

            <p className="text-sm text-gray-600 leading-relaxed">
              The helper features are being connected to the SafeLink support
              system. This demo does not replace trained medical, legal,
              counseling, or emergency services.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HelpingPage;
