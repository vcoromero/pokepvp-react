import type { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Global providers (router is used as root in main.tsx).
 * Add theme, query client, etc. here if needed later.
 */
export function Providers({ children }: ProvidersProps) {
  return <>{children}</>
}
