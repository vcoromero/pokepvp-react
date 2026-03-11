import { normalizeBaseUrl } from '@/shared/utils/url'

export interface HealthResponse {
  ok?: boolean
  status?: string
  [key: string]: unknown
}

export async function checkHealth(baseUrl: string): Promise<HealthResponse | null> {
  const url = `${normalizeBaseUrl(baseUrl)}/health`
  try {
    const res = await fetch(url, { method: 'GET' })
    const data = (await res.json().catch(() => ({}))) as HealthResponse
    return { ...data, ok: res.ok, status: res.status.toString() }
  } catch {
    return null
  }
}
