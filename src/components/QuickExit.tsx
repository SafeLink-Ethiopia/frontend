interface QuickExitProps {
  onExit?: () => void;
}

export default function QuickExit({ onExit }: QuickExitProps = {}) {
  const handleQuickExit = () => {
    if (onExit) {
      onExit();
      return;
    }

    window.location.replace("https://www.google.com");
  };

  return (
    <button
      type="button"
      onClick={handleQuickExit}
      aria-label="Quick Exit"
      className="fixed right-5 top-5 z-50 flex items-center gap-2 border border-[#a79093] bg-[#f7f5f6] px-4 py-2.5 text-sm font-semibold text-[#3e1919] shadow-sm transition hover:border-[#3e1919] hover:bg-[#f0e2d6] focus:outline-none focus:ring-2 focus:ring-[#a79093] focus:ring-offset-2"
    >
      <span
        aria-hidden="true"
        className="text-lg leading-none text-[#3e1919]"
      >
        ×
      </span>

      <span>Quick Exit</span>
    </button>
  );
}