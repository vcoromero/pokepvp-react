import type { StateCreator } from 'zustand'
import type { AppStore, BattleSlice } from './types'

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
      maxHpByPokemonStateId: Object.fromEntries(
        pokemonStates.map((s) => [s.id, s.currentHp])
      ),
    }),

  applyTurnResult: (payload) =>
    set((state) => {
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
          lastTurnResult: payload,
        }
      }
      return {
        battle: nextBattle ?? state.battle,
        pokemonStates: nextStates,
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
