import type { HealthClient, HealthCheckResult } from '@/application/ports/HealthClient'
import { checkHealth } from '@/shared/api/http'

export class HttpHealthClient implements HealthClient {
  async checkHealth(baseUrl: string): Promise<HealthCheckResult | null> {
    const result = await checkHealth(baseUrl)
    if (result == null) return null
    return {
      ok: result.ok === true,
      status: result.status,
    }
  }
}
