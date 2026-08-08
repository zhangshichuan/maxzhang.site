'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Monitor, Moon, Sun, X } from 'lucide-react'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import { useTranslations } from '@/src/i18n/client'
import { useAppearance, type AppearanceMode } from '@/src/shared/theme'
import { cn } from '@/src/shared/utils'

export const PANEL_ID = 'appearance-panel'
const PANEL_TITLE_ID = 'appearance-panel-title'

interface AppearancePanelProps {
  open: boolean
  onClose: () => void
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
}

export function AppearancePanel({ open, onClose }: AppearancePanelProps) {
  const t = useTranslations('Appearance')
  const { mode, intensity, setMode, setIntensity } = useAppearance()
  const panelRef = useRef<HTMLDivElement>(null)

  const modes: { value: AppearanceMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('light'), icon: <Sun className="size-4" /> },
    { value: 'dark', label: t('dark'), icon: <Moon className="size-4" /> },
    { value: 'system', label: t('system'), icon: <Monitor className="size-4" /> },
  ]

  const intensityLabel = intensity < 34 ? t('glassLiquid') : intensity > 66 ? t('glassFrosted') : t('glassBalanced')

  useEffect(() => {
    if (!open) return
    panelRef.current?.querySelector<HTMLElement>('button')?.focus()

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !panelRef.current) return

    const focusable = getFocusableElements(panelRef.current)
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement as HTMLElement | null

    if (event.shiftKey) {
      if (active === first || !panelRef.current.contains(active)) {
        event.preventDefault()
        last.focus()
      }
    } else if (active === last || !panelRef.current.contains(active)) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15, ease: 'easeOut' } }}
            className="appearance-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-label={t('title')}
            aria-modal="true"
            aria-labelledby={PANEL_TITLE_ID}
            id={PANEL_ID}
            className="appearance-panel glass-panel"
            onKeyDown={handlePanelKeyDown}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15, ease: 'easeOut' } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="appearance-panel-header">
              <span className="appearance-panel-title" id={PANEL_TITLE_ID}>
                {t('title')}
              </span>
              <button type="button" className="icon-btn icon-btn-sm" onClick={onClose} aria-label={t('close')}>
                <X className="size-4" />
              </button>
            </div>

            <div className="segmented" role="tablist" aria-label={t('modeLabel')}>
              {modes.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  role="tab"
                  aria-selected={mode === item.value}
                  className={cn('segmented-item', mode === item.value && 'active')}
                  onClick={() => setMode(item.value)}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>

            <div className="glass-intensity">
              <div className="glass-intensity-header">
                <span>{t('glassIntensity')}</span>
                <span className="glass-intensity-value">{intensityLabel}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="glass-intensity-slider"
                aria-label={t('glassIntensity')}
              />
              <div className="glass-intensity-labels">
                <span>{t('glassLiquid')}</span>
                <span>{t('glassFrosted')}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
