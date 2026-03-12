import type { RealtimeGateway, RealtimeConnectionState } from '@/application/ports/RealtimeGateway'
import type {
  AppError,
  AssignPokemonAckData,
  BattleEndPayload,
  BattleStartPayload,
  JoinLobbyAckData,
  Lobby,
  LobbyStatusPayload,
  SurrenderAckPayload,
  TurnResultPayload,
} from '@/shared/types'
import { socketClient, type SocketEventHandlers } from '@/shared/api/socket-client'
import type { ConnectionStore } from '@/application/ports/ConnectionStore'
import type { SessionStore } from '@/application/ports/SessionStore'
import type { BattleRepository } from '@/application/ports/BattleRepository'
import {
  BattleEndPayloadSchema,
  BattleStartPayloadSchema,
  ErrorPayloadSchema,
  LobbyStatusPayloadSchema,
  TurnResultPayloadSchema,
} from '@/shared/schemas/socket-events'

const PAYLOAD_VALIDATION_ERROR: AppError = {
  code: 'InvalidPayload',
  message: 'Invalid data from server. Please refresh or try again.',
}

function handleValidationFailure(
  connectionStore: ConnectionStore,
  eventName: string,
  error: unknown,
): void {
  if (typeof console !== 'undefined' && console.error) {
    console.error(`[Socket] Invalid payload for "${eventName}":`, error)
  }
  connectionStore.setLastError(PAYLOAD_VALIDATION_ERROR)
  connectionStore.setSocketStatus('error')
}

export class SocketIoRealtimeGateway implements RealtimeGateway {
  private readonly connectionStore: ConnectionStore
  private readonly sessionStore: SessionStore
  private readonly battleRepository: BattleRepository

  constructor(
    connectionStore: ConnectionStore,
    sessionStore: SessionStore,
    battleRepository: BattleRepository,
  ) {
    this.connectionStore = connectionStore
    this.sessionStore = sessionStore
    this.battleRepository = battleRepository
  }

  connect(baseUrl: string): void {
    const handlers: SocketEventHandlers = {
      onConnect: () => {
        this.connectionStore.setSocketStatus('connected')
        const player = this.sessionStore.getPlayer()
        const lobby = this.sessionStore.getLobby()

        this.connectionStore.setLastError(null)

        if (player && lobby) {
          this.rejoinLobby(player.id, lobby.id, (err) => {
            if (!err) return

            if (
              err.code === 'ConflictError' &&
              err.message === 'Cannot rejoin: lobby is finished'
            ) {
              this.battleRepository.resetBattle()
              this.sessionStore.resetSession()
              this.connectionStore.setLastError({
                code: err.code,
                message:
                  'This battle finished while you were away. Consider it resolved and start a new match from the lobby.',
              })
            } else {
              this.connectionStore.setLastError(err)
            }
          })
        }
      },

      onDisconnect: (reason) => {
        this.connectionStore.setSocketStatus(
          reason === 'io server disconnect' ? 'disconnected' : 'error',
        )
      },

      onConnectError: () => {
        this.connectionStore.setSocketStatus('error')
      },

      onLobbyStatus: (payload: LobbyStatusPayload) => {
        const result = LobbyStatusPayloadSchema.safeParse(payload)
        if (!result.success) {
          handleValidationFailure(this.connectionStore, 'lobby_status', result.error)
          return
        }
        const data = result.data as LobbyStatusPayload
        const currentPlayer = this.sessionStore.getPlayer()
        const shouldUpdatePlayer =
          data.player !== undefined &&
          (currentPlayer === null || currentPlayer.id === data.player.id)
        this.sessionStore.setLobbyStatus(
          data.lobby,
          shouldUpdatePlayer ? data.player : undefined,
        )
      },

      onBattleStart: (payload: BattleStartPayload) => {
        const result = BattleStartPayloadSchema.safeParse(payload)
        if (!result.success) {
          handleValidationFailure(this.connectionStore, 'battle_start', result.error)
          return
        }
        const data = result.data as BattleStartPayload
        this.battleRepository.setBattleStart(data.battle, data.pokemonStates)
      },

      onTurnResult: (payload: TurnResultPayload) => {
        const result = TurnResultPayloadSchema.safeParse(payload)
        if (!result.success) {
          handleValidationFailure(this.connectionStore, 'turn_result', result.error)
          return
        }
        this.battleRepository.applyTurnResult(result.data as TurnResultPayload)
      },

      onBattleEnd: (payload: BattleEndPayload) => {
        const result = BattleEndPayloadSchema.safeParse(payload)
        if (!result.success) {
          handleValidationFailure(this.connectionStore, 'battle_end', result.error)
          return
        }
        const data = result.data as BattleEndPayload
        this.battleRepository.setBattleEnd(data.winnerId)
      },

      onErrorEvent: (payload: { code: string; message: string }) => {
        const result = ErrorPayloadSchema.safeParse(payload)
        if (!result.success) {
          handleValidationFailure(this.connectionStore, 'error', result.error)
          return
        }
        this.connectionStore.setLastError({
          code: result.data.code,
          message: result.data.message,
        })
        this.connectionStore.setSocketStatus('error')
      },
    }

    this.connectionStore.setSocketStatus('connecting')
    socketClient.connect(baseUrl, handlers)
  }

  disconnect(): void {
    socketClient.disconnect()
    this.connectionStore.setSocketStatus('disconnected')
  }

  getConnectionState(): RealtimeConnectionState {
    return socketClient.getSocket()?.connected ? 'connected' : 'disconnected'
  }

  joinLobby(
    nickname: string,
    ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
  ): void {
    socketClient.joinLobby(nickname, ack)
  }

  rejoinLobby(
    playerId: string,
    lobbyId: string,
    ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
  ): void {
    socketClient.rejoinLobby(playerId, lobbyId, (err, data) => {
      if (err) {
        this.connectionStore.setLastError(err)
        ack?.(err, undefined)
        return
      }
      if (data) {
        this.sessionStore.setLobbyStatus(data.lobby, data.player)
        this.connectionStore.setLastError(null)
      }
      ack?.(null, data)
    })
  }

  assignPokemon(
    ack?: (err: AppError | null, data?: AssignPokemonAckData) => void,
  ): void {
    socketClient.assignPokemon(ack)
  }

  markReady(
    ack?: (err: AppError | null, lobby?: Lobby) => void,
  ): void {
    socketClient.markReady(ack)
  }

  attack(
    lobbyId: string,
    ack?: (err: AppError | null, result?: TurnResultPayload) => void,
  ): void {
    socketClient.attack(lobbyId, ack)
  }

  surrender(
    lobbyId: string,
    ack?: (err: AppError | null, result?: SurrenderAckPayload) => void,
  ): void {
    socketClient.surrender(lobbyId, ack)
  }

  subscribeLobbyStatus(
    handler: (payload: LobbyStatusPayload) => void,
  ): () => void {
    const wrappedHandlers: SocketEventHandlers = {
      onLobbyStatus: handler,
    }
    socketClient.connect(this.connectionStore.getBackendBaseUrl() ?? '', wrappedHandlers)
    return () => {
      socketClient.disconnect()
    }
  }

  subscribeBattleEvents(handlers: {
    onBattleStart?: (payload: BattleStartPayload) => void
    onTurnResult?: (payload: TurnResultPayload) => void
    onBattleEnd?: (payload: BattleEndPayload) => void
    onError?: (error: AppError) => void
  }): () => void {
    const wrappedHandlers: SocketEventHandlers = {
      onBattleStart: handlers.onBattleStart,
      onTurnResult: handlers.onTurnResult,
      onBattleEnd: handlers.onBattleEnd,
      onErrorEvent: (payload) => {
        const error: AppError = { code: payload.code, message: payload.message }
        handlers.onError?.(error)
      },
    }

    socketClient.connect(this.connectionStore.getBackendBaseUrl() ?? '', wrappedHandlers)

    return () => {
      socketClient.disconnect()
    }
  }
}

