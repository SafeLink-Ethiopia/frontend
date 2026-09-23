
interface QuickExitProps {
  onExit: () => void;
}

function QuickExit({ onExit }: QuickExitProps) {
  return (
    <button
      type="button"
      onClick={onExit}
      className="
        flex
        items-center
        justify-center
        gap-2
        border
        border-red-200
        bg-white
        text-red-600
        px-5
        py-2.5
        rounded-full
        text-sm
        font-semibold
        hover:bg-red-50
        transition
      "
    >
      <span>×</span>
      Quick Exit
    </button>
  );
}

export default QuickExit;

