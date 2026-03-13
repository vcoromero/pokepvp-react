import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const DISPLAY_MS = 1800

interface BattleStartOverlayProps {
  /** When true, overlay is visible and will auto-dismiss after DISPLAY_MS. */
  visible: boolean
  /** Stable key for AnimatePresence (e.g. battleId). */
  overlayKey: string
  /** Called once after display duration so parent can hide the overlay. */
  onDismiss: () => void
}

/**
 * Short full-screen "Battle start!" overlay. No interaction; auto-dismisses.
 * Use with AnimatePresence in parent for exit animation.
 */
export function BattleStartOverlay({
  visible,
  overlayKey,
  onDismiss,
}: BattleStartOverlayProps) {
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(onDismiss, DISPLAY_MS)
    return () => clearTimeout(t)
  }, [visible, onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={overlayKey}
          className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/80 text-white pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' as const }}
          aria-live="polite"
          aria-label="Battle start"
        >
          <motion.span
            className="text-3xl font-bold tracking-wide sm:text-4xl drop-shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' as const }}
          >
            Battle start!
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
