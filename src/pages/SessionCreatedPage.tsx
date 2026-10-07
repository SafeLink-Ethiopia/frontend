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
    <main className="min-h-screen bg-[#f7f5f6] text-[#3e1919] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-xl">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 bg-[#3e1919] flex items-center justify-center">
            <span className="text-[#f0e2d6] text-2xl">♡</span>
          </div>

          <span className="text-lg font-semibold tracking-tight text-[#3e1919]">
            SafeLink
          </span>
        </div>

        {/* Main content */}
        <div className="bg-white border border-[#a79093]/25">
          {/* Success header */}
          <div className="px-7 py-8 md:px-10 md:py-9 border-b border-[#a79093]/20">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 shrink-0 bg-[#f0e2d6] flex items-center justify-center">
                <span className="text-xl font-semibold text-[#3e1919]">
                  ✓
                </span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a79093]">
                  Private session created
                </p>

                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#3e1919] mt-2">
                  Your SafeLink ID
                </h1>

                <p className="text-sm md:text-base text-[#a79093] mt-3 leading-6 max-w-md">
                  Your private session is ready. Keep this ID safe because
                  you'll need it to access your session again.
                </p>
              </div>
            </div>
          </div>

          {/* ID section */}
          <div className="px-7 py-8 md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a79093]">
              Your private ID
            </p>

            <div className="mt-3 bg-[#f0e2d6] border border-[#a79093]/25 px-5 py-6 text-center">
              <p className="text-2xl md:text-3xl font-mono font-semibold tracking-wider text-[#3e1919] break-all">
                {safelinkId}
              </p>
            </div>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="mt-4 text-sm font-semibold text-[#3e1919] hover:text-[#a79093] underline underline-offset-4 transition-colors"
            >
              Copy SafeLink ID
            </button>

            {/* Continue */}
            <button
              onClick={onContinue}
              className="w-full mt-8 bg-[#3e1919] hover:bg-[#2d1111] text-white py-4 px-6 font-semibold transition-colors"
            >
              Continue to Private Support
              <span className="ml-2">→</span>
            </button>

            {/* Privacy information */}
            <div className="mt-7 pt-6 border-t border-[#a79093]/20">
              <div className="flex items-start gap-3">
                <span className="text-sm mt-0.5 text-[#3e1919]">🔒</span>

                <p className="text-xs text-[#a79093] leading-5">
                  No name, phone number, or email is attached to this
                  session. Your SafeLink ID is what you use to return to
                  your private session.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-[#a79093]">
            Keep your SafeLink ID somewhere private and accessible to you.
          </p>
        </div>
      </div>
    </main>
  );
}

export default SessionCreatedPage;