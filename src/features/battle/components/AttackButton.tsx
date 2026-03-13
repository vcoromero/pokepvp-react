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
      className="btn-base py-3 px-8 bg-amber-500 text-slate-900 font-bold hover:bg-amber-400"
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15 }}
    >
      {isAttacking ? 'Attacking…' : 'Attack'}
    </motion.button>
  )
}
