import { describe, expect, it } from 'vitest'
import { normalizeBaseUrl, isValidHttpUrl } from './url'

describe('normalizeBaseUrl', () => {
  it('trims whitespace and removes trailing slashes', () => {
    expect(normalizeBaseUrl(' http://example.com/ ')).toBe('http://example.com')
    expect(normalizeBaseUrl('https://example.com////')).toBe('https://example.com')
  })

  it('keeps inner path segments and only strips trailing slashes', () => {
    expect(normalizeBaseUrl('http://example.com/api/')).toBe('http://example.com/api')
    expect(normalizeBaseUrl('http://example.com/api//')).toBe('http://example.com/api')
  })
})

describe('isValidHttpUrl', () => {
  it('returns true for valid http/https URLs', () => {
    expect(isValidHttpUrl('http://example.com')).toBe(true)
    expect(isValidHttpUrl('https://example.com')).toBe(true)
  })

  it('returns false for non-http protocols or invalid URLs', () => {
    expect(isValidHttpUrl('ftp://example.com')).toBe(false)
    expect(isValidHttpUrl('not-a-url')).toBe(false)
    expect(isValidHttpUrl('')).toBe(false)
  })
})

