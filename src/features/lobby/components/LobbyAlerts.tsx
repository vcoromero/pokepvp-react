import { ConnectionBanner } from '@/shared/ui'
import type { AppError } from '@/shared/types'

interface LobbyAlertsProps {
  socketStatus: string
  lastError: AppError | null
  actionError: string | null
  onRetry?: () => void
}

export function LobbyAlerts({
  socketStatus,
  lastError,
  actionError,
  onRetry,
}: LobbyAlertsProps) {
  return (
    <ConnectionBanner
      socketStatus={socketStatus}
      lastError={lastError}
      actionError={actionError}
      onRetry={onRetry}
    />
  )
}
