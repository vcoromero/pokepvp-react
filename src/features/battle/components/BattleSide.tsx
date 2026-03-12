import type { PokemonState } from '@/shared/types'
import { ActivePokemonCard } from './ActivePokemonCard'
import { BenchPokemonList } from './BenchPokemonList'

interface BattleSideProps {
  active: PokemonState | undefined
  bench: PokemonState[]
  maxHpByStateId: Record<string, number>
  label: string
  damageText?: string | null
  /** When true, the active card is shown in a "fainted" state (during faint debounce). */
  isActiveFainted?: boolean
}

export function BattleSide({
  active,
  bench,
  maxHpByStateId,
  label,
  damageText,
  isActiveFainted = false,
}: BattleSideProps) {
  return (
    <div className="flex flex-col gap-2 items-stretch sm:flex-row sm:gap-3">
      {/* On mobile: bench on top, active below. From sm: bench left, active right */}
      {bench.length > 0 && (
        <BenchPokemonList
          pokemonList={bench}
          maxHpByStateId={maxHpByStateId}
        />
      )}
      <div className="flex-1 min-w-0 flex flex-col self-stretch min-h-0">
        {active ? (
          <ActivePokemonCard
            pokemon={active}
            maxHp={maxHpByStateId[active.id] ?? active.currentHp}
            label={label}
            damageText={damageText}
            isFainted={isActiveFainted}
          />
        ) : (
          <div className="rounded-lg bg-slate-800 p-4 border border-slate-600 min-w-0 min-h-[180px] md:min-w-[340px] md:min-h-[220px] flex items-center justify-center h-full">
            <span className="text-slate-500 text-sm">No active Pokémon</span>
          </div>
        )}
      </div>
    </div>
  )
}
