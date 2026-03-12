import type { Lobby } from '@/shared/types'

export function isPlayerReady(lobby: Lobby | null, playerId: string | null): boolean {
  if (!lobby || !playerId) return false
  return lobby.readyPlayerIds.includes(playerId)
}

export function areBothReady(lobby: Lobby | null): boolean {
  if (!lobby) return false
  return lobby.readyPlayerIds.length >= 2
}

export function getPlayerCount(lobby: Lobby | null): number {
  return lobby?.playerIds.length ?? 0
}

export function getReadyCount(lobby: Lobby | null): number {
  return lobby?.readyPlayerIds.length ?? 0
}
