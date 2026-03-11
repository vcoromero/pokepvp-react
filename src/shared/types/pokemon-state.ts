/** PokemonState shape (battle_start / turn_result). */
export interface PokemonState {
  id: string
  battleId: string
  pokemonId: number
  playerId: string
  currentHp: number
  defeated: boolean
  name: string
  sprite: string
  type: string[]
}
