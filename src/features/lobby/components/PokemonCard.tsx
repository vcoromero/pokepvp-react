import type { AssignPokemonDetail } from '@/shared/types/catalog'
import { TypeBadges } from '@/shared/ui'

interface PokemonCardProps {
  pokemon: AssignPokemonDetail
}

export function PokemonCard({ pokemon }: PokemonCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-slate-700 p-2 w-full min-w-0 max-w-[110px] shrink-0">
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        className="pixel-art w-20 h-20 object-contain"
      />
      <span className="text-[0.65rem] font-medium text-white mt-0.5 truncate w-full text-center">{pokemon.name}</span>
      {pokemon.type.length > 0 && (
        <TypeBadges types={pokemon.type} size="xs" className="mt-0.5 justify-center" />
      )}
    </div>
  )
}
