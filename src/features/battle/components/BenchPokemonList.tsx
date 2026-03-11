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
    <div className="rounded-lg bg-slate-800/80 p-2 border border-slate-600">
      <span className="text-xs text-slate-400 uppercase tracking-wide block mb-2">
        {title}
      </span>
      <div className="flex gap-2 flex-wrap">
        {pokemonList.map((p) => {
          const maxHp = maxHpByStateId[p.id] ?? p.currentHp
          return (
            <div
              key={p.id}
              className={`flex flex-col items-center rounded p-2 min-w-[70px] ${
                p.defeated ? 'opacity-50 bg-slate-700' : 'bg-slate-700/80'
              }`}
            >
              <img
                src={p.sprite}
                alt={p.name}
                className="w-10 h-10 object-contain"
              />
              <span className="text-xs text-white truncate max-w-full">
                {p.name}
              </span>
              <div className="w-full mt-1">
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
