import type { AssignPokemonDetail } from '@/shared/types/catalog'

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
        <span className="text-xs text-slate-400">
          {pokemon.type.join(' / ')}
        </span>
      )}
    </div>
  )
}
