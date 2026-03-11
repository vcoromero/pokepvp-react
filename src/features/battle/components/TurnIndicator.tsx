interface TurnIndicatorProps {
  isMyTurn: boolean
  isFinished: boolean
  isWaitingForTurnOrder?: boolean
}

export function TurnIndicator({
  isMyTurn,
  isFinished,
  isWaitingForTurnOrder = false,
}: TurnIndicatorProps) {
  if (isFinished) return null
  if (isWaitingForTurnOrder) {
    return (
      <p className="text-center text-sm text-amber-400">
        Waiting for turn order from server. If this persists, the backend may not be sending <code className="text-xs bg-slate-700 px-1 rounded">nextToActPlayerId</code> in <code className="text-xs bg-slate-700 px-1 rounded">battle_start</code>.
      </p>
    )
  }
  return (
    <p
      className={`text-center text-sm font-medium ${
        isMyTurn ? 'text-amber-400' : 'text-slate-400'
      }`}
    >
      {isMyTurn ? "Your turn — click Attack!" : "Opponent's turn…"}
    </p>
  )
}
