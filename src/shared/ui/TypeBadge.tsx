/**
 * Pokémon type badge: oval shape, gradient background, dark border,
 * uppercase label in white (no outline) for clean readability.
 * Uses canonical type colors; unknown types fall back to neutral.
 */

const TYPE_STYLES: Record<
  string,
  { gradientStart: string; gradientEnd: string; border: string }
> = {
  bug: { gradientStart: '#A8C938', gradientEnd: '#8BAB20', border: '#5C6B1A' },
  dark: { gradientStart: '#7A6B5E', gradientEnd: '#5C4A3E', border: '#3D3229' },
  dragon: { gradientStart: '#8878C8', gradientEnd: '#6B58B0', border: '#453C78' },
  electric: { gradientStart: '#F8D830', gradientEnd: '#E0C018', border: '#9A8A20' },
  fairy: { gradientStart: '#E8A0C0', gradientEnd: '#D080A8', border: '#905070' },
  fighting: { gradientStart: '#C83838', gradientEnd: '#A02828', border: '#601818' },
  fire: { gradientStart: '#F08030', gradientEnd: '#D86818', border: '#984020' },
  flying: { gradientStart: '#A890F0', gradientEnd: '#8870D8', border: '#5848A0' },
  ghost: { gradientStart: '#7068B0', gradientEnd: '#584898', border: '#383070' },
  grass: { gradientStart: '#78C850', gradientEnd: '#5CA838', border: '#3C7820' },
  ground: { gradientStart: '#E0C068', gradientEnd: '#C0A048', border: '#806830' },
  ice: { gradientStart: '#98D8D8', gradientEnd: '#78B8B8', border: '#488898' },
  normal: { gradientStart: '#A8A878', gradientEnd: '#888858', border: '#585838' },
  poison: { gradientStart: '#A040A0', gradientEnd: '#802080', border: '#501050' },
  psychic: { gradientStart: '#F85888', gradientEnd: '#D83868', border: '#982048' },
  rock: { gradientStart: '#B8A038', gradientEnd: '#988020', border: '#605018' },
  steel: { gradientStart: '#B8B8D0', gradientEnd: '#9898B0', border: '#606078' },
  water: { gradientStart: '#6890F0', gradientEnd: '#4870D8', border: '#2848A0' },
}

const DEFAULT_STYLE = {
  gradientStart: '#888888',
  gradientEnd: '#666666',
  border: '#444444',
}

interface TypeBadgeProps {
  type: string
  /** 'xs' for tight layouts (e.g. lobby team), 'sm' for bench, 'md' for cards (default) */
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export function TypeBadge({ type, size = 'md', className = '' }: TypeBadgeProps) {
  const key = type.toLowerCase()
  const style = TYPE_STYLES[key] ?? DEFAULT_STYLE

  const sizeClasses =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[8px] border'
      : size === 'sm'
        ? 'px-2 py-0.5 text-[10px] border-2'
        : 'px-2.5 py-1 text-xs border-2'

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wide whitespace-nowrap ${sizeClasses} ${className}`}
      style={{
        background: `linear-gradient(180deg, ${style.gradientStart} 0%, ${style.gradientEnd} 100%)`,
        borderColor: style.border,
        color: '#ffffff',
      }}
    >
      {type}
    </span>
  )
}

interface TypeBadgesProps {
  types: string[]
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

/** Renders a row of type badges for a Pokémon. */
export function TypeBadges({ types, size = 'md', className = '' }: TypeBadgesProps) {
  if (types.length === 0) return null
  const gapClass = size === 'xs' ? 'gap-1' : 'gap-1.5'
  return (
    <div className={`flex flex-wrap ${gapClass} ${className}`}>
      {types.map((t) => (
        <TypeBadge key={t} type={t} size={size} />
      ))}
    </div>
  )
}
