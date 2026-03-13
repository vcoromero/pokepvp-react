import type { AssignPokemonDetail } from '@/shared/types/catalog'
import type { Team } from '@/shared/types'
import { PokemonCard } from './PokemonCard'

interface TeamGridProps {
  teamDetails: AssignPokemonDetail[]
  team: Team | null
}

export function TeamGrid({ teamDetails, team }: TeamGridProps) {
  return (
    <div className="panel-card p-4">
      <h2 className="text-lg font-semibold mb-3">Your team</h2>
      <div className="flex flex-nowrap gap-3 justify-center overflow-x-auto pb-1">
        {teamDetails.length > 0
          ? teamDetails.map((p) => <PokemonCard key={p.pokemonId} pokemon={p} />)
          : team?.pokemonIds.map((id) => (
              <div
                key={id}
                className="flex flex-col items-center rounded-lg bg-slate-700 p-2 min-w-[80px] max-w-[100px] shrink-0 justify-center"
              >
                <span className="text-slate-400 text-xs">#{id}</span>
              </div>
            ))}
      </div>
    </div>
  )
}
