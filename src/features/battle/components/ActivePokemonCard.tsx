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
      className={`relative flex flex-row items-center gap-5 rounded-lg bg-slate-800 p-4 border min-w-[340px] w-full min-h-[220px] h-full transition-all duration-300 ${
        isFainted ? 'border-red-900/80 opacity-75' : 'border-slate-600'
      } ${className ?? ''}`}
    >
      {isFainted && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-900/80 z-10">
          <span className="text-red-400 font-bold text-lg uppercase tracking-wide">Fainted</span>
        </div>
      )}
      <div className="flex flex-col items-center shrink-0">
        {label && (
          <span className="text-xs text-slate-400 uppercase tracking-wide mb-1">
            {label}
          </span>
        )}
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className={`w-28 h-28 object-contain ${isFainted ? 'grayscale' : ''}`}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-base font-medium text-white">{pokemon.name}</span>
        {pokemon.type.length > 0 && (
          <span className="text-sm text-slate-400">{pokemon.type.join(' / ')}</span>
        )}
        <div className="w-full mt-2">
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
