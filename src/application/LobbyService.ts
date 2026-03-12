import type { RealtimeGateway } from './ports/RealtimeGateway'
import type { SessionStore } from './ports/SessionStore'
import type { ConnectionStore } from './ports/ConnectionStore'
import { mapBackendError } from '@/shared/errors'
import type { AssignPokemonAckData, AssignPokemonAckWrapped, Lobby } from '@/shared/types'
import type { AssignPokemonDetail } from '@/shared/types/catalog'

export interface LobbyServiceJoinResult {
  error?: string
}

export interface LobbyServiceAssignTeamResult {
  error?: string
  teamDetails?: AssignPokemonDetail[]
}

export interface LobbyServiceMarkReadyResult {
  error?: string
}

export class LobbyService {
  private readonly realtime: RealtimeGateway
  private readonly sessionStore: SessionStore
  private readonly connectionStore: ConnectionStore

  constructor(
    realtime: RealtimeGateway,
    sessionStore: SessionStore,
    connectionStore: ConnectionStore,
  ) {
    this.realtime = realtime
    this.sessionStore = sessionStore
    this.connectionStore = connectionStore
  }

  async join(nickname: string): Promise<LobbyServiceJoinResult> {
    const baseUrl = this.connectionStore.getBackendBaseUrl()
    if (!baseUrl) {
      return { error: 'Backend URL not configured' }
    }
    const status = this.connectionStore.getSocketStatus()
    if (status !== 'connected' && status !== 'connecting') {
      this.realtime.connect(baseUrl)
    }

    return new Promise((resolve) => {
      this.realtime.joinLobby(nickname, (err, data) => {
        if (err) {
          resolve({ error: mapBackendError(err) })
          return
        }
        if (data) {
          this.sessionStore.setLobbyStatus(data.lobby, data.player)
        }
        resolve({})
      })
    })
  }

  async assignTeam(): Promise<LobbyServiceAssignTeamResult> {
    return new Promise((resolve) => {
      this.realtime.assignPokemon((err, data) => {
        if (err) {
          resolve({ error: mapBackendError(err) })
          return
        }
        if (data) {
          const wrapped = data as AssignPokemonAckData | AssignPokemonAckWrapped
          const teamPayload: AssignPokemonAckData | undefined =
            'team' in wrapped ? wrapped.team : wrapped
          const lobbyPayload = 'team' in wrapped ? wrapped.lobby : undefined
          if (teamPayload) {
            this.sessionStore.setTeam(teamPayload)
            resolve({ teamDetails: teamPayload.pokemonDetails ?? [] })
          } else {
            resolve({})
          }
          if (lobbyPayload) {
            this.sessionStore.setLobby(lobbyPayload)
          }
        } else {
          resolve({})
        }
      })
    })
  }

  async markReady(): Promise<LobbyServiceMarkReadyResult> {
    return new Promise((resolve) => {
      this.realtime.markReady((err, ackData) => {
        if (err) {
          resolve({ error: mapBackendError(err) })
          return
        }
        const lobby: Lobby | null | undefined =
          ackData && typeof ackData === 'object' && 'lobby' in ackData
            ? (ackData as { lobby: Lobby }).lobby
            : (ackData as Lobby | undefined) ?? null
        if (lobby) {
          this.sessionStore.setLobby(lobby)
        }
        resolve({})
      })
    })
  }
}
