import { useState } from 'react'
import { useAppStore } from '@/shared/store'
import { connect } from '@/shared/api/socket'
import { ConnectionBanner } from '@/shared/ui'
import { useBattleFlow } from '../hooks/useBattleFlow'
import { BattleLayout } from './BattleLayout'
import { BattleSide } from './BattleSide'
import { AttackButton } from './AttackButton'
import { TurnIndicator } from './TurnIndicator'
import { WinnerOverlay } from './WinnerOverlay'

export function BattleScreen() {
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)
  const socketStatus = useAppStore((s) => s.socketStatus)
  const lastError = useAppStore((s) => s.lastError)
  const {
    displayMyActive,
    displayOpponentActive,
    isMyActiveFainted,
    isOpponentActiveFainted,
    myPokemonOrder,
    opponentPokemonOrder,
    maxHpByPokemonStateId,
    isMyTurn,
    isFinished,
    isWaitingForTurnOrder,
    isSamePlayerOnBothSides,
    isWinner,
    damageText,
    attack,
    isAttacking,
    attackError,
    surrender,
    isSurrendering,
    surrenderError,
    playAgain,
    player,
    opponentPlayerId,
    lastTurnResult,
  } = useBattleFlow()

  const [isSurrenderModalOpen, setIsSurrenderModalOpen] = useState(false)

  const myBench = myPokemonOrder.filter((p) => p.id !== displayMyActive?.id)
  const opponentBench = opponentPokemonOrder.filter((p) => p.id !== displayOpponentActive?.id)

  // Only show damage on the active Pokémon that actually received it; when a Pokémon
  // is knocked out and a new one enters, the active changes so we hide the old value.
  const damageOnMySide =
    lastTurnResult?.defender.playerId === player?.id &&
    lastTurnResult?.defender.pokemonId === displayMyActive?.pokemonId
      ? damageText
      : null
  const damageOnOpponentSide =
    lastTurnResult?.defender.playerId === opponentPlayerId &&
    lastTurnResult?.defender.pokemonId === displayOpponentActive?.pokemonId
      ? damageText
      : null

  const canSurrender = !isFinished

  const handleRetry = () => {
    if (backendBaseUrl) connect(backendBaseUrl)
  }

  return (
    <BattleLayout
      bottomBar={
        !isFinished ? (
          <div className="flex justify-center gap-3">
            {canSurrender && (
              <button
                type="button"
                onClick={() => setIsSurrenderModalOpen(true)}
                disabled={isSurrendering}
                className="py-2.5 px-4 rounded-lg border border-slate-500 text-slate-200 text-sm sm:text-base hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSurrendering ? 'Surrendering…' : 'Surrender'}
              </button>
            )}
            <AttackButton
              onClick={attack}
              disabled={!isMyTurn || isFinished || isAttacking}
              isAttacking={isAttacking}
              disabledReason={
                isFinished
                  ? 'Battle ended'
                  : isAttacking
                    ? 'Attacking…'
                    : !isMyTurn
                      ? 'Not your turn'
                      : undefined
              }
            />
          </div>
        ) : null
      }
    >
      <ConnectionBanner
        socketStatus={socketStatus}
        lastError={lastError}
        actionError={
          attackError
            ? `Attack failed: ${attackError}`
            : surrenderError
              ? `Surrender failed: ${surrenderError}`
              : null
        }
        onRetry={handleRetry}
      />
      {isSamePlayerOnBothSides && (
        <div
          className="mb-4 p-3 rounded-lg bg-amber-900/50 border border-amber-600 text-amber-200 text-sm text-center max-w-2xl mx-auto"
          role="alert"
        >
          Same player detected on both sides (e.g. two tabs with same session). For 2-player testing, use an <strong>incognito window</strong> or another browser for the second player, and use different nicknames to tell them apart.
        </div>
      )}
      <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 w-full max-w-4xl mx-auto pb-2 md:w-[80%]">
        {/* Opponent side (top) */}
        <BattleSide
          active={displayOpponentActive}
          bench={opponentBench}
          maxHpByStateId={maxHpByPokemonStateId}
          label="Opponent"
          damageText={damageOnOpponentSide}
          isActiveFainted={isOpponentActiveFainted}
        />

        <TurnIndicator
          isMyTurn={isMyTurn}
          isFinished={isFinished}
          isWaitingForTurnOrder={isWaitingForTurnOrder}
        />

        {/* My side (bottom) */}
        <BattleSide
          active={displayMyActive}
          bench={myBench}
          maxHpByStateId={maxHpByPokemonStateId}
          label="You"
          damageText={damageOnMySide}
          isActiveFainted={isMyActiveFainted}
        />
      </div>

      {isFinished && (
        <WinnerOverlay isWinner={!!isWinner} onPlayAgain={playAgain} />
      )}

      {isSurrenderModalOpen && canSurrender && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/70 px-4">
          <div className="w-full max-w-sm rounded-lg bg-slate-800 border border-slate-600 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Surrender battle?</h2>
            <p className="text-sm text-slate-300">
              If you surrender, your opponent will win this battle immediately.
            </p>
            {surrenderError && (
              <p className="text-sm text-red-400">{surrenderError}</p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-3 py-2 text-sm rounded border border-slate-500 text-slate-200 hover:bg-slate-700"
                onClick={() => setIsSurrenderModalOpen(false)}
                disabled={isSurrendering}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-2 text-sm rounded bg-red-600 text-white font-semibold hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  surrender()
                  setIsSurrenderModalOpen(false)
                }}
                disabled={isSurrendering}
              >
                Yes, surrender
              </button>
            </div>
          </div>
        </div>
      )}
    </BattleLayout>
  )
}
