import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { AppServicesContext, getAppServices } from './services-core'

interface AppServicesProviderProps {
  children: ReactNode
}

export function AppServicesProvider({ children }: AppServicesProviderProps) {
  const services = useMemo(() => getAppServices(), [])
  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  )
}
