import { motion } from 'framer-motion'
import type { PokemonState } from '@/shared/types'
import { ActivePokemonCard } from './ActivePokemonCard'
import { BenchPokemonList } from './BenchPokemonList'

const sideVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.25, ease: 'easeOut' as const },
  }),
}

interface BattleSideProps {
  active: PokemonState | undefined
  bench: PokemonState[]
  maxHpByStateId: Record<string, number>
  label: string
  damageText?: string | null
  /** When true, the active card is shown in a "fainted" state (during faint debounce). */
  isActiveFainted?: boolean
  /** When set, the active card runs a hit-shake animation (one-shot per unique value). */
  shakeKey?: string
}

export function BattleSide({
  active,
  bench,
  maxHpByStateId,
  label,
  damageText,
  isActiveFainted = false,
  shakeKey,
}: BattleSideProps) {
  return (
    <motion.div
      className="flex flex-col gap-2 items-stretch sm:flex-row sm:gap-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.06, delayChildren: 0.05 },
        },
      }}
    >
      {bench.length > 0 && (
        <motion.div variants={sideVariants} custom={0}>
          <BenchPokemonList
            pokemonList={bench}
            maxHpByStateId={maxHpByStateId}
          />
        </motion.div>
      )}
      <motion.div
        className="flex-1 min-w-0 flex flex-col self-stretch min-h-0"
        variants={sideVariants}
        custom={1}
      >
        {active ? (
          <ActivePokemonCard
            pokemon={active}
            maxHp={maxHpByStateId[active.id] ?? active.currentHp}
            label={label}
            damageText={damageText}
            isFainted={isActiveFainted}
            shakeKey={shakeKey}
          />
        ) : (
          <div className="panel-card p-4 min-w-0 min-h-[180px] md:min-w-[340px] md:min-h-[220px] flex items-center justify-center h-full">
            <span className="text-slate-500 text-sm">No active Pokémon</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
