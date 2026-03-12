import type { Lobby, Player, Team } from '@/shared/types'

export interface SessionStore {
  getPlayer(): Player | null
  setPlayer(player: Player | null): void

  getLobby(): Lobby | null
  setLobby(lobby: Lobby | null): void

  getTeam(): Team | null
  setTeam(team: Team | null): void

  setLobbyStatus(lobby: Lobby, player?: Player): void

  resetSession(): void
}

