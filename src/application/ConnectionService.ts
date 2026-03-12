import type { ConnectionStore } from './ports/ConnectionStore'
import type { HealthClient } from './ports/HealthClient'
import type { RealtimeGateway } from './ports/RealtimeGateway'
import { normalizeBaseUrl } from '@/shared/utils/url'

export interface ConnectionServiceSaveResult {
  success: boolean
  error?: string
}

export interface ConnectionServiceTestResult {
  success: boolean
  message: string
}

export class ConnectionService {
  private readonly connectionStore: ConnectionStore
  private readonly realtime: RealtimeGateway
  private readonly healthClient: HealthClient

  constructor(
    connectionStore: ConnectionStore,
    realtime: RealtimeGateway,
    healthClient: HealthClient,
  ) {
    this.connectionStore = connectionStore
    this.realtime = realtime
    this.healthClient = healthClient
  }

  getBackendUrl(): string | null {
    return this.connectionStore.getBackendBaseUrl()
  }

  setBackendUrlAndConnect(url: string): ConnectionServiceSaveResult {
    const normalized = normalizeBaseUrl(url)
    if (!normalized) {
      return { success: false, error: 'Invalid URL' }
    }
    this.connectionStore.setBackendBaseUrl(normalized)
    this.realtime.connect(normalized)
    return { success: true }
  }

  clearBackendUrl(): void {
    this.realtime.disconnect()
    this.connectionStore.clearBackendBaseUrl()
  }

  /** Reconnect to the current backend URL (e.g. after connection loss or Retry). */
  reconnect(): void {
    const url = this.connectionStore.getBackendBaseUrl()
    if (url) {
      this.realtime.connect(url)
    }
  }

  /**
   * Sync store with actual realtime connection state (fixes desync when socket
   * is connected but store was not updated). Application layer owns this rule.
   */
  syncStatusFromRealtime(): void {
    const state = this.realtime.getConnectionState()
    if (state === 'connected' && this.connectionStore.getSocketStatus() !== 'connected') {
      this.connectionStore.setSocketStatus('connected')
      this.connectionStore.setLastError(null)
    }
  }

  async testConnection(url: string): Promise<ConnectionServiceTestResult> {
    const normalized = normalizeBaseUrl(url)
    if (!normalized) {
      return { success: false, message: 'Enter a URL first.' }
    }
    const result = await this.healthClient.checkHealth(normalized)
    if (result?.ok) {
      return { success: true, message: 'Connection OK' }
    }
    return {
      success: false,
      message: result?.status ? `HTTP ${result.status}` : 'Connection failed',
    }
  }
}
