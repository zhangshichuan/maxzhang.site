import { useState } from 'react'
import type { Locale } from '@/i18n/routing'
import type { Translator } from '@/src/i18n/client'
import { cn } from '@/src/shared/utils/cn'
import {
  GUESTS,
  GUEST_GROUPS,
  guestName,
  localizedText,
  MAX_TABLE_GUESTS,
  TABLE_PRESETS,
  type GuestGroupFilter,
  type GuestId,
} from '../model/guests'
import { GuestMark } from './guest-mark'

type GuestPickerProps = {
  selected: GuestId[]
  onToggle: (id: GuestId) => void
  onPreset: (guests: GuestId[]) => void
  t: Translator
  locale: Locale
}

/**
 * 宾客名录：选一位对谈，或选两三位开一桌。
 * 宾客卡只负责选择，开席按钮在底部的托盘里。
 */
export function GuestPicker({ selected, onToggle, onPreset, t, locale }: GuestPickerProps) {
  const [filter, setFilter] = useState<GuestGroupFilter>('all')
  const visibleGuests = filter === 'all' ? GUESTS : GUESTS.filter((guest) => guest.group === filter)
  const atLimit = selected.length >= MAX_TABLE_GUESTS

  return (
    <div className="ch-picker">
      <div className="ch-picker-intro">
        <p className="ch-mono ch-picker-eyebrow">{t('lobbyEyebrow')}</p>
        <h2 className="ch-picker-title">{t('lobbyTitle')}</h2>
        <p className="ch-picker-desc">{t('lobbyDesc')}</p>
        <p className="ch-picker-note">{t('shortDisclaimer')}</p>
      </div>

      <div className="ch-presets">
        <span className="ch-mono ch-presets-label">{t('recommended')}</span>
        {TABLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="ch-preset"
            onClick={() => {
              setFilter('all')
              onPreset([...preset.guests])
            }}
          >
            {localizedText(preset.label, locale)}
          </button>
        ))}
      </div>

      <div className="ch-filters" role="group" aria-label={t('filterLabel')}>
        {GUEST_GROUPS.map((group) => {
          const count = group.id === 'all' ? GUESTS.length : GUESTS.filter((guest) => guest.group === group.id).length
          return (
            <button
              key={group.id}
              type="button"
              className={cn('ch-filter', filter === group.id && 'is-active')}
              aria-pressed={filter === group.id}
              onClick={() => setFilter(group.id)}
            >
              {localizedText(group.label, locale)}
              <span>{String(count).padStart(2, '0')}</span>
            </button>
          )
        })}
      </div>

      {atLimit && (
        <p className="ch-picker-hint ch-mono" role="status">
          {t('maxHint', { max: MAX_TABLE_GUESTS })}
        </p>
      )}

      <ul className="ch-guest-grid">
        {visibleGuests.map((guest) => {
          const selectedIndex = selected.indexOf(guest.id)
          const isSelected = selectedIndex >= 0
          const disabled = !isSelected && atLimit
          return (
            <li key={guest.id}>
              <button
                type="button"
                className={cn('ch-guest-card', isSelected && 'is-selected', disabled && 'is-disabled')}
                aria-pressed={isSelected}
                disabled={disabled}
                onClick={() => onToggle(guest.id)}
              >
                <span className="ch-guest-top">
                  <span className="ch-mono ch-guest-index">
                    {String(GUESTS.findIndex((item) => item.id === guest.id) + 1).padStart(2, '0')}
                  </span>
                  <GuestMark guest={guest} />
                  <span className="ch-mono ch-guest-state">{isSelected ? `0${selectedIndex + 1}` : '+'}</span>
                </span>
                <span className="ch-guest-name">{guestName(guest, locale)}</span>
                <span className="ch-mono ch-guest-field">{localizedText(guest.field, locale)}</span>
                <span className="ch-guest-tagline">{localizedText(guest.tagline, locale)}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
