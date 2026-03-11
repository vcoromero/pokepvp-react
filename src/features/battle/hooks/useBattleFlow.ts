import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, selectIsMyTurn } from '@/shared/store'
import { attack as emitAttack } from '@/shared/api/socket'
import type { PokemonState } from '@/shared/types'

/** First non-defeated Pokémon for a player (by team order for self, by array order for opponent). */
function getActivePokemon(
  states: PokemonState[],
  playerId: string,
  pokemonIdOrder?: number[],
): PokemonState | undefined {
  const forPlayer = states.filter((s) => s.playerId === playerId && !s.defeated)
  if (forPlayer.length === 0) return undefined
  if (pokemonIdOrder) {
    for (const id of pokemonIdOrder) {
      const state = forPlayer.find((s) => s.pokemonId === id)
      if (state) return state
    }
  }
  return forPlayer[0]
}

/** All Pokémon for a player in display order (active first, then bench). */
function getPokemonInOrder(
  states: PokemonState[],
  playerId: string,
  pokemonIdOrder?: number[],
): PokemonState[] {
  const forPlayer = states.filter((s) => s.playerId === playerId)
  if (pokemonIdOrder) {
    const order: PokemonState[] = []
    for (const id of pokemonIdOrder) {
      const state = forPlayer.find((s) => s.pokemonId === id)
      if (state) order.push(state)
    }
    return order
  }
  return forPlayer
}

export function useBattleFlow() {
  const navigate = useNavigate()
  const battle = useAppStore((s) => s.battle)
  const pokemonStates = useAppStore((s) => s.pokemonStates)
  const maxHpByPokemonStateId = useAppStore((s) => s.maxHpByPokemonStateId)
  const lastTurnResult = useAppStore((s) => s.lastTurnResult)
  const player = useAppStore((s) => s.player)
  const team = useAppStore((s) => s.team)
  const lobby = useAppStore((s) => s.lobby)
  const resetBattle = useAppStore((s) => s.resetBattle)
  const resetSession = useAppStore((s) => s.resetSession)
  const isMyTurn = useAppStore(selectIsMyTurn)

  const opponentPlayerId = useMemo(() => {
    if (!player || !lobby) return null
    const other = lobby.playerIds.find((id) => id !== player.id) ?? null
    return other
  }, [player, lobby])

  /** Same session in both tabs: backend sees one player, so "opponent" is also us (or no opponent). */
  const isSamePlayerOnBothSides =
    Boolean(player && lobby && (
      (opponentPlayerId !== null && opponentPlayerId === player.id) ||
      lobby.playerIds.length === 1
    ))

  const myActive = useMemo(
    () =>
      player && team && battle
        ? getActivePokemon(pokemonStates, player.id, team.pokemonIds)
        : undefined,
    [player, team, battle, pokemonStates],
  )

  const opponentActive = useMemo(
    () =>
      opponentPlayerId && battle
        ? getActivePokemon(pokemonStates, opponentPlayerId)
        : undefined,
    [opponentPlayerId, battle, pokemonStates],
  )

  const myPokemonOrder = useMemo(
    () =>
      player && team
        ? getPokemonInOrder(pokemonStates, player.id, team.pokemonIds)
        : [],
    [player, team, pokemonStates],
  )

  const opponentPokemonOrder = useMemo(
    () =>
      opponentPlayerId
        ? getPokemonInOrder(pokemonStates, opponentPlayerId)
        : [],
    [opponentPlayerId, pokemonStates],
  )

  const isFinished = Boolean(battle?.winnerId)
  const winnerId = battle?.winnerId ?? null
  const isWinner = winnerId === player?.id

  /** True when battle exists but turn order was not received (backend may send null). */
  const isWaitingForTurnOrder =
    Boolean(battle && !isFinished && battle.nextToActPlayerId == null)

  const damageText = useMemo(() => {
    if (!lastTurnResult) return null
    return `-${lastTurnResult.defender.damage}`
  }, [lastTurnResult])

  const [isAttacking, setIsAttacking] = useState(false)
  const [attackError, setAttackError] = useState<string | null>(null)
  const attack = useCallback(() => {
    if (!battle?.lobbyId || !isMyTurn || isFinished) return
    setAttackError(null)
    setIsAttacking(true)
    emitAttack(battle.lobbyId, (err) => {
      setIsAttacking(false)
      if (err) setAttackError(err.message)
    })
  }, [battle, isMyTurn, isFinished])

  const playAgain = useCallback(() => {
    resetBattle()
    resetSession()
    navigate('/lobby', { replace: true })
  }, [resetBattle, resetSession, navigate])

  return {
    battle,
    player,
    opponentPlayerId,
    isSamePlayerOnBothSides,
    lobbyId: battle?.lobbyId ?? null,
    myActive,
    opponentActive,
    myPokemonOrder,
    opponentPokemonOrder,
    maxHpByPokemonStateId,
    isMyTurn,
    isFinished,
    isWaitingForTurnOrder,
    winnerId,
    isWinner,
    damageText,
    lastTurnResult,
    attack,
    isAttacking,
    attackError,
    playAgain,
  }
}
