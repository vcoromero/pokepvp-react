import type { AppError } from './error'
import type { Battle } from './battle'
import type { Lobby } from './lobby'
import type { Player } from './player'
import type { PokemonState } from './pokemon-state'
import type { Team } from './team'
import type { AssignPokemonDetail } from './catalog'

// ---------------------------------------------------------------------------
// Server-pushed event payloads
// ---------------------------------------------------------------------------

/** lobby_status payload. */
export interface LobbyStatusPayload {
  lobby: Lobby
  player?: Player
}

/** battle_start payload. */
export interface BattleStartPayload {
  battle: Battle
  pokemonStates: PokemonState[]
}

/** turn_result payload. */
export interface TurnResultPayload {
  battleId: string
  lobbyId: string
  attacker: {
    playerId: string
    pokemonId: number
  }
  defender: {
    playerId: string
    pokemonId: number
    damage: number
    previousHp: number
    currentHp: number
    defeated: boolean
  }
  nextActivePokemon: {
    playerId: string
    pokemonId: number | null
  }
  battleFinished: boolean
  nextToActPlayerId: string | undefined
}

/** battle_end payload. */
export interface BattleEndPayload {
  battleId: string
  lobbyId: string
  winnerId: string
}

/** error event payload. */
export interface ErrorPayload {
  code: string
  message: string
}

// ---------------------------------------------------------------------------
// Ack response types (what the server returns in emit callbacks)
// ---------------------------------------------------------------------------

/** Backend wraps errors inside an `error` key. */
export interface AckError {
  error: AppError
}

/** Discriminated ack: either typed success data or an AckError. */
export type AckResponse<T> = T | AckError

/** join_lobby ack success data. */
export interface JoinLobbyAckData {
  player: Player
  lobby: Lobby
}

/** assign_pokemon ack success data (Team fields + pokemonDetails). */
export interface AssignPokemonAckData extends Team {
  pokemonDetails: AssignPokemonDetail[]
}

/** Backend assign_pokemon ack sends { team, lobby } (see socketio-test-flow.md). */
export interface AssignPokemonAckWrapped {
  team: AssignPokemonAckData
  lobby: Lobby
}

/** Backend ready ack sends { lobby } (see socketio-test-flow.md). */
export interface ReadyAckWrapped {
  lobby: Lobby
}
