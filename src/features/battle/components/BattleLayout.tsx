import type { ReactNode } from 'react'

interface BattleLayoutProps {
  children: ReactNode
}

export function BattleLayout({ children }: BattleLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 flex flex-col">
      <h1 className="text-xl font-bold text-center mb-4">PokePVP — Battle</h1>
      {children}
    </div>
  )
}
