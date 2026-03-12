import type { RealtimeGateway } from './ports/RealtimeGateway'
import type { BattleRepository } from './ports/BattleRepository'
import type { SessionStore } from './ports/SessionStore'

export interface BattleServiceActionResult {
  error?: string
}

export class BattleService {
  private readonly realtime: RealtimeGateway
  private readonly battleRepository: BattleRepository
  private readonly sessionStore: SessionStore

  constructor(
    realtime: RealtimeGateway,
    battleRepository: BattleRepository,
    sessionStore: SessionStore,
  ) {
    this.realtime = realtime
    this.battleRepository = battleRepository
    this.sessionStore = sessionStore
  }

  attack(lobbyId: string): Promise<BattleServiceActionResult> {
    return new Promise((resolve) => {
      this.realtime.attack(lobbyId, (err) => {
        resolve(err ? { error: err.message } : {})
      })
    })
  }

  surrender(lobbyId: string): Promise<BattleServiceActionResult> {
    return new Promise((resolve) => {
      this.realtime.surrender(lobbyId, (err) => {
        resolve(err ? { error: err.message } : {})
      })
    })
  }

  resetAndLeave(): void {
    this.battleRepository.resetBattle()
    this.sessionStore.resetSession()
  }
}
