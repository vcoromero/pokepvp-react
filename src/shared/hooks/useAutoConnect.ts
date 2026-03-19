import { useEffect } from 'react'
import { useAppStore } from '@/shared/store'
import { useConnectionService } from '@/app/services-hooks'

/**
 * Call from lobby or battle screens: connect to backend when backendBaseUrl is set
 * and socket is not already connected/connecting.
 * Uses ConnectionService (same gateway as Config "Save & go to Lobby") so there is
 * a single connection flow and no handler overwrite.
 * Sync and reconnect go through the service (no direct store writes) for hexagonal alignment.
 */
export function useAutoConnect() {
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)
  const socketStatus = useAppStore((s) => s.socketStatus)
  const connectionService = useConnectionService()

  useEffect(() => {
    if (!backendBaseUrl) return
    connectionService.syncStatusFromRealtime()
    if (socketStatus === 'connected' || socketStatus === 'connecting') return
    if (socketStatus === 'error') return
    connectionService.reconnect()
  }, [backendBaseUrl, socketStatus, connectionService])
}
