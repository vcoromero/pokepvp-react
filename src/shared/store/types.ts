import type { AppError, Battle, Lobby, Player, PokemonState, Team, TurnResultPayload } from '@/shared/types'

export type SocketStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export interface ConnectionSlice {
  backendBaseUrl: string | null
  socketStatus: SocketStatus
  lastError: AppError | null
  setBackendUrl: (url: string) => void
  clearBackendUrl: () => void
  setLastError: (error: AppError | null) => void
}

export interface SessionSlice {
  player: Player | null
  lobby: Lobby | null
  team: Team | null
  setPlayer: (player: Player | null) => void
  setLobby: (lobby: Lobby | null) => void
  setTeam: (team: Team | null) => void
  setLobbyStatus: (lobby: Lobby, player?: Player) => void
  resetSession: () => void
}

export interface BattleSlice {
  battle: Battle | null
  pokemonStates: PokemonState[]
  /** Initial HP per PokemonState id (from battle_start); used for HP bar max. */
  maxHpByPokemonStateId: Record<string, number>
  lastTurnResult: TurnResultPayload | null
  setBattle: (battle: Battle | null) => void
  setPokemonStates: (states: PokemonState[]) => void
  setLastTurnResult: (payload: TurnResultPayload | null) => void
  setBattleStart: (battle: Battle, pokemonStates: PokemonState[]) => void
  applyTurnResult: (payload: TurnResultPayload) => void
  setBattleEnd: (winnerId: string) => void
  resetBattle: () => void
}

/** Combined app store (all slices). */
export type AppStore = ConnectionSlice & SessionSlice & BattleSlice
