import QuickExit from "../components/QuickExit";
interface PrivateSupportPageProps {
  safelinkId: string;
  onQuickExit: () => void;
}

function PrivateSupportPage({
  safelinkId,
  onQuickExit,
}: PrivateSupportPageProps) {
  const handleMedicalHelp = () => {
    // Person 3 will connect the medical/advisor flow here.
    console.log("Medical help requested for:", safelinkId);
  };

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#12304a] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d9efe5] rounded-full blur-3xl opacity-60" />

      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#dceef4] rounded-full blur-3xl opacity-60" />

      {/* Header */}
      <header className="relative z-10 max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#239b78] to-[#1685a5] flex items-center justify-center">
            <span className="text-white text-2xl">♡</span>
          </div>

          <div>
            <p className="font-bold text-lg">SafeLink</p>

            <p className="text-[10px] tracking-[0.3em] text-[#239b78] font-semibold">
              PRIVATE SUPPORT
            </p>
          </div>
        </div>

        {/* Quick Exit */}
        <QuickExit onExit={onQuickExit} />
      </header>

      {/* Content */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <p className="text-sm font-semibold text-[#239b78] mb-2">
            PRIVATE SUPPORT SESSION
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            How can we help you today?
          </h1>

          <p className="text-gray-600 mt-4 text-lg">
            Choose the type of support you need. You can leave this session at
            any time.
          </p>
        </div>

        {/* Medical help */}
        <button
          onClick={handleMedicalHelp}
          className="group w-full bg-white border border-gray-200 rounded-[1.5rem] p-6 text-left shadow-sm hover:shadow-xl hover:border-[#239b78]/40 transition-all"
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-[#e5f4ed] flex items-center justify-center text-2xl">
              🩺
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-bold">I need medical help</h2>

              <p className="text-gray-500 mt-1">
                Connect me with appropriate medical support.
              </p>
            </div>

            <span className="text-2xl text-[#126d85] group-hover:translate-x-1 transition">
              →
            </span>
          </div>
        </button>

        {/* Session ID */}
        <div className="mt-8 bg-[#eef7f4] border border-[#d6ebe2] rounded-2xl p-5">
          <p className="text-xs text-gray-500">Your private session</p>

          <p className="font-mono font-bold text-[#126d85] mt-1">
            {safelinkId}
          </p>
        </div>

        {/* Privacy note */}
        <div className="mt-8 flex gap-3 text-sm text-gray-500">
          <span>🔒</span>

          <p>
            SafeLink is a bridge to appropriate support. It does not replace
            medical professionals, counselors, lawyers, or emergency services.
          </p>
        </div>
      </section>
    </main>
  );
}

export default PrivateSupportPage;
