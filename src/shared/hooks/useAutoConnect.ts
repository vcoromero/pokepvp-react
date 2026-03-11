import { useEffect } from 'react'
import { useAppStore } from '@/shared/store'
import { connect, getSocket } from '@/shared/api/socket'

/**
 * Call from lobby or battle screens: connect to backend when backendBaseUrl is set
 * and socket is not already connected/connecting.
 */
export function useAutoConnect() {
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)
  const socketStatus = useAppStore((s) => s.socketStatus)

  useEffect(() => {
    if (!backendBaseUrl) return
    if (socketStatus === 'connected' || socketStatus === 'connecting') return
    if (getSocket()?.connected) return
    connect(backendBaseUrl)
  }, [backendBaseUrl, socketStatus])
}
