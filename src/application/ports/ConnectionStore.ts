import type { AppError } from '@/shared/types'
import type { SocketStatus } from '@/shared/store'

export interface ConnectionStore {
  getBackendBaseUrl(): string | null
  setBackendBaseUrl(url: string | null): void
  clearBackendBaseUrl(): void

  getSocketStatus(): SocketStatus
  setSocketStatus(status: SocketStatus): void

  getLastError(): AppError | null
  setLastError(error: AppError | null): void
}

