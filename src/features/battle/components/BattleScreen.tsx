import { useAppStore } from '@/shared/store'
import { ConnectionBanner } from '@/shared/ui'
import { useBattleFlow } from '../hooks/useBattleFlow'
import { BattleLayout } from './BattleLayout'
import { BattleSide } from './BattleSide'
import { AttackButton } from './AttackButton'
import { TurnIndicator } from './TurnIndicator'
import { WinnerOverlay } from './WinnerOverlay'

export function BattleScreen() {
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
    playAgain,
    player,
    opponentPlayerId,
    lastTurnResult,
  } = useBattleFlow()

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

  return (
    <BattleLayout
      bottomBar={
        !isFinished ? (
          <div className="flex justify-center">
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
        actionError={attackError ? `Attack failed: ${attackError}` : null}
      />
      {isSamePlayerOnBothSides && (
        <div
          className="mb-4 p-3 rounded-lg bg-amber-900/50 border border-amber-600 text-amber-200 text-sm text-center max-w-2xl mx-auto"
          role="alert"
        >
          Same player detected on both sides (e.g. two tabs with same session). For 2-player testing, use an <strong>incognito window</strong> or another browser for the second player, and use different nicknames to tell them apart.
        </div>
      )}
      <div className="flex flex-col gap-8 w-[80%] max-w-4xl mx-auto pb-2">
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
    </BattleLayout>
  )
}
