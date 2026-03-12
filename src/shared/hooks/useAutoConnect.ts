import { useEffect } from 'react'
import { useAppStore } from '@/shared/store'
import { connect, getSocket } from '@/shared/api/socket'

/**
 * Call from lobby or battle screens: connect to backend when backendBaseUrl is set
 * and socket is not already connected/connecting.
 * Only auto-connects when status is 'disconnected' to avoid a retry loop when the
 * backend is down (status stays 'error' and would otherwise trigger connect() repeatedly).
 * User can use "Retry" in the connection banner or change URL in config to reconnect.
 */
export function useAutoConnect() {
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)
  const socketStatus = useAppStore((s) => s.socketStatus)

  useEffect(() => {
    if (!backendBaseUrl) return
    if (socketStatus === 'connected' || socketStatus === 'connecting') return
    if (socketStatus === 'error') return
    if (getSocket()?.connected) return
    connect(backendBaseUrl)
  }, [backendBaseUrl, socketStatus])
}
