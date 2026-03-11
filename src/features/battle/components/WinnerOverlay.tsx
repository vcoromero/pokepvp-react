interface WinnerOverlayProps {
  isWinner: boolean
  onPlayAgain: () => void
}

export function WinnerOverlay({ isWinner, onPlayAgain }: WinnerOverlayProps) {
  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-white p-4">
      <h2 className="text-3xl font-bold mb-2">
        {isWinner ? 'You win!' : 'You lost'}
      </h2>
      <p className="text-slate-400 mb-6">
        {isWinner ? 'Congratulations!' : 'Better luck next time.'}
      </p>
      <button
        type="button"
        onClick={onPlayAgain}
        className="py-2 px-6 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-400"
      >
        Play again
      </button>
    </div>
  )
}
