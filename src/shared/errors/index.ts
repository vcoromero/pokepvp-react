import type { AppError } from '@/shared/types'

export type { AppError }

export function mapBackendError(error: AppError): string {
  if (error.code === 'NotConnected') {
    return 'Not connected to the server. Please check your connection.'
  }
  if (error.code === 'InvalidPayload') {
    return 'Invalid data from the server. Please refresh or try again.'
  }
  return error.message || 'An unexpected error occurred.'
}
