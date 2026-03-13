import { motion } from 'framer-motion'

interface WinnerOverlayProps {
  isWinner: boolean
  onPlayAgain: () => void
}

export function WinnerOverlay({ isWinner, onPlayAgain }: WinnerOverlayProps) {
  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2
        className="text-3xl font-bold mb-2"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        {isWinner ? 'You win!' : 'You lost'}
      </motion.h2>
      <motion.p
        className="text-slate-400 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.2 }}
      >
        {isWinner ? 'Congratulations!' : 'Better luck next time.'}
      </motion.p>
      <motion.button
        type="button"
        onClick={onPlayAgain}
        className="py-2 px-6 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-400"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.2 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        Play again
      </motion.button>
    </motion.div>
  )
}
