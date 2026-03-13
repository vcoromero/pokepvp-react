import { motion } from 'framer-motion'

interface AttackButtonProps {
  onClick: () => void
  disabled: boolean
  isAttacking: boolean
  /** Shown when disabled (e.g. "Not your turn") */
  disabledReason?: string
}

export function AttackButton({
  onClick,
  disabled,
  isAttacking,
  disabledReason,
}: AttackButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className="py-3 px-8 rounded-lg bg-amber-500 text-slate-900 font-bold text-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
    >
      {isAttacking ? 'Attacking…' : 'Attack'}
    </motion.button>
  )
}
