import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Wraps text with a subtle pulse (scale) and soft glow so it stands out
 * on busy backgrounds without using a box. No background, no border.
 */
interface PulseGlowTextProps {
  children: ReactNode
  className?: string
}

export function PulseGlowText({ children, className = '' }: PulseGlowTextProps) {
  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{ scale: [1, 1.04, 1] }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      }}
      style={{
        textShadow:
          '0 0 8px currentColor, 0 0 16px currentColor',
      }}
    >
      {children}
    </motion.span>
  )
}
