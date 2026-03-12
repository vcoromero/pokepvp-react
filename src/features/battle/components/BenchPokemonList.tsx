import type { PokemonState } from '@/shared/types'

interface BenchPokemonListProps {
  pokemonList: PokemonState[]
  maxHpByStateId: Record<string, number>
  title?: string
}

export function BenchPokemonList({
  pokemonList,
  maxHpByStateId,
  title = 'Bench',
}: BenchPokemonListProps) {
  return (
    <div className="rounded-lg bg-slate-800/80 p-1.5 border border-slate-600 shrink-0">
      <span className="text-xs text-slate-400 uppercase tracking-wide block mb-1.5">
        {title}
      </span>
      <div className="flex flex-row flex-wrap gap-1.5 sm:flex-col sm:gap-1.5">
        {pokemonList.map((p) => {
          const maxHp = maxHpByStateId[p.id] ?? p.currentHp
          return (
            <div
              key={p.id}
              className={`flex flex-col items-center rounded p-1.5 min-w-[70px] ${
                p.defeated ? 'opacity-50 bg-slate-700' : 'bg-slate-700/80'
              }`}
            >
              <img
                src={p.sprite}
                alt={p.name}
                className="w-9 h-9 object-contain"
              />
              <span className="text-xs text-white truncate max-w-full leading-tight">
                {p.name}
              </span>
              <div className="w-full mt-0.5">
                <div className="h-1 w-full rounded-full bg-slate-600 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${maxHp > 0 ? (p.currentHp / maxHp) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              {p.defeated && (
                <span className="text-xs text-red-400">Fainted</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
