import { useContext } from 'react'
import type { ConnectionService } from '@/application/ConnectionService'
import type { LobbyService } from '@/application/LobbyService'
import type { BattleService } from '@/application/BattleService'
import type { AppServices } from './services-core'
import { AppServicesContext } from './services-core'

export function useAppServices(): AppServices {
  const ctx = useContext(AppServicesContext)
  if (!ctx) {
    throw new Error('useAppServices must be used within AppServicesProvider')
  }
  return ctx
}

export function useConnectionService(): ConnectionService {
  return useAppServices().connection
}

export function useLobbyService(): LobbyService {
  return useAppServices().lobby
}

export function useBattleService(): BattleService {
  return useAppServices().battle
}

