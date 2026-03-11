import { ConnectionBanner } from '@/shared/ui'
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
    <ConnectionBanner
      socketStatus={socketStatus}
      lastError={lastError}
      actionError={actionError}
    />
  )
}
