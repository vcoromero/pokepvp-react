import type { StateCreator } from 'zustand'
import type { AppStore, BattleSlice } from './types'
import { applyTurnResultDomain, computeMaxHpByPokemonStateId } from '@/domain/battle'

export const createBattleSlice: StateCreator<
  AppStore,
  [],
  [],
  BattleSlice
> = (set) => ({
  battle: null,
  pokemonStates: [],
  maxHpByPokemonStateId: {},
  lastTurnResult: null,

  setBattle: (battle) => set({ battle }),

  setPokemonStates: (pokemonStates) => set({ pokemonStates }),

  setLastTurnResult: (lastTurnResult) => set({ lastTurnResult }),

  setBattleStart: (battle, pokemonStates) =>
    set({
      battle,
      pokemonStates,
      lastTurnResult: null,
      maxHpByPokemonStateId: computeMaxHpByPokemonStateId(pokemonStates),
    }),

  applyTurnResult: (payload) =>
    set((state) => {
      const { battle, pokemonStates } = applyTurnResultDomain(
        {
          battle: state.battle,
          pokemonStates: state.pokemonStates,
        },
        payload,
      )
      return {
        battle,
        pokemonStates,
        lastTurnResult: payload,
      }
    }),

  setBattleEnd: (winnerId) =>
    set((state) =>
      state.battle
        ? { battle: { ...state.battle, winnerId } }
        : { battle: state.battle }
    ),

  resetBattle: () =>
    set({
      battle: null,
      pokemonStates: [],
      maxHpByPokemonStateId: {},
      lastTurnResult: null,
    }),
})
