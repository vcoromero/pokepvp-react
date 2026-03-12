export interface HealthCheckResult {
  ok: boolean
  status?: string
}

export interface HealthClient {
  checkHealth(baseUrl: string): Promise<HealthCheckResult | null>
}
