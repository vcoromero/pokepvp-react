export function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '')
}

/**
 * Converts a base URL so it can be used from the browser.
 * Replaces 0.0.0.0 (and ::) with localhost, since browsers cannot connect to "listen on all interfaces" addresses.
 */
export function toConnectableBaseUrl(url: string): string {
  const normalized = normalizeBaseUrl(url)
  try {
    const parsed = new URL(normalized)
    const host = parsed.hostname
    if (host === '0.0.0.0' || host === '::') {
      parsed.hostname = 'localhost'
      return normalizeBaseUrl(parsed.toString())
    }
    return normalized
  } catch {
    return normalized
  }
}

export function isValidHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
