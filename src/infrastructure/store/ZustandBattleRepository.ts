import { useAppStore } from '@/shared/store'
import type { BattleRepository } from '@/application/ports/BattleRepository'
import type { Battle, PokemonState, TurnResultPayload } from '@/shared/types'

export class ZustandBattleRepository implements BattleRepository {
  getBattle(): Battle | null {
    return useAppStore.getState().battle
  }

  getPokemonStates(): PokemonState[] {
    return useAppStore.getState().pokemonStates
  }

  setBattleStart(battle: Battle, pokemonStates: PokemonState[]): void {
    useAppStore.getState().setBattleStart(battle, pokemonStates)
  }

  applyTurnResult(payload: TurnResultPayload): void {
    useAppStore.getState().applyTurnResult(payload)
  }

  setBattleEnd(winnerId: string): void {
    useAppStore.getState().setBattleEnd(winnerId)
  }

  resetBattle(): void {
    useAppStore.getState().resetBattle()
  }
}

