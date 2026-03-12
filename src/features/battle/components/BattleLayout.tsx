import type { ReactNode } from 'react'

interface BattleLayoutProps {
  children: ReactNode
  /** Optional sticky bottom bar (e.g. Attack button); always visible on viewport. */
  bottomBar?: ReactNode
}

export function BattleLayout({ children, bottomBar }: BattleLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col min-h-0 p-4 pb-2">
        <h1 className="text-xl font-bold text-center mb-4 shrink-0">PokePVP — Battle</h1>
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      </div>
      {bottomBar != null && (
        <div className="shrink-0 sticky bottom-0 left-0 right-0 p-4 pt-2 bg-slate-900 border-t border-slate-700">
          {bottomBar}
        </div>
      )}
    </div>
  )
}
