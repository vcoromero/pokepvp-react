import { PulseGlowText } from '@/shared/ui'

interface ReadySectionProps {
  onReady: () => void
  isMarkingReady: boolean
  isReady: boolean
  disabled: boolean
  showWaiting: boolean
}

export function ReadySection({
  onReady,
  isMarkingReady,
  isReady,
  disabled,
  showWaiting,
}: ReadySectionProps) {
  return (
    <>
      <button
        type="button"
        onClick={onReady}
        disabled={disabled || isMarkingReady || isReady}
        className="w-full py-2 px-4 rounded-lg bg-amber-500 text-slate-900 font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isMarkingReady ? 'Marking ready…' : 'Ready'}
      </button>
      {showWaiting && (
        <p className="text-slate-300 text-center text-sm">
          <PulseGlowText>Waiting for opponent to be ready…</PulseGlowText>
        </p>
      )}
    </>
  )
}
