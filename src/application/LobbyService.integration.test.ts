import { describe, expect, it } from 'vitest'
import { LobbyService } from './LobbyService'
import {
  createMockConnectionStore,
  createMockSessionStore,
  createMockRealtimeGateway,
} from './__mocks__/mock-ports'
import type {
  AssignPokemonAckData,
  JoinLobbyAckData,
  Lobby,
} from '@/shared/types'

describe('LobbyService (integration)', () => {
  it('join() returns error when backend URL is not configured', async () => {
    const connectionStore = createMockConnectionStore({ backendBaseUrl: null })
    const sessionStore = createMockSessionStore()
    const realtime = createMockRealtimeGateway({})

    const service = new LobbyService(realtime, sessionStore, connectionStore)
    const result = await service.join('Alice')

    expect(result.error).toBe('Backend URL not configured')
    expect(sessionStore.getPlayer()).toBeNull()
    expect(sessionStore.getLobby()).toBeNull()
  })

  it('join() updates session store when realtime gateway succeeds', async () => {
    const connectionStore = createMockConnectionStore({
      backendBaseUrl: 'https://api.example.com',
    })
    const sessionStore = createMockSessionStore()
    const joinLobbyAck: JoinLobbyAckData = {
      player: { id: 'p1', nickname: 'Alice', lobbyId: 'l1' },
      lobby: {
        id: 'l1',
        status: 'waiting',
        playerIds: ['p1'],
        readyPlayerIds: [],
        createdAt: new Date().toISOString(),
      },
    }
    const realtime = createMockRealtimeGateway({
      joinLobby: (_nickname, ack) => {
        ack(null, joinLobbyAck)
      },
    })

    const service = new LobbyService(realtime, sessionStore, connectionStore)
    const result = await service.join('Alice')

    expect(result.error).toBeUndefined()
    expect(sessionStore.getPlayer()).toEqual(joinLobbyAck.player)
    expect(sessionStore.getLobby()).toEqual(joinLobbyAck.lobby)
  })

  it('join() returns mapped error when realtime gateway reports error', async () => {
    const connectionStore = createMockConnectionStore({
      backendBaseUrl: 'https://api.example.com',
    })
    const sessionStore = createMockSessionStore()
    const realtime = createMockRealtimeGateway({
      joinLobby: (_nickname, ack) => {
        ack({ code: 'NotConnected', message: 'Socket not connected' }, undefined)
      },
    })

    const service = new LobbyService(realtime, sessionStore, connectionStore)
    const result = await service.join('Alice')

    expect(result.error).toContain('Not connected')
    expect(sessionStore.getPlayer()).toBeNull()
  })

  describe('assignTeam', () => {
    it('returns teamDetails and updates session store when gateway returns plain team', async () => {
      const sessionStore = createMockSessionStore()
      const teamData: AssignPokemonAckData = {
        id: 't1',
        lobbyId: 'l1',
        playerId: 'p1',
        pokemonIds: [1, 2],
        pokemonDetails: [
          { pokemonId: 1, name: 'Pikachu', sprite: '', type: ['Electric'] },
        ],
      }
      const realtime = createMockRealtimeGateway({
        assignPokemon: (ack) => ack(null, teamData),
      })
      const service = new LobbyService(
        realtime,
        sessionStore,
        createMockConnectionStore(),
      )

      const result = await service.assignTeam()

      expect(result.error).toBeUndefined()
      expect(result.teamDetails).toEqual(teamData.pokemonDetails)
      expect(sessionStore.getTeam()).toEqual(teamData)
    })

    it('updates session store with team and lobby when gateway returns wrapped payload', async () => {
      const sessionStore = createMockSessionStore()
      const teamData: AssignPokemonAckData = {
        id: 't1',
        lobbyId: 'l1',
        playerId: 'p1',
        pokemonIds: [1],
        pokemonDetails: [],
      }
      const lobby: Lobby = {
        id: 'l1',
        status: 'ready',
        playerIds: ['p1', 'p2'],
        readyPlayerIds: [],
        createdAt: new Date().toISOString(),
      }
      const realtime = createMockRealtimeGateway({
        assignPokemon: (ack) => ack(null, { team: teamData, lobby }),
      })
      const service = new LobbyService(
        realtime,
        sessionStore,
        createMockConnectionStore(),
      )

      const result = await service.assignTeam()

      expect(result.error).toBeUndefined()
      expect(sessionStore.getTeam()).toEqual(teamData)
      expect(sessionStore.getLobby()).toEqual(lobby)
    })

    it('resolves with empty result when gateway returns no team payload', async () => {
      const sessionStore = createMockSessionStore()
      const realtime = createMockRealtimeGateway({
        assignPokemon: (ack) => ack(null, undefined),
      })
      const service = new LobbyService(
        realtime,
        sessionStore,
        createMockConnectionStore(),
      )

      const result = await service.assignTeam()

      expect(result.error).toBeUndefined()
      expect(result.teamDetails).toBeUndefined()
    })

    it('resolves with empty result when gateway returns undefined data', async () => {
      const sessionStore = createMockSessionStore()
      const realtime = createMockRealtimeGateway({
        assignPokemon: (ack) => ack(null, undefined),
      })
      const service = new LobbyService(
        realtime,
        sessionStore,
        createMockConnectionStore(),
      )

      const result = await service.assignTeam()

      expect(result.error).toBeUndefined()
      expect(result.teamDetails).toBeUndefined()
    })

    it('returns mapped error when gateway reports error', async () => {
      const realtime = createMockRealtimeGateway({
        assignPokemon: (ack) =>
          ack({ code: 'NotConnected', message: 'Socket not connected' }, undefined),
      })
      const service = new LobbyService(
        realtime,
        createMockSessionStore(),
        createMockConnectionStore(),
      )

      const result = await service.assignTeam()

      expect(result.error).toContain('Not connected')
    })
  })

  describe('markReady', () => {
    it('updates session store when gateway returns lobby', async () => {
      const sessionStore = createMockSessionStore()
      const lobby: Lobby = {
        id: 'l1',
        status: 'ready',
        playerIds: ['p1', 'p2'],
        readyPlayerIds: ['p1'],
        createdAt: new Date().toISOString(),
      }
      const realtime = createMockRealtimeGateway({
        markReady: (ack) => ack(null, lobby),
      })
      const service = new LobbyService(
        realtime,
        sessionStore,
        createMockConnectionStore(),
      )

      const result = await service.markReady()

      expect(result.error).toBeUndefined()
      expect(sessionStore.getLobby()).toEqual(lobby)
    })

    it('updates session store when gateway returns wrapped { lobby }', async () => {
      const sessionStore = createMockSessionStore()
      const lobby: Lobby = {
        id: 'l1',
        status: 'ready',
        playerIds: ['p1', 'p2'],
        readyPlayerIds: ['p1', 'p2'],
        createdAt: new Date().toISOString(),
      }
      const realtime = createMockRealtimeGateway({
        markReady: (ack) => ack(null, { lobby }),
      })
      const service = new LobbyService(
        realtime,
        sessionStore,
        createMockConnectionStore(),
      )

      const result = await service.markReady()

      expect(result.error).toBeUndefined()
      expect(sessionStore.getLobby()).toEqual(lobby)
    })

    it('resolves with empty result when gateway returns no lobby', async () => {
      const sessionStore = createMockSessionStore()
      const realtime = createMockRealtimeGateway({
        markReady: (ack) => ack(null, undefined),
      })
      const service = new LobbyService(
        realtime,
        sessionStore,
        createMockConnectionStore(),
      )

      const result = await service.markReady()

      expect(result.error).toBeUndefined()
      expect(sessionStore.getLobby()).toBeNull()
    })

    it('returns mapped error when gateway reports error', async () => {
      const realtime = createMockRealtimeGateway({
        markReady: (ack) =>
          ack({ code: 'NotConnected', message: 'Socket not connected' }, undefined),
      })
      const service = new LobbyService(
        realtime,
        createMockSessionStore(),
        createMockConnectionStore(),
      )

      const result = await service.markReady()

      expect(result.error).toContain('Not connected')
    })
  })
})
