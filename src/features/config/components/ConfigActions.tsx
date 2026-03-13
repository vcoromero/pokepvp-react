interface ConfigActionsProps {
  isTesting: boolean
  canTest: boolean
  canSave: boolean
  onTest: () => void
  onSave: () => void
}

export function ConfigActions({
  isTesting,
  canTest,
  canSave,
  onTest,
  onSave,
}: ConfigActionsProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onTest}
        disabled={!canTest || isTesting}
        className="btn-base flex-1 py-2 px-4 bg-slate-700 text-white font-medium hover:bg-slate-600"
      >
        {isTesting ? 'Testing…' : 'Test connection'}
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className="btn-base flex-1 py-2 px-4 bg-amber-500 text-slate-900 font-medium hover:bg-amber-400"
      >
        Save &amp; go to Lobby
      </button>
    </div>
  )
}
