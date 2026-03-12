import { io, type Socket } from 'socket.io-client'
import type {
  AckError,
  AckResponse,
  AppError,
  AssignPokemonAckData,
  BattleEndPayload,
  BattleStartPayload,
  ErrorPayload,
  JoinLobbyAckData,
  Lobby,
  LobbyStatusPayload,
  SurrenderAckPayload,
  TurnResultPayload,
} from '@/shared/types'
import { toConnectableBaseUrl } from '@/shared/utils/url'

export interface SocketEventHandlers {
  onConnect?: () => void
  onDisconnect?: (reason: string) => void
  onConnectError?: (error: Error) => void
  onLobbyStatus?: (payload: LobbyStatusPayload) => void
  onBattleStart?: (payload: BattleStartPayload) => void
  onTurnResult?: (payload: TurnResultPayload) => void
  onBattleEnd?: (payload: BattleEndPayload) => void
  onErrorEvent?: (payload: ErrorPayload) => void
}

export interface SocketClient {
  getSocket(): Socket | null
  connect(baseUrl: string, handlers: SocketEventHandlers): void
  disconnect(): void
  joinLobby(
    nickname: string,
    ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
  ): void
  rejoinLobby(
    playerId: string,
    lobbyId: string,
    ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
  ): void
  assignPokemon(
    ack?: (err: AppError | null, data?: AssignPokemonAckData) => void,
  ): void
  markReady(
    ack?: (err: AppError | null, lobby?: Lobby) => void,
  ): void
  attack(
    lobbyId: string,
    ack?: (err: AppError | null, result?: TurnResultPayload) => void,
  ): void
  surrender(
    lobbyId: string,
    ack?: (err: AppError | null, result?: SurrenderAckPayload) => void,
  ): void
}

function isAckError<T>(response: AckResponse<T>): response is AckError {
  return (
    response != null &&
    typeof response === 'object' &&
    'error' in response &&
    (response as AckError).error != null
  )
}

let socket: Socket | null = null
let currentHandlers: SocketEventHandlers | null = null

function registerCoreHandlers(handlers: SocketEventHandlers): void {
  if (!socket) return

  currentHandlers = handlers

  socket.on('connect', () => {
    currentHandlers?.onConnect?.()
  })

  socket.on('disconnect', (reason) => {
    currentHandlers?.onDisconnect?.(reason)
  })

  socket.on('connect_error', (error) => {
    currentHandlers?.onConnectError?.(error)
  })

  socket.on('lobby_status', (payload: LobbyStatusPayload) => {
    currentHandlers?.onLobbyStatus?.(payload)
  })

  socket.on('battle_start', (payload: BattleStartPayload) => {
    currentHandlers?.onBattleStart?.(payload)
  })

  socket.on('turn_result', (payload: TurnResultPayload) => {
    currentHandlers?.onTurnResult?.(payload)
  })

  socket.on('battle_end', (payload: BattleEndPayload) => {
    currentHandlers?.onBattleEnd?.(payload)
  })

  socket.on('error', (payload: ErrorPayload) => {
    currentHandlers?.onErrorEvent?.(payload)
  })
}

export const socketClient: SocketClient = {
  getSocket(): Socket | null {
    return socket
  },

  connect(baseUrl: string, handlers: SocketEventHandlers): void {
    const url = toConnectableBaseUrl(baseUrl)

    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
    }

    socket = io(url, {
      path: '/socket.io',
      autoConnect: true,
    })

    registerCoreHandlers(handlers)
  },

  disconnect(): void {
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      socket = null
      currentHandlers = null
    }
  },

  joinLobby(
    nickname: string,
    ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
  ): void {
    if (!socket?.connected) {
      ack?.({ code: 'NotConnected', message: 'Socket not connected' }, undefined)
      return
    }
    socket.emit('join_lobby', { nickname }, (res: AckResponse<JoinLobbyAckData>) => {
      if (isAckError(res)) {
        ack?.(res.error, undefined)
        return
      }
      ack?.(null, res)
    })
  },

  rejoinLobby(
    playerId: string,
    lobbyId: string,
    ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
  ): void {
    if (!socket?.connected) {
      ack?.({ code: 'NotConnected', message: 'Socket not connected' }, undefined)
      return
    }
    socket.emit('rejoin_lobby', { playerId, lobbyId }, (res: AckResponse<JoinLobbyAckData>) => {
      if (isAckError(res)) {
        ack?.(res.error, undefined)
        return
      }
      ack?.(null, res)
    })
  },

  assignPokemon(
    ack?: (err: AppError | null, data?: AssignPokemonAckData) => void,
  ): void {
    if (!socket?.connected) {
      ack?.({ code: 'NotConnected', message: 'Socket not connected' }, undefined)
      return
    }
    socket.emit('assign_pokemon', {}, (res: AckResponse<AssignPokemonAckData>) => {
      if (isAckError(res)) {
        ack?.(res.error, undefined)
        return
      }
      ack?.(null, res)
    })
  },

  markReady(
    ack?: (err: AppError | null, lobby?: Lobby) => void,
  ): void {
    if (!socket?.connected) {
      ack?.({ code: 'NotConnected', message: 'Socket not connected' }, undefined)
      return
    }
    socket.emit('ready', {}, (res: AckResponse<Lobby>) => {
      if (isAckError(res)) {
        ack?.(res.error, undefined)
        return
      }
      ack?.(null, res)
    })
  },

  attack(
    lobbyId: string,
    ack?: (err: AppError | null, result?: TurnResultPayload) => void,
  ): void {
    if (!socket?.connected) {
      ack?.({ code: 'NotConnected', message: 'Socket not connected' }, undefined)
      return
    }
    socket.emit('attack', { lobbyId }, (res: AckResponse<TurnResultPayload>) => {
      if (isAckError(res)) {
        ack?.(res.error, undefined)
        return
      }
      ack?.(null, res)
    })
  },

  surrender(
    lobbyId: string,
    ack?: (err: AppError | null, result?: SurrenderAckPayload) => void,
  ): void {
    if (!socket?.connected) {
      ack?.({ code: 'NotConnected', message: 'Socket not connected' }, undefined)
      return
    }
    socket.emit('surrender', { lobbyId }, (res: AckResponse<SurrenderAckPayload>) => {
      if (isAckError(res)) {
        ack?.(res.error, undefined)
        return
      }
      ack?.(null, res)
    })
  },
}

