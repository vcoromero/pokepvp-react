import type { PokemonState } from '@/shared/types'
import { ActivePokemonCard } from './ActivePokemonCard'
import { BenchPokemonList } from './BenchPokemonList'

interface BattleSideProps {
  active: PokemonState | undefined
  bench: PokemonState[]
  maxHpByStateId: Record<string, number>
  label: string
  damageText?: string | null
}

export function BattleSide({
  active,
  bench,
  maxHpByStateId,
  label,
  damageText,
}: BattleSideProps) {
  return (
    <div className="flex flex-col gap-3">
      {active ? (
        <ActivePokemonCard
          pokemon={active}
          maxHp={maxHpByStateId[active.id] ?? active.currentHp}
          label={label}
          damageText={damageText}
        />
      ) : (
        <div className="rounded-lg bg-slate-800 p-4 border border-slate-600 min-w-[140px] min-h-[120px] flex items-center justify-center">
          <span className="text-slate-500 text-sm">No active Pokémon</span>
        </div>
      )}
      {bench.length > 0 && (
        <BenchPokemonList
          pokemonList={bench}
          maxHpByStateId={maxHpByStateId}
        />
      )}
    </div>
  )
}
