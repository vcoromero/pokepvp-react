import type { AppError } from '@/shared/types'

interface LobbyAlertsProps {
  socketStatus: string
  lastError: AppError | null
  actionError: string | null
}

export function LobbyAlerts({
  socketStatus,
  lastError,
  actionError,
}: LobbyAlertsProps) {
  return (
    <>
      {socketStatus !== 'connected' && (
        <p className="text-amber-400 mb-4">
          Status: {socketStatus}. Waiting for connection…
        </p>
      )}
      {lastError && (
        <p className="text-red-400 mb-4" role="alert">
          {lastError.message}
        </p>
      )}
      {actionError && (
        <p className="text-red-400 mb-4" role="alert">
          {actionError}
        </p>
      )}
    </>
  )
}
