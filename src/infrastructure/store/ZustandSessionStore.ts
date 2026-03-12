import { useAppStore } from '@/shared/store'
import type { SessionStore } from '@/application/ports/SessionStore'
import type { Lobby, Player, Team } from '@/shared/types'

export class ZustandSessionStore implements SessionStore {
  getPlayer(): Player | null {
    return useAppStore.getState().player
  }

  setPlayer(player: Player | null): void {
    useAppStore.getState().setPlayer(player)
  }

  getLobby(): Lobby | null {
    return useAppStore.getState().lobby
  }

  setLobby(lobby: Lobby | null): void {
    useAppStore.getState().setLobby(lobby)
  }

  getTeam(): Team | null {
    return useAppStore.getState().team
  }

  setTeam(team: Team | null): void {
    useAppStore.getState().setTeam(team)
  }

  setLobbyStatus(lobby: Lobby, player?: Player): void {
    useAppStore.getState().setLobbyStatus(lobby, player)
  }

  resetSession(): void {
    useAppStore.getState().resetSession()
  }
}

