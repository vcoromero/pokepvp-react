interface HpBarProps {
  currentHp: number
  maxHp: number
  className?: string
}

/**
 * Horizontal HP bar; width is (currentHp / maxHp) * 100%.
 * Safe when maxHp is 0 (shows 0%).
 */
export function HpBar({ currentHp, maxHp, className = '' }: HpBarProps) {
  const percent = maxHp > 0 ? Math.min(100, (currentHp / maxHp) * 100) : 0
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-slate-700 ${className}`}
      role="progressbar"
      aria-valuenow={currentHp}
      aria-valuemin={0}
      aria-valuemax={maxHp}
    >
      <div
        className={`h-full rounded-full transition-[width] ${
          percent > 50 ? 'bg-green-500' : percent > 25 ? 'bg-amber-500' : 'bg-red-500'
        }`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}
