import type { Battle, PokemonState, TurnResultPayload } from '@/shared/types'

export interface BattleRepository {
  getBattle(): Battle | null
  getPokemonStates(): PokemonState[]

  setBattleStart(battle: Battle, pokemonStates: PokemonState[]): void
  applyTurnResult(payload: TurnResultPayload): void
  setBattleEnd(winnerId: string): void
  resetBattle(): void
}

