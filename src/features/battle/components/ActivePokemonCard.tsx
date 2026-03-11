import type { PokemonState } from '@/shared/types'
import { HpBar } from '@/shared/ui'

interface ActivePokemonCardProps {
  pokemon: PokemonState
  maxHp: number
  label?: string
  damageText?: string | null
}

export function ActivePokemonCard({
  pokemon,
  maxHp,
  label,
  damageText,
}: ActivePokemonCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-slate-800 p-4 border border-slate-600 min-w-[140px]">
      {label && (
        <span className="text-xs text-slate-400 uppercase tracking-wide mb-1">
          {label}
        </span>
      )}
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        className="w-20 h-20 object-contain"
      />
      <span className="text-sm font-medium text-white mt-1">{pokemon.name}</span>
      {pokemon.type.length > 0 && (
        <span className="text-xs text-slate-400">{pokemon.type.join(' / ')}</span>
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
  )
}
