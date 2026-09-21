export default function QuickExit() {
  const handleQuickExit = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <button
      onClick={handleQuickExit}
      className="fixed right-4 top-4 z-50 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-red-700"
      aria-label="Quick Exit"
    >
      Quick Exit
    </button>
  );
}
