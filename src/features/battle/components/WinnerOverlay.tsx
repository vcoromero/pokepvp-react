import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ANNOUNCE_DURATION_MS = 1200

interface WinnerOverlayProps {
  isWinner: boolean
  onPlayAgain: () => void
}

type Phase = 'announce' | 'result'

/**
 * Victory/defeat overlay: short "Victory!" / "Defeat!" phase, then result + Play again.
 * Keeps presentation (UI) separate from timing (phase) for testability and clarity.
 */
export function WinnerOverlay({ isWinner, onPlayAgain }: WinnerOverlayProps) {
  const [phase, setPhase] = useState<Phase>('announce')

  useEffect(() => {
    const t = setTimeout(() => setPhase('result'), ANNOUNCE_DURATION_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/90 text-white p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {phase === 'announce' ? (
          <motion.div
            key="announce"
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.25, ease: 'easeOut' as const }}
          >
            <span
              className={`text-4xl font-bold tracking-wide sm:text-5xl drop-shadow-lg ${
                isWinner ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {isWinner ? 'Victory!' : 'Defeat!'}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            className="flex flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.h2
              className="text-3xl font-bold mb-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05, duration: 0.25 }}
            >
              {isWinner ? 'You win!' : 'You lost'}
            </motion.h2>
            <motion.p
              className="text-slate-400 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.2 }}
            >
              {isWinner ? 'Congratulations!' : 'Better luck next time.'}
            </motion.p>
            <motion.button
              type="button"
              onClick={onPlayAgain}
              className="btn-base py-2 px-6 bg-amber-500 text-slate-900 font-medium hover:bg-amber-400"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Play again
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
