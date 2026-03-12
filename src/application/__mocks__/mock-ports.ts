import type { ConnectionStore } from '../ports/ConnectionStore'
import type { SessionStore } from '../ports/SessionStore'
import type { RealtimeGateway } from '../ports/RealtimeGateway'
import type {
  AppError,
  AssignPokemonAckData,
  JoinLobbyAckData,
  Lobby,
  Player,
} from '@/shared/types'
import type { SocketStatus } from '@/shared/store'

export function createMockConnectionStore(initial?: {
  backendBaseUrl?: string | null
  socketStatus?: SocketStatus
}): ConnectionStore {
  let backendBaseUrl: string | null = initial?.backendBaseUrl ?? null
  let socketStatus: SocketStatus = initial?.socketStatus ?? 'disconnected'
  let lastError: AppError | null = null

  return {
    getBackendBaseUrl: () => backendBaseUrl,
    setBackendBaseUrl: (url) => {
      backendBaseUrl = url
    },
    clearBackendBaseUrl: () => {
      backendBaseUrl = null
      socketStatus = 'disconnected'
      lastError = null
    },
    getSocketStatus: () => socketStatus,
    setSocketStatus: (s) => {
      socketStatus = s
    },
    getLastError: () => lastError,
    setLastError: (e) => {
      lastError = e
    },
  }
}

export function createMockSessionStore(): SessionStore {
  let player: Player | null = null
  let lobby: Lobby | null = null
  let team: ReturnType<SessionStore['getTeam']> = null

  return {
    getPlayer: () => player,
    setPlayer: (p) => {
      player = p
    },
    getLobby: () => lobby,
    setLobby: (l) => {
      lobby = l
    },
    getTeam: () => team,
    setTeam: (t) => {
      team = t
    },
    setLobbyStatus: (l, p?) => {
      lobby = l
      if (p !== undefined) player = p
    },
    resetSession: () => {
      player = null
      lobby = null
      team = null
    },
  }
}

export function createMockRealtimeGateway(behaviors: {
  joinLobby?: (nickname: string, ack: (err: AppError | null, data?: JoinLobbyAckData) => void) => void
  assignPokemon?: (ack: (err: AppError | null, data?: AssignPokemonAckData | { team: AssignPokemonAckData; lobby: Lobby }) => void) => void
  markReady?: (ack: (err: AppError | null, data?: Lobby | { lobby: Lobby }) => void) => void
}): RealtimeGateway {
  const noop = () => {}
  return {
    connect: noop,
    disconnect: noop,
    getConnectionState: () => 'disconnected' as const,
    joinLobby: (nickname, ack) => {
      if (behaviors.joinLobby) {
        behaviors.joinLobby(nickname, ack ?? (() => {}))
      } else {
        ack?.(null, undefined)
      }
    },
    rejoinLobby: (_, __, ack) => ack?.(null, undefined),
    assignPokemon: (ack) => {
      if (behaviors.assignPokemon) {
        behaviors.assignPokemon(ack ?? (() => {}))
      } else {
        ack?.(null, undefined)
      }
    },
    markReady: (ack) => {
      if (behaviors.markReady) {
        behaviors.markReady(ack ?? (() => {}))
      } else {
        ack?.(null, undefined)
      }
    },
    attack: (_, ack) => ack?.(null, undefined),
    surrender: (_, ack) => ack?.(null, undefined),
    subscribeLobbyStatus: () => noop,
    subscribeBattleEvents: () => noop,
  }
}
