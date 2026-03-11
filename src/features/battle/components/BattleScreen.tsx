import { useBattleFlow } from '../hooks/useBattleFlow'
import { BattleLayout } from './BattleLayout'
import { BattleSide } from './BattleSide'
import { AttackButton } from './AttackButton'
import { TurnIndicator } from './TurnIndicator'
import { WinnerOverlay } from './WinnerOverlay'

export function BattleScreen() {
  const {
    myActive,
    opponentActive,
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

  const myBench = myPokemonOrder.filter((p) => p.id !== myActive?.id)
  const opponentBench = opponentPokemonOrder.filter((p) => p.id !== opponentActive?.id)

  const damageOnMySide =
    lastTurnResult?.defender.playerId === player?.id ? damageText : null
  const damageOnOpponentSide =
    lastTurnResult?.defender.playerId === opponentPlayerId ? damageText : null

  return (
    <BattleLayout>
      {isSamePlayerOnBothSides && (
        <div
          className="mb-4 p-3 rounded-lg bg-amber-900/50 border border-amber-600 text-amber-200 text-sm text-center max-w-2xl mx-auto"
          role="alert"
        >
          Same player detected on both sides (e.g. two tabs with same session). For 2-player testing, use an <strong>incognito window</strong> or another browser for the second player, and use different nicknames to tell them apart.
        </div>
      )}
      <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
        {/* Opponent side (top) */}
        <BattleSide
          active={opponentActive}
          bench={opponentBench}
          maxHpByStateId={maxHpByPokemonStateId}
          label="Opponent"
          damageText={damageOnOpponentSide}
        />

        <TurnIndicator
          isMyTurn={isMyTurn}
          isFinished={isFinished}
          isWaitingForTurnOrder={isWaitingForTurnOrder}
        />
        {attackError && (
          <p className="text-center text-sm text-red-400" role="alert">
            Attack failed: {attackError}
          </p>
        )}

        {/* My side (bottom) */}
        <BattleSide
          active={myActive}
          bench={myBench}
          maxHpByStateId={maxHpByPokemonStateId}
          label="You"
          damageText={damageOnMySide}
        />

        <div className="flex justify-center pt-4">
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
      </div>

      {isFinished && (
        <WinnerOverlay isWinner={!!isWinner} onPlayAgain={playAgain} />
      )}
    </BattleLayout>
  )
}
