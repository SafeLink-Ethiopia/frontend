
interface SessionCreatedPageProps {
  safelinkId: string;
  onContinue: () => void;
}

function SessionCreatedPage({
  safelinkId,
  onContinue,
}: SessionCreatedPageProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safelinkId);
    } catch (error) {
      console.error("Failed to copy SafeLink ID:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#12304a] flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#d9efe5] rounded-full blur-3xl opacity-70" />

      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#dceef4] rounded-full blur-3xl opacity-70" />

      <div className="relative z-10 w-full max-w-lg">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#239b78] to-[#1685a5] flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl">
              ♡
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-10 text-center">

          <div className="w-16 h-16 mx-auto rounded-full bg-[#e5f4ed] flex items-center justify-center text-3xl mb-6">
            ✓
          </div>

          <p className="text-sm font-semibold text-[#239b78] mb-2">
            PRIVATE SESSION CREATED
          </p>

          <h1 className="text-3xl md:text-4xl font-bold">
            Your SafeLink ID
          </h1>

          <p className="text-gray-500 mt-4 leading-relaxed">
            This is your private session ID. Keep it safe because you can
            use it to access your session again.
          </p>

          {/* SafeLink ID */}
          <div className="mt-7 bg-[#f1f8f5] border border-[#d6ebe2] rounded-2xl p-6">
            <p className="text-2xl md:text-3xl font-mono font-bold tracking-wider text-[#126d85] break-all">
              {safelinkId}
            </p>
          </div>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="mt-4 text-sm font-semibold text-[#126d85] hover:text-[#0d5d73]"
          >
            Copy SafeLink ID
          </button>

          {/* Continue */}
          <button
            onClick={onContinue}
            className="w-full mt-8 bg-[#126d85] hover:bg-[#0d5d73] text-white py-4 rounded-xl font-semibold shadow-lg shadow-[#126d85]/20 transition"
          >
            Continue to Private Support →
          </button>

          {/* Privacy */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 leading-relaxed">
              🔒 No name, phone number, or email is attached to this
              session.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}

export default SessionCreatedPage;

