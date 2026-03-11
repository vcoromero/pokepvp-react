/** Pokémon detail from catalog API (GET /list/:id). */
export interface CatalogPokemonDetail {
  id: number
  name: string
  type: string[]
  hp: number
  attack: number
  defense: number
  speed: number
  sprite: string
}

/** Catalog API response wrapper. */
export interface CatalogApiResponse {
  success: boolean
  data: CatalogPokemonDetail
}

/** Item in assign_pokemon ack pokemonDetails (backend returns pokemonId, not id). */
export interface AssignPokemonDetail {
  pokemonId: number
  name: string
  sprite: string
  type: string[]
}
