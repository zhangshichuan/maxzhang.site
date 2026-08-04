'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type AppearanceMode = 'light' | 'dark' | 'system'

interface AppearanceState {
  mode: AppearanceMode
  intensity: number
  resolvedMode: 'light' | 'dark'
  setMode: (mode: AppearanceMode) => void
  setIntensity: (intensity: number) => void
}

export const APPEARANCE_STORAGE_KEY = 'maxzhang.appearance'

export interface StoredAppearance {
  mode: AppearanceMode
  intensity: number
}

export function readStoredAppearance(): StoredAppearance {
  if (typeof window === 'undefined') return { mode: 'system', intensity: 50 }
  try {
    const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY)
    if (!raw) return { mode: 'system', intensity: 50 }
    const parsed = JSON.parse(raw) as Partial<StoredAppearance>
    const mode: AppearanceMode =
      parsed.mode === 'light' || parsed.mode === 'dark' || parsed.mode === 'system' ? parsed.mode : 'system'
    const intensity = typeof parsed.intensity === 'number' ? Math.min(100, Math.max(0, parsed.intensity)) : 50
    return { mode, intensity }
  } catch {
    return { mode: 'system', intensity: 50 }
  }
}

export function resolveMode(mode: AppearanceMode): 'light' | 'dark' {
  if (mode !== 'system') return mode
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyAppearance(mode: AppearanceMode, intensity: number) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const resolved = resolveMode(mode)
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)

  const dark = resolved === 'dark'
  const alpha = Math.round((dark ? 36 : 48) + intensity * (dark ? 0.44 : 0.38))
  const blur = Math.round(14 + intensity * 0.22)
  const sat = (1.5 - intensity * 0.006).toFixed(2)
  const wallpaperOpacity = (1 - intensity * 0.006).toFixed(2)
  root.style.setProperty('--glass-alpha', `${alpha}%`)
  root.style.setProperty('--glass-blur', `${blur}px`)
  root.style.setProperty('--glass-sat', sat)
  root.style.setProperty('--wallpaper-opacity', wallpaperOpacity)

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  themeColor?.setAttribute('content', dark ? '#000000' : '#ffffff')
}

const AppearanceContext = createContext<AppearanceState | null>(null)

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<AppearanceMode>('system')
  const [intensity, setIntensityState] = useState(50)
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const stored = readStoredAppearance()
    setModeState(stored.mode)
    setIntensityState(stored.intensity)
    setResolvedMode(resolveMode(stored.mode))
    applyAppearance(stored.mode, stored.intensity)
  }, [])

  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      setResolvedMode(mq.matches ? 'dark' : 'light')
      applyAppearance(mode, intensity)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [mode, intensity])

  const persist = useCallback((nextMode: AppearanceMode, nextIntensity: number) => {
    try {
      window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify({ mode: nextMode, intensity: nextIntensity }))
    } catch {
      // 隐私模式等场景下 localStorage 可能不可用，静默降级为会话内生效
    }
  }, [])

  const setMode = useCallback(
    (nextMode: AppearanceMode) => {
      setModeState(nextMode)
      setResolvedMode(resolveMode(nextMode))
      applyAppearance(nextMode, intensity)
      persist(nextMode, intensity)
    },
    [intensity, persist],
  )

  const setIntensity = useCallback(
    (nextIntensity: number) => {
      const clamped = Math.min(100, Math.max(0, nextIntensity))
      setIntensityState(clamped)
      applyAppearance(mode, clamped)
      persist(mode, clamped)
    },
    [mode, persist],
  )

  const value = useMemo(
    () => ({ mode, intensity, resolvedMode, setMode, setIntensity }),
    [mode, intensity, resolvedMode, setMode, setIntensity],
  )

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance(): AppearanceState {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error('useAppearance must be used within AppearanceProvider')
  return ctx
}
