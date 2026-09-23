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
      className="fixed right-4 top-4 z-50 flex items-center justify-center gap-2 rounded-full border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-md transition hover:bg-red-50"
    >
      <span>×</span>
      Quick Exit
    </button>
  );
}
