import type { Battle, PokemonState, TurnResultPayload } from '@/shared/types'

export interface BattleDomainState {
  battle: Battle | null
  pokemonStates: PokemonState[]
}

export interface BattleDomainResult {
  battle: Battle | null
  pokemonStates: PokemonState[]
}

export function applyTurnResultDomain(
  state: BattleDomainState,
  payload: TurnResultPayload,
): BattleDomainResult {
  const nextStates = state.pokemonStates.map((s) => {
    if (
      s.playerId === payload.defender.playerId &&
      s.pokemonId === payload.defender.pokemonId
    ) {
      return {
        ...s,
        currentHp: payload.defender.currentHp,
        defeated: payload.defender.defeated,
      }
    }
    return s
  })

  const nextBattle =
    state.battle && payload.nextToActPlayerId !== undefined
      ? { ...state.battle, nextToActPlayerId: payload.nextToActPlayerId }
      : state.battle

  if (payload.battleFinished && state.battle) {
    return {
      battle: { ...state.battle, winnerId: payload.attacker.playerId },
      pokemonStates: nextStates,
    }
  }

  return {
    battle: nextBattle ?? state.battle,
    pokemonStates: nextStates,
  }
}

export function isBattleFinished(battle: { winnerId: string | null } | null): boolean {
  return battle != null && battle.winnerId != null
}

export function computeMaxHpByPokemonStateId(
  pokemonStates: PokemonState[],
): Record<string, number> {
  return Object.fromEntries(
    pokemonStates.map((s) => [s.id, s.currentHp]),
  )
}

