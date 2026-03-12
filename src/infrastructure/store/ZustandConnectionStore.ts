import { useAppStore } from '@/shared/store'
import type { ConnectionStore } from '@/application/ports/ConnectionStore'
import type { AppError } from '@/shared/types'
import type { SocketStatus } from '@/shared/store'

export class ZustandConnectionStore implements ConnectionStore {
  getBackendBaseUrl(): string | null {
    return useAppStore.getState().backendBaseUrl
  }

  setBackendBaseUrl(url: string | null): void {
    if (url === null) {
      useAppStore.getState().clearBackendUrl()
      return
    }
    useAppStore.getState().setBackendUrl(url)
  }

  clearBackendBaseUrl(): void {
    useAppStore.getState().clearBackendUrl()
  }

  getSocketStatus(): SocketStatus {
    return useAppStore.getState().socketStatus
  }

  setSocketStatus(status: SocketStatus): void {
    useAppStore.setState({ socketStatus: status })
  }

  getLastError(): AppError | null {
    return useAppStore.getState().lastError
  }

  setLastError(error: AppError | null): void {
    useAppStore.getState().setLastError(error)
  }
}

