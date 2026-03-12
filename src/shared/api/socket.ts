import type { AppError, AssignPokemonAckData, JoinLobbyAckData, Lobby, SurrenderAckPayload, TurnResultPayload } from '@/shared/types'
import { SocketIoRealtimeGateway } from '@/infrastructure/realtime/SocketIoRealtimeGateway'
import { ZustandConnectionStore } from '@/infrastructure/store/ZustandConnectionStore'
import { ZustandSessionStore } from '@/infrastructure/store/ZustandSessionStore'
import { ZustandBattleRepository } from '@/infrastructure/store/ZustandBattleRepository'

const realtimeGateway = new SocketIoRealtimeGateway(
  new ZustandConnectionStore(),
  new ZustandSessionStore(),
  new ZustandBattleRepository(),
)

/**
 * Connect to backend via Socket.IO using the hexagonal realtime gateway.
 */
export function connect(baseUrl: string): void {
  realtimeGateway.connect(baseUrl)
}

export function disconnect(): void {
  realtimeGateway.disconnect()
}

export function joinLobby(
  nickname: string,
  ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
): void {
  realtimeGateway.joinLobby(nickname, ack)
}

export function rejoinLobby(
  playerId: string,
  lobbyId: string,
  ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
): void {
  realtimeGateway.rejoinLobby(playerId, lobbyId, ack)
}

export function assignPokemon(
  ack?: (err: AppError | null, data?: AssignPokemonAckData) => void,
): void {
  realtimeGateway.assignPokemon(ack)
}

export function markReady(
  ack?: (err: AppError | null, lobby?: Lobby) => void,
): void {
  realtimeGateway.markReady(ack)
}

export function attack(
  lobbyId: string,
  ack?: (err: AppError | null, result?: TurnResultPayload) => void,
): void {
  realtimeGateway.attack(lobbyId, ack)
}

export function surrender(
  lobbyId: string,
  ack?: (err: AppError | null, result?: SurrenderAckPayload) => void,
): void {
  realtimeGateway.surrender(lobbyId, ack)
}
