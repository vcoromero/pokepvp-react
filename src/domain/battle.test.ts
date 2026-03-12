import { describe, expect, it } from 'vitest'
import type { Battle, PokemonState, TurnResultPayload } from '@/shared/types'
import { applyTurnResultDomain } from './battle'

describe('battle domain', () => {
  it('applyTurnResultDomain updates defender HP and nextToActPlayerId', () => {
    const battle: Battle = {
      id: 'b1',
      lobbyId: 'l1',
      winnerId: null,
      nextToActPlayerId: 'p1',
    } as any

    const pokemonStates: PokemonState[] = [
      {
        id: 's1',
        battleId: 'b1',
        pokemonId: 1,
        playerId: 'p1',
        currentHp: 100,
        defeated: false,
        name: 'A',
        sprite: '',
        type: [],
      } as any,
      {
        id: 's2',
        battleId: 'b1',
        pokemonId: 2,
        playerId: 'p2',
        currentHp: 80,
        defeated: false,
        name: 'B',
        sprite: '',
        type: [],
      } as any,
    ]

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

    const result = applyTurnResultDomain(
      { battle, pokemonStates },
      payload,
    )

    const updatedDefender = result.pokemonStates.find((s) => s.id === 's2')
    expect(updatedDefender?.currentHp).toBe(50)
    expect(updatedDefender?.defeated).toBe(false)
    expect(result.battle?.nextToActPlayerId).toBe('p2')
  })

  it('applyTurnResultDomain sets winnerId when battleFinished is true', () => {
    const battle: Battle = {
      id: 'b1',
      lobbyId: 'l1',
      winnerId: null,
      nextToActPlayerId: 'p1',
    } as any

    const pokemonStates: PokemonState[] = [
      {
        id: 's1',
        battleId: 'b1',
        pokemonId: 1,
        playerId: 'p1',
        currentHp: 100,
        defeated: false,
        name: 'A',
        sprite: '',
        type: [],
      } as any,
      {
        id: 's2',
        battleId: 'b1',
        pokemonId: 2,
        playerId: 'p2',
        currentHp: 80,
        defeated: false,
        name: 'B',
        sprite: '',
        type: [],
      } as any,
    ]

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

    const result = applyTurnResultDomain(
      { battle, pokemonStates },
      payload,
    )

    expect(result.battle?.winnerId).toBe('p1')
  })

  it('applyTurnResultDomain leaves non-defender pokemon states unchanged', () => {
    const battle: Battle = {
      id: 'b1',
      lobbyId: 'l1',
      winnerId: null,
      nextToActPlayerId: 'p1',
    } as any

    const pokemonStates: PokemonState[] = [
      {
        id: 's1',
        battleId: 'b1',
        pokemonId: 1,
        playerId: 'p1',
        currentHp: 100,
        defeated: false,
        name: 'A',
        sprite: '',
        type: [],
      } as any,
      {
        id: 's2',
        battleId: 'b1',
        pokemonId: 2,
        playerId: 'p2',
        currentHp: 80,
        defeated: false,
        name: 'B',
        sprite: '',
        type: [],
      } as any,
    ]

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

    const result = applyTurnResultDomain(
      { battle, pokemonStates },
      payload,
    )

    const attackerState = result.pokemonStates.find((s) => s.id === 's1')
    expect(attackerState?.currentHp).toBe(100)
    expect(attackerState?.defeated).toBe(false)
  })
})
