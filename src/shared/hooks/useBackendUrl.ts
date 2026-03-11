import { useAppStore } from '@/shared/store'

/** Hook to read backend base URL and whether it is set. */
export function useBackendUrl() {
  const backendBaseUrl = useAppStore((s) => s.backendBaseUrl)
  return {
    backendBaseUrl,
    hasBackendUrl: backendBaseUrl != null && backendBaseUrl.length > 0,
  }
}
