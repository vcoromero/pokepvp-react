import type {
  AppError,
  BattleEndPayload,
  BattleStartPayload,
  JoinLobbyAckData,
  LobbyStatusPayload,
  SurrenderAckPayload,
  TurnResultPayload,
} from '@/shared/types'

export interface RealtimeGateway {
  connect(baseUrl: string): void
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
    ack?: (err: AppError | null, data?: unknown) => void,
  ): void

  markReady(
    ack?: (err: AppError | null, lobby?: unknown) => void,
  ): void

  attack(
    lobbyId: string,
    ack?: (err: AppError | null, result?: TurnResultPayload) => void,
  ): void

  surrender(
    lobbyId: string,
    ack?: (err: AppError | null, result?: SurrenderAckPayload) => void,
  ): void

  subscribeLobbyStatus(
    handler: (payload: LobbyStatusPayload) => void,
  ): () => void

  subscribeBattleEvents(handlers: {
    onBattleStart?: (payload: BattleStartPayload) => void
    onTurnResult?: (payload: TurnResultPayload) => void
    onBattleEnd?: (payload: BattleEndPayload) => void
    onError?: (error: AppError) => void
  }): () => void
}

