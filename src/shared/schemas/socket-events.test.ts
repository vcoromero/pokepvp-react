import { describe, expect, it } from 'vitest'
import {
  BattleEndPayloadSchema,
  BattleStartPayloadSchema,
  ErrorPayloadSchema,
  LobbyStatusPayloadSchema,
  TurnResultPayloadSchema,
} from './socket-events'

describe('socket-events schemas', () => {
  it('LobbyStatusPayloadSchema accepts valid payload', () => {
    const payload = {
      lobby: {
        id: 'l1',
        status: 'waiting',
        playerIds: ['p1'],
        readyPlayerIds: [],
        createdAt: '2025-01-01T00:00:00.000Z',
      },
      player: { id: 'p1', nickname: 'Alice', lobbyId: 'l1' },
    }
    expect(LobbyStatusPayloadSchema.safeParse(payload).success).toBe(true)
  })

  it('LobbyStatusPayloadSchema rejects invalid lobby status', () => {
    const payload = {
      lobby: {
        id: 'l1',
        status: 'invalid',
        playerIds: [],
        readyPlayerIds: [],
        createdAt: '',
      },
    }
    expect(LobbyStatusPayloadSchema.safeParse(payload).success).toBe(false)
  })

  it('ErrorPayloadSchema accepts valid error payload', () => {
    expect(ErrorPayloadSchema.safeParse({ code: 'X', message: 'Y' }).success).toBe(true)
  })

  it('ErrorPayloadSchema rejects missing code', () => {
    expect(ErrorPayloadSchema.safeParse({ message: 'Y' }).success).toBe(false)
  })

  it('BattleStartPayloadSchema accepts valid payload', () => {
    const payload = {
      battle: {
        id: 'b1',
        lobbyId: 'l1',
        startedAt: '',
        winnerId: undefined,
        nextToActPlayerId: 'p1',
      },
      pokemonStates: [
        {
          id: 's1',
          battleId: 'b1',
          pokemonId: 1,
          playerId: 'p1',
          currentHp: 100,
          defeated: false,
          name: 'Pikachu',
          sprite: '',
          type: ['Electric'],
        },
      ],
    }
    expect(BattleStartPayloadSchema.safeParse(payload).success).toBe(true)
  })

  it('TurnResultPayloadSchema rejects when defender missing damage', () => {
    const payload = {
      battleId: 'b1',
      lobbyId: 'l1',
      attacker: { playerId: 'p1', pokemonId: 1 },
      defender: {
        playerId: 'p2',
        pokemonId: 2,
        previousHp: 80,
        currentHp: 50,
        defeated: false,
      },
      nextActivePokemon: { playerId: 'p2', pokemonId: 2 },
      battleFinished: false,
    }
    expect(TurnResultPayloadSchema.safeParse(payload).success).toBe(false)
  })

  it('BattleEndPayloadSchema accepts minimal payload', () => {
    expect(
      BattleEndPayloadSchema.safeParse({
        battleId: 'b1',
        lobbyId: 'l1',
        winnerId: 'p1',
      }).success,
    ).toBe(true)
  })
})
