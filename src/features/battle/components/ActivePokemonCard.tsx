import type { PokemonState } from '@/shared/types'
import { HpBar } from '@/shared/ui'

interface ActivePokemonCardProps {
  pokemon: PokemonState
  maxHp: number
  label?: string
  damageText?: string | null
  /** When true, shows a "Fainted" overlay and dimmed style (debounce before switching to next). */
  isFainted?: boolean
  className?: string
}

export function ActivePokemonCard({
  pokemon,
  maxHp,
  label,
  damageText,
  isFainted = false,
  className,
}: ActivePokemonCardProps) {
  return (
    <div
      className={`relative flex flex-row items-center gap-3 rounded-lg bg-slate-800 p-3 border min-w-0 w-full min-h-[180px] h-full transition-all duration-300 md:gap-5 md:p-4 md:min-w-[340px] md:min-h-[220px] ${
        isFainted ? 'border-red-900/80 opacity-75' : 'border-slate-600'
      } ${className ?? ''}`}
    >
      {isFainted && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-900/80 z-10">
          <span className="text-red-400 font-bold text-base uppercase tracking-wide sm:text-lg">Fainted</span>
        </div>
      )}
      <div className="flex flex-col items-center shrink-0">
        {label && (
          <span className="text-xs text-slate-400 uppercase tracking-wide mb-0.5 md:mb-1">
            {label}
          </span>
        )}
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className={`w-16 h-16 object-contain md:w-28 md:h-28 ${isFainted ? 'grayscale' : ''}`}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium text-white truncate md:text-base">{pokemon.name}</span>
        {pokemon.type.length > 0 && (
          <span className="text-xs text-slate-400 truncate md:text-sm">{pokemon.type.join(' / ')}</span>
        )}
        <div className="w-full mt-1.5 md:mt-2">
          <HpBar currentHp={pokemon.currentHp} maxHp={maxHp} />
          <div className="flex justify-between text-xs text-slate-400 mt-0.5">
            <span>{pokemon.currentHp} / {maxHp}</span>
            {damageText && (
              <span className="text-red-400 font-medium">{damageText}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
