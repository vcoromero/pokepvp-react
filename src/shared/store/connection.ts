import type { StateCreator } from 'zustand'
import { CONSTANTS } from '@/config/constants'
import { normalizeBaseUrl } from '@/shared/utils/url'
import type { AppStore, ConnectionSlice } from './types'

export type { SocketStatus } from './types'

const loadStoredUrl = (): string | null => {
  try {
    return localStorage.getItem(CONSTANTS.BACKEND_URL_STORAGE_KEY)
  } catch {
    return null
  }
}

export const createConnectionSlice: StateCreator<
  AppStore,
  [],
  [],
  ConnectionSlice
> = (set) => ({
  backendBaseUrl: loadStoredUrl(),
  socketStatus: 'disconnected',
  lastError: null,

  setLastError: (lastError) => set({ lastError }),

  setBackendUrl: (url: string) => {
    const normalized = normalizeBaseUrl(url) || null
    if (normalized) {
      try {
        localStorage.setItem(CONSTANTS.BACKEND_URL_STORAGE_KEY, normalized)
      } catch {
        // ignore
      }
    }
    set({ backendBaseUrl: normalized ?? null })
  },

  clearBackendUrl: () => {
    try {
      localStorage.removeItem(CONSTANTS.BACKEND_URL_STORAGE_KEY)
    } catch {
      // ignore
    }
    set({ backendBaseUrl: null, socketStatus: 'disconnected', lastError: null })
  },
})
