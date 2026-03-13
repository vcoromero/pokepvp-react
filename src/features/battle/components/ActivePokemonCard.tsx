import { motion } from 'framer-motion'
import type { PokemonState } from '@/shared/types'
import { HpBar, TypeBadges } from '@/shared/ui'

const cardTransition = { duration: 0.25, ease: 'easeOut' as const }

/** Keyframes for hit shake: slight horizontal shake when defender receives damage. */
const hitShakeKeyframes = [0, -8, 8, -8, 8, 0]

interface ActivePokemonCardProps {
  pokemon: PokemonState
  maxHp: number
  label?: string
  damageText?: string | null
  /** When true, shows a "Fainted" overlay and dimmed style (debounce before switching to next). */
  isFainted?: boolean
  /** When set, runs a one-shot shake animation (e.g. when this Pokémon received damage). Change key to re-run. */
  shakeKey?: string
  className?: string
}

export function ActivePokemonCard({
  pokemon,
  maxHp,
  label,
  damageText,
  isFainted = false,
  shakeKey,
  className,
}: ActivePokemonCardProps) {
  const cardContent = (
    <>
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
          className={`pixel-art w-16 h-16 object-contain md:w-28 md:h-28 ${isFainted ? 'grayscale' : ''}`}
        />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-sm font-medium text-white truncate md:text-base">{pokemon.name}</span>
        {pokemon.type.length > 0 && (
          <TypeBadges types={pokemon.type} size="md" className="mt-0.5" />
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
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={cardTransition}
      className={`relative flex flex-row items-center gap-3 rounded-lg bg-slate-800 p-3 border min-w-0 w-full min-h-[180px] h-full md:gap-5 md:p-4 md:min-w-[340px] md:min-h-[220px] ${
        isFainted ? 'border-red-900/80 opacity-75' : 'border-slate-600'
      } ${className ?? ''}`}
    >
      <motion.div
        key={shakeKey ?? 'static'}
        initial={{ x: 0 }}
        animate={{ x: shakeKey != null ? hitShakeKeyframes : 0 }}
        transition={{ x: { duration: 0.35, ease: 'easeOut' as const } }}
        className="relative flex flex-row items-center gap-3 flex-1 min-w-0 w-full"
      >
        {cardContent}
      </motion.div>
    </motion.div>
  )
}
