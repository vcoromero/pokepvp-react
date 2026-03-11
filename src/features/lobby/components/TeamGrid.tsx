import type { AssignPokemonDetail } from '@/shared/types/catalog'
import type { Team } from '@/shared/types'
import { PokemonCard } from './PokemonCard'

interface TeamGridProps {
  teamDetails: AssignPokemonDetail[]
  team: Team | null
}

export function TeamGrid({ teamDetails, team }: TeamGridProps) {
  return (
    <div className="rounded-lg bg-slate-800 p-4 border border-slate-600">
      <h2 className="text-lg font-semibold mb-3">Your team</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {teamDetails.length > 0
          ? teamDetails.map((p) => <PokemonCard key={p.pokemonId} pokemon={p} />)
          : team?.pokemonIds.map((id) => (
              <div
                key={id}
                className="flex flex-col items-center rounded-lg bg-slate-700 p-3 min-w-[100px] justify-center"
              >
                <span className="text-slate-400">#{id}</span>
              </div>
            ))}
      </div>
    </div>
  )
}
