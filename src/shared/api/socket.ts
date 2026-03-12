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
  TurnResultPayload,
} from '@/shared/types'
import { useAppStore } from '@/shared/store'
import { normalizeBaseUrl } from '@/shared/utils/url'

let socket: Socket | null = null

function isAckError<T>(response: AckResponse<T>): response is AckError {
  return (
    response != null &&
    typeof response === 'object' &&
    'error' in response &&
    (response as AckError).error != null
  )
}

export function getSocket(): Socket | null {
  return socket
}

/**
 * Connect to backend via Socket.IO.
 * Registers listeners for server-pushed events and syncs them to the Zustand store.
 */
export function connect(baseUrl: string): void {
  const url = normalizeBaseUrl(baseUrl)

  if (socket?.connected) {
    socket.disconnect()
  }

  useAppStore.setState({ socketStatus: 'connecting' })

  socket = io(url, {
    path: '/socket.io',
    autoConnect: true,
  })

  socket.on('connect', () => {
    useAppStore.setState({ socketStatus: 'connected' })
    useAppStore.getState().setLastError(null)
    const { player, lobby } = useAppStore.getState()
    if (player && lobby) {
      rejoinLobbyInternal(player.id, lobby.id)
    }
  })

  socket.on('disconnect', (reason) => {
    useAppStore.setState({
      socketStatus: reason === 'io server disconnect' ? 'disconnected' : 'error',
    })
  })

  socket.on('connect_error', () => {
    useAppStore.setState({ socketStatus: 'error' })
  })

  socket.on('lobby_status', (payload: LobbyStatusPayload) => {
    // Only update our identity from lobby_status when we don't have one yet, or when
    // the payload's player is us (same id). Otherwise we'd overwrite our player with
    // the other client's when the backend broadcasts lobby_status to the whole room.
    const currentPlayer = useAppStore.getState().player
    const shouldUpdatePlayer =
      payload.player !== undefined &&
      (currentPlayer === null || currentPlayer.id === payload.player.id)
    useAppStore.getState().setLobbyStatus(
      payload.lobby,
      shouldUpdatePlayer ? payload.player : undefined,
    )
  })

  socket.on('battle_start', (payload: BattleStartPayload) => {
    useAppStore.getState().setBattleStart(payload.battle, payload.pokemonStates)
  })

  socket.on('turn_result', (payload: TurnResultPayload) => {
    useAppStore.getState().applyTurnResult(payload)
  })

  socket.on('battle_end', (payload: BattleEndPayload) => {
    useAppStore.getState().setBattleEnd(payload.winnerId)
  })

  socket.on('error', (payload: ErrorPayload) => {
    useAppStore.getState().setLastError({ code: payload.code, message: payload.message })
    useAppStore.setState({ socketStatus: 'error' })
  })
}

export function disconnect(): void {
  if (socket) {
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
  }
  useAppStore.setState({ socketStatus: 'disconnected' })
}

export function joinLobby(
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
}

/**
 * Reattach this connection to an existing player in a lobby (e.g. after reconnect).
 * Call this explicitly or rely on auto-rejoin on connect when store has player + lobby.
 */
function rejoinLobbyInternal(
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
      useAppStore.getState().setLastError(res.error)
      ack?.(res.error, undefined)
      return
    }
    useAppStore.getState().setLobbyStatus(res.lobby, res.player)
    useAppStore.getState().setLastError(null)
    ack?.(null, res)
  })
}

export function rejoinLobby(
  playerId: string,
  lobbyId: string,
  ack?: (err: AppError | null, data?: JoinLobbyAckData) => void,
): void {
  rejoinLobbyInternal(playerId, lobbyId, ack)
}

export function assignPokemon(
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
}

export function markReady(
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
}

export function attack(
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
}
