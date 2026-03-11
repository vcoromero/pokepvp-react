/** Team shape returned by backend (e.g. assign_pokemon ack). */
export interface Team {
  id: string
  lobbyId: string
  playerId: string
  pokemonIds: number[]
}
