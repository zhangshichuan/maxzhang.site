'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Monitor, Moon, Sun, X } from 'lucide-react'
import * as React from 'react'
import { useTranslations } from '@/src/i18n/client'
import { useAppearance, type AppearanceMode } from '@/src/shared/theme'
import { cn } from '@/src/shared/utils'

interface AppearancePanelProps {
  open: boolean
  onClose: () => void
}

export function AppearancePanel({ open, onClose }: AppearancePanelProps) {
  const t = useTranslations('Appearance')
  const { mode, intensity, setMode, setIntensity } = useAppearance()

  const modes: { value: AppearanceMode; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: t('light'), icon: <Sun className="size-4" /> },
    { value: 'dark', label: t('dark'), icon: <Moon className="size-4" /> },
    { value: 'system', label: t('system'), icon: <Monitor className="size-4" /> },
  ]

  const intensityLabel = intensity < 34 ? t('clear') : intensity > 66 ? t('tinted') : t('balanced')

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
            role="dialog"
            aria-label={t('title')}
            className="appearance-panel glass-panel"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.15, ease: 'easeOut' } }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="appearance-panel-header">
              <span className="appearance-panel-title">{t('title')}</span>
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
                <span>{t('clear')}</span>
                <span>{t('tinted')}</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
