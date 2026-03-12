import { describe, expect, it } from 'vitest'
import { createBattleSlice } from './battle'
import type { AppStore } from './types'
import type { TurnResultPayload } from '@/shared/types'

function createTestStore(initial?: Partial<AppStore>) {
  let state: any = {
    battle: null,
    pokemonStates: [],
    maxHpByPokemonStateId: {},
    lastTurnResult: null,
    ...initial,
  }

  const set = (updater: any) => {
    state =
      typeof updater === 'function'
        ? { ...state, ...updater(state) }
        : { ...state, ...updater }
  }

  const slice = createBattleSlice(set as any, () => state, {} as any)

  const getState = () => state

  return { getState, slice }
}

describe('createBattleSlice', () => {
  it('setBattle updates battle state', () => {
    const { getState, slice } = createTestStore()
    const battle = { id: 'b1', lobbyId: 'l1', winnerId: null, nextToActPlayerId: 'p1' } as any

    slice.setBattle(battle)

    expect(getState().battle).toEqual(battle)
  })

  it('setPokemonStates updates pokemonStates', () => {
    const { getState, slice } = createTestStore()
    const pokemonStates = [
      { id: 's1', battleId: 'b1', pokemonId: 1, playerId: 'p1', currentHp: 100, defeated: false, name: 'A', sprite: '', type: [] },
    ]

    slice.setPokemonStates(pokemonStates)

    expect(getState().pokemonStates).toEqual(pokemonStates)
  })

  it('setLastTurnResult updates lastTurnResult', () => {
    const { getState, slice } = createTestStore()
    const payload: TurnResultPayload = {
      battleId: 'b1',
      lobbyId: 'l1',
      attacker: { playerId: 'p1', pokemonId: 1 },
      defender: { playerId: 'p2', pokemonId: 2, damage: 10, previousHp: 80, currentHp: 70, defeated: false },
      nextActivePokemon: { playerId: 'p2', pokemonId: 2 },
      battleFinished: false,
      nextToActPlayerId: 'p2',
    }

    slice.setLastTurnResult(payload)

    expect(getState().lastTurnResult).toEqual(payload)
  })

  it('setBattleStart initializes battle, pokemonStates and maxHpByPokemonStateId', () => {
    const { getState, slice } = createTestStore()

    const battle = { id: 'b1', lobbyId: 'l1', winnerId: null, nextToActPlayerId: 'p1' } as any
    const pokemonStates = [
      { id: 's1', battleId: 'b1', pokemonId: 1, playerId: 'p1', currentHp: 100, defeated: false, name: 'A', sprite: '', type: [] },
      { id: 's2', battleId: 'b1', pokemonId: 2, playerId: 'p2', currentHp: 80, defeated: false, name: 'B', sprite: '', type: [] },
    ]

    slice.setBattleStart(battle, pokemonStates)

    const state = getState()

    expect(state.battle).toEqual(battle)
    expect(state.pokemonStates).toEqual(pokemonStates)
    expect(state.maxHpByPokemonStateId).toEqual({
      s1: 100,
      s2: 80,
    })
    expect(state.lastTurnResult).toBeNull()
  })

  it('applyTurnResult updates defender HP and nextToActPlayerId', () => {
    const battle = { id: 'b1', lobbyId: 'l1', winnerId: null, nextToActPlayerId: 'p1' } as any
    const pokemonStates = [
      { id: 's1', battleId: 'b1', pokemonId: 1, playerId: 'p1', currentHp: 100, defeated: false, name: 'A', sprite: '', type: [] },
      { id: 's2', battleId: 'b1', pokemonId: 2, playerId: 'p2', currentHp: 80, defeated: false, name: 'B', sprite: '', type: [] },
    ]
    const { getState, slice } = createTestStore({ battle, pokemonStates })

    const payload: TurnResultPayload = {
      battleId: 'b1',
      lobbyId: 'l1',
      attacker: { playerId: 'p1', pokemonId: 1 },
      defender: {
        playerId: 'p2',
        pokemonId: 2,
        damage: 30,
        previousHp: 80,
        currentHp: 50,
        defeated: false,
      },
      nextActivePokemon: { playerId: 'p2', pokemonId: 2 },
      battleFinished: false,
      nextToActPlayerId: 'p2',
    }

    slice.applyTurnResult(payload)

    const state = getState()
    const updatedDefender = state.pokemonStates.find((s: any) => s.id === 's2')
    expect(updatedDefender.currentHp).toBe(50)
    expect(updatedDefender.defeated).toBe(false)
    expect(state.battle?.nextToActPlayerId).toBe('p2')
    expect(state.lastTurnResult).toEqual(payload)
  })

  it('applyTurnResult sets winnerId when battleFinished is true', () => {
    const battle = { id: 'b1', lobbyId: 'l1', winnerId: null, nextToActPlayerId: 'p1' } as any
    const pokemonStates = [
      { id: 's1', battleId: 'b1', pokemonId: 1, playerId: 'p1', currentHp: 100, defeated: false, name: 'A', sprite: '', type: [] },
      { id: 's2', battleId: 'b1', pokemonId: 2, playerId: 'p2', currentHp: 80, defeated: false, name: 'B', sprite: '', type: [] },
    ]
    const { getState, slice } = createTestStore({ battle, pokemonStates })

    const payload: TurnResultPayload = {
      battleId: 'b1',
      lobbyId: 'l1',
      attacker: { playerId: 'p1', pokemonId: 1 },
      defender: {
        playerId: 'p2',
        pokemonId: 2,
        damage: 80,
        previousHp: 80,
        currentHp: 0,
        defeated: true,
      },
      nextActivePokemon: { playerId: 'p2', pokemonId: null },
      battleFinished: true,
      nextToActPlayerId: undefined,
    }

    slice.applyTurnResult(payload)

    const state = getState()

    expect(state.battle?.winnerId).toBe('p1')
    expect(state.lastTurnResult).toEqual(payload)
  })

  it('setBattleEnd updates battle winnerId when battle exists', () => {
    const battle = { id: 'b1', lobbyId: 'l1', winnerId: null, nextToActPlayerId: 'p1' } as any
    const { getState, slice } = createTestStore({ battle })

    slice.setBattleEnd('p1')

    expect(getState().battle?.winnerId).toBe('p1')
  })

  it('setBattleEnd does not mutate state when battle is null', () => {
    const { getState, slice } = createTestStore({ battle: null })

    slice.setBattleEnd('p1')

    expect(getState().battle).toBeNull()
  })

  it('resetBattle clears battle, pokemonStates, maxHpByPokemonStateId and lastTurnResult', () => {
    const battle = { id: 'b1', lobbyId: 'l1', winnerId: null, nextToActPlayerId: 'p1' } as any
    const pokemonStates = [
      { id: 's1', battleId: 'b1', pokemonId: 1, playerId: 'p1', currentHp: 100, defeated: false, name: 'A', sprite: '', type: [] },
    ]
    const { getState, slice } = createTestStore({
      battle,
      pokemonStates,
      maxHpByPokemonStateId: { s1: 100 },
      lastTurnResult: {} as TurnResultPayload,
    })

    slice.resetBattle()

    const state = getState()
    expect(state.battle).toBeNull()
    expect(state.pokemonStates).toEqual([])
    expect(state.maxHpByPokemonStateId).toEqual({})
    expect(state.lastTurnResult).toBeNull()
  })
})

