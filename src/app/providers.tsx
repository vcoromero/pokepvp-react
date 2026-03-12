import type { ReactNode } from 'react'
import { AppServicesProvider } from './services-context'

interface ProvidersProps {
  children: ReactNode
}

/**
 * Global providers (router is used as root in main.tsx).
 * Application services (hexagonal) are wired here for flow hooks.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <AppServicesProvider>
      {children}
    </AppServicesProvider>
  )
}
