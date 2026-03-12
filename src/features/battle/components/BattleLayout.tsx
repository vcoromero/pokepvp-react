import type { ReactNode } from 'react'

interface BattleLayoutProps {
  children: ReactNode
  /** Optional sticky bottom bar (e.g. Attack button); always visible on viewport. */
  bottomBar?: ReactNode
}

export function BattleLayout({ children, bottomBar }: BattleLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col min-h-0 px-3 pb-2 pt-2 sm:px-4 sm:pt-4">
        <h1 className="text-sm font-bold text-center mb-3 shrink-0 sm:text-xl sm:mb-4 max-w-full">
          PokePVP — Battle
        </h1>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
      {bottomBar != null && (
        <div
          className="shrink-0 sticky bottom-0 left-0 right-0 px-3 pt-2 pb-4 bg-slate-900 border-t border-slate-700 sm:p-4 sm:pt-2"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {bottomBar}
        </div>
      )}
    </div>
  )
}
