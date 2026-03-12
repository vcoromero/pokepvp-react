import { Link } from 'react-router-dom'
import type { AppError } from '@/shared/types'

interface ConnectionBannerProps {
  socketStatus: string
  lastError: AppError | null
  /** Optional action error (e.g. from join_lobby ack). Shown in addition to lastError. */
  actionError?: string | null
  /** Called when user clicks Retry (reconnect with current backend URL). Omit to hide Retry. */
  onRetry?: () => void
}

export function ConnectionBanner({
  socketStatus,
  lastError,
  actionError,
  onRetry,
}: ConnectionBannerProps) {
  const isConnected = socketStatus === 'connected'
  const hasError = lastError != null || (actionError != null && actionError !== '')
  const isError = socketStatus === 'error'

  if (isConnected && !hasError) return null

  return (
    <div className="mb-4 space-y-2" role="alert">
      {!isConnected && (
        <p className="text-amber-400">
          Status: {socketStatus}. Waiting for connection…
        </p>
      )}
      {lastError && (
        <p className="text-red-400">
          {lastError.message}
        </p>
      )}
      {actionError && (
        <p className="text-red-400">
          {actionError}
        </p>
      )}
      {!isConnected && (
        <p className="text-sm">
          {isError && onRetry && (
            <>
              <button
                type="button"
                onClick={onRetry}
                className="text-sky-400 hover:text-sky-300 underline"
              >
                Retry connection
              </button>
              {' · '}
            </>
          )}
          <Link
            to="/config"
            className="text-sky-400 hover:text-sky-300 underline"
          >
            Change backend URL
          </Link>
          {' '}
          to reconnect or use a different server.
        </p>
      )}
    </div>
  )
}
