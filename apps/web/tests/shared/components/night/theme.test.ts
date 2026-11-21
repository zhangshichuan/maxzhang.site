import { describe, expect, it } from 'vitest'
import { resolveInitialTheme } from '@/src/shared/components/night/theme'

describe('resolveInitialTheme', () => {
  it('defaults to dark with no stored or forced theme', () => {
    expect(resolveInitialTheme(null)).toBe('dark')
    expect(resolveInitialTheme('')).toBe('dark')
    expect(resolveInitialTheme('dark')).toBe('dark')
  })

  it('keeps a stored light preference', () => {
    expect(resolveInitialTheme('light')).toBe('light')
  })

  it('lets an explicit theme override storage for screenshots', () => {
    expect(resolveInitialTheme('light', 'dark')).toBe('dark')
    expect(resolveInitialTheme(null, 'light')).toBe('light')
    expect(resolveInitialTheme('dark', 'light')).toBe('light')
  })

  it('ignores unknown values', () => {
    expect(resolveInitialTheme('sepia')).toBe('dark')
    expect(resolveInitialTheme('light', 'sepia')).toBe('light')
  })

  it('follows the device preference when nothing is stored', () => {
    expect(resolveInitialTheme(null, null, true)).toBe('light')
    expect(resolveInitialTheme(null, null, false)).toBe('dark')
  })

  it('lets a stored choice override the device preference', () => {
    expect(resolveInitialTheme('dark', null, true)).toBe('dark')
    expect(resolveInitialTheme('light', null, false)).toBe('light')
  })
})
