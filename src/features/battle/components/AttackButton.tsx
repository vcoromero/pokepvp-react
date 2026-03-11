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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      className="py-3 px-8 rounded-lg bg-amber-500 text-slate-900 font-bold text-lg hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
    >
      {isAttacking ? 'Attacking…' : 'Attack'}
    </button>
  )
}
