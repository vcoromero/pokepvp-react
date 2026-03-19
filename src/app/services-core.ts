import { createContext } from 'react'
import { ConnectionService } from '@/application/ConnectionService'
import { LobbyService } from '@/application/LobbyService'
import { BattleService } from '@/application/BattleService'
import { SocketIoRealtimeGateway } from '@/infrastructure/realtime/SocketIoRealtimeGateway'
import { ZustandConnectionStore } from '@/infrastructure/store/ZustandConnectionStore'
import { ZustandSessionStore } from '@/infrastructure/store/ZustandSessionStore'
import { ZustandBattleRepository } from '@/infrastructure/store/ZustandBattleRepository'
import { HttpHealthClient } from '@/infrastructure/http/HttpHealthClient'

export interface AppServices {
  connection: ConnectionService
  lobby: LobbyService
  battle: BattleService
}

export const AppServicesContext = createContext<AppServices | null>(null)

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
    battle: new BattleService(
      realtimeGateway,
      battleRepository,
      sessionStore,
    ),
  }
}

let appServicesInstance: AppServices | null = null

export function getAppServices(): AppServices {
  if (!appServicesInstance) {
    appServicesInstance = createAppServices()
  }
  return appServicesInstance
}

