import { describe, expect, it } from 'vitest'
import { mapBackendError, type AppError } from './index'

describe('mapBackendError', () => {
  it('returns friendly message for NotConnected', () => {
    const error: AppError = { code: 'NotConnected', message: 'Socket not connected' }
    expect(mapBackendError(error)).toBe(
      'Not connected to the server. Please check your connection.',
    )
  })

  it('returns the original message when present', () => {
    const error: AppError = { code: 'SomeError', message: 'Something went wrong' }
    expect(mapBackendError(error)).toBe('Something went wrong')
  })

  it('falls back to generic message when message is empty', () => {
    const error: AppError = { code: 'SomeError', message: '' }
    expect(mapBackendError(error)).toBe('An unexpected error occurred.')
  })
})

