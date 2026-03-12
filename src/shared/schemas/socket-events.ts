import { z } from 'zod'

/**
 * Runtime validation schemas for socket event payloads.
 * Used at the boundary (e.g. SocketIoRealtimeGateway) to reject malformed data
 * before updating application state.
 */

const lobbyStatusEnum = z.enum(['waiting', 'ready', 'battling', 'finished'])

export const LobbySchema = z.object({
  id: z.string(),
  status: lobbyStatusEnum,
  playerIds: z.array(z.string()),
  readyPlayerIds: z.array(z.string()),
  createdAt: z.string(),
})

export const PlayerSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  lobbyId: z.string().optional(),
})

export const LobbyStatusPayloadSchema = z.object({
  lobby: LobbySchema,
  player: PlayerSchema.optional(),
})

export const BattleSchema = z.object({
  id: z.string(),
  lobbyId: z.string(),
  startedAt: z.string(),
  winnerId: z.string().optional(),
  nextToActPlayerId: z.string().nullable().optional(),
})

export const PokemonStateSchema = z.object({
  id: z.string(),
  battleId: z.string(),
  pokemonId: z.number(),
  playerId: z.string(),
  currentHp: z.number(),
  defeated: z.boolean(),
  name: z.string(),
  sprite: z.string(),
  type: z.array(z.string()),
})

export const BattleStartPayloadSchema = z.object({
  battle: BattleSchema,
  pokemonStates: z.array(PokemonStateSchema),
})

export const TurnResultPayloadSchema = z.object({
  battleId: z.string(),
  lobbyId: z.string(),
  attacker: z.object({
    playerId: z.string(),
    pokemonId: z.number(),
  }),
  defender: z.object({
    playerId: z.string(),
    pokemonId: z.number(),
    damage: z.number(),
    previousHp: z.number(),
    currentHp: z.number(),
    defeated: z.boolean(),
  }),
  nextActivePokemon: z.object({
    playerId: z.string(),
    pokemonId: z.number().nullable(),
  }),
  battleFinished: z.boolean(),
  nextToActPlayerId: z.string().optional(),
})

export const BattleEndPayloadSchema = z.object({
  battleId: z.string(),
  lobbyId: z.string(),
  winnerId: z.string(),
  loserId: z.string().optional(),
  reason: z.literal('surrender').optional(),
})

export const ErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
})

export type LobbyStatusPayloadValidated = z.infer<typeof LobbyStatusPayloadSchema>
export type BattleStartPayloadValidated = z.infer<typeof BattleStartPayloadSchema>
export type TurnResultPayloadValidated = z.infer<typeof TurnResultPayloadSchema>
export type BattleEndPayloadValidated = z.infer<typeof BattleEndPayloadSchema>
export type ErrorPayloadValidated = z.infer<typeof ErrorPayloadSchema>
