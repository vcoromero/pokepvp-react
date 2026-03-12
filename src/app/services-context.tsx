import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { ConnectionService } from '@/application/ConnectionService'
import { LobbyService } from '@/application/LobbyService'
import { BattleService } from '@/application/BattleService'
import { SocketIoRealtimeGateway } from '@/infrastructure/realtime/SocketIoRealtimeGateway'
import { ZustandConnectionStore } from '@/infrastructure/store/ZustandConnectionStore'
import { ZustandSessionStore } from '@/infrastructure/store/ZustandSessionStore'
import { ZustandBattleRepository } from '@/infrastructure/store/ZustandBattleRepository'
import { HttpHealthClient } from '@/infrastructure/http/HttpHealthClient'

interface AppServices {
  connection: ConnectionService
  lobby: LobbyService
  battle: BattleService
}

const AppServicesContext = createContext<AppServices | null>(null)

function createAppServices(): AppServices {
  const connectionStore = new ZustandConnectionStore()
  const sessionStore = new ZustandSessionStore()
  const battleRepository = new ZustandBattleRepository()
  const realtimeGateway = new SocketIoRealtimeGateway(
    connectionStore,
    sessionStore,
    battleRepository,
  )
  const healthClient = new HttpHealthClient()

  return {
    connection: new ConnectionService(
      connectionStore,
      realtimeGateway,
      healthClient,
    ),
    lobby: new LobbyService(realtimeGateway, sessionStore, connectionStore),
    battle: new BattleService(realtimeGateway, battleRepository, sessionStore),
  }
}

let appServicesInstance: AppServices | null = null

function getAppServices(): AppServices {
  if (!appServicesInstance) {
    appServicesInstance = createAppServices()
  }
  return appServicesInstance
}

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
