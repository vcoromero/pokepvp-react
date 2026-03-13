import type { AssignPokemonDetail } from '@/shared/types/catalog'
import { TypeBadges } from '@/shared/ui'

interface PokemonCardProps {
  pokemon: AssignPokemonDetail
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-slate-700 p-3 min-w-[100px]">
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        className="w-16 h-16 object-contain"
      />
      <span className="text-sm font-medium text-white mt-1">{pokemon.name}</span>
      {pokemon.type.length > 0 && (
        <TypeBadges types={pokemon.type} size="sm" className="mt-1 justify-center" />
      )}
    </div>
  )
}
