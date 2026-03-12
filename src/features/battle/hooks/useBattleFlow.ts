import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore, selectIsMyTurn } from '@/shared/store'
import { useBattleService } from '@/app/services-context'
import type { PokemonState } from '@/shared/types'

/** How long to keep showing the fainted Pokémon before switching to the next (ms). */
const FAINT_DISPLAY_MS = 1800

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
  const battleService = useBattleService()
  const battle = useAppStore((s) => s.battle)
  const pokemonStates = useAppStore((s) => s.pokemonStates)
  const maxHpByPokemonStateId = useAppStore((s) => s.maxHpByPokemonStateId)
  const lastTurnResult = useAppStore((s) => s.lastTurnResult)
  const player = useAppStore((s) => s.player)
  const team = useAppStore((s) => s.team)
  const lobby = useAppStore((s) => s.lobby)
  const isMyTurn = useAppStore(selectIsMyTurn)

  const opponentPlayerId = useMemo(() => {
    if (!player || !lobby) return null
    const other = lobby.playerIds.find((id) => id !== player.id) ?? null
    return other
  }, [player, lobby])

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

  const [faintDisplayUntil, setFaintDisplayUntil] = useState<number | null>(null)

  useEffect(() => {
    if (!lastTurnResult?.defender.defeated) return
    const until = Date.now() + FAINT_DISPLAY_MS
    setFaintDisplayUntil(until)
    const t = setTimeout(() => setFaintDisplayUntil(null), FAINT_DISPLAY_MS)
    return () => clearTimeout(t)
  }, [lastTurnResult?.defender.defeated, lastTurnResult?.defender.playerId, lastTurnResult?.defender.pokemonId])

  const faintedDefenderState = useMemo(() => {
    if (!lastTurnResult?.defender.defeated || !faintDisplayUntil || Date.now() > faintDisplayUntil) return null
    return pokemonStates.find(
      (s) =>
        s.playerId === lastTurnResult.defender.playerId &&
        s.pokemonId === lastTurnResult.defender.pokemonId
    ) ?? null
  }, [lastTurnResult, pokemonStates, faintDisplayUntil])

  const isInFaintDelay = faintDisplayUntil != null && Date.now() <= faintDisplayUntil

  const displayMyActive = useMemo((): PokemonState | undefined => {
    if (isInFaintDelay && faintedDefenderState && lastTurnResult && player && lastTurnResult.defender.playerId === player.id) {
      return faintedDefenderState
    }
    return myActive
  }, [isInFaintDelay, faintedDefenderState, lastTurnResult, player, myActive])

  const displayOpponentActive = useMemo((): PokemonState | undefined => {
    if (isInFaintDelay && faintedDefenderState && lastTurnResult && opponentPlayerId && lastTurnResult.defender.playerId === opponentPlayerId) {
      return faintedDefenderState
    }
    return opponentActive
  }, [isInFaintDelay, faintedDefenderState, lastTurnResult, opponentPlayerId, opponentActive])

  const isMyActiveFainted = Boolean(displayMyActive?.defeated)
  const isOpponentActiveFainted = Boolean(displayOpponentActive?.defeated)

  const isWaitingForTurnOrder =
    Boolean(battle && !isFinished && battle.nextToActPlayerId == null)

  const damageText = useMemo(() => {
    if (!lastTurnResult) return null
    return `-${lastTurnResult.defender.damage}`
  }, [lastTurnResult])

  const [isAttacking, setIsAttacking] = useState(false)
  const [attackError, setAttackError] = useState<string | null>(null)
  const attack = useCallback(async () => {
    if (!battle?.lobbyId || !isMyTurn || isFinished) return
    setAttackError(null)
    setIsAttacking(true)
    const result = await battleService.attack(battle.lobbyId)
    setIsAttacking(false)
    if (result.error) setAttackError(result.error)
  }, [battle, isMyTurn, isFinished, battleService])

  const [isSurrendering, setIsSurrendering] = useState(false)
  const [surrenderError, setSurrenderError] = useState<string | null>(null)
  const surrender = useCallback(async () => {
    if (!battle?.lobbyId || isFinished) return
    setSurrenderError(null)
    setIsSurrendering(true)
    const result = await battleService.surrender(battle.lobbyId)
    setIsSurrendering(false)
    if (result.error) setSurrenderError(result.error)
  }, [battle, isFinished, battleService])

  const playAgain = useCallback(() => {
    battleService.resetAndLeave()
    navigate('/lobby', { replace: true })
  }, [battleService, navigate])

  return {
    battle,
    player,
    opponentPlayerId,
    isSamePlayerOnBothSides,
    lobbyId: battle?.lobbyId ?? null,
    myActive,
    opponentActive,
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
    winnerId,
    isWinner,
    damageText,
    lastTurnResult,
    attack,
    isAttacking,
    attackError,
    surrender,
    isSurrendering,
    surrenderError,
    playAgain,
  }
}
