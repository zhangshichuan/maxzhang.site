import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  getGuest,
  GUESTS,
  GUEST_IDS,
  guestName,
  isGuestId,
  MAX_TABLE_GUESTS,
  TABLE_PRESETS,
} from '@/src/features/chat/model/guests'

describe('夜宴宾客名录', () => {
  it('id 唯一且与 chat 服务的提示词文件一一对应', () => {
    expect(new Set(GUEST_IDS).size).toBe(GUEST_IDS.length)
    const personaDir = path.resolve(process.cwd(), '../services/chat/personas')
    for (const guest of GUESTS) {
      const file = path.join(personaDir, `${guest.id}.md`)
      expect(fs.existsSync(file), `missing persona file: ${file}`).toBe(true)
      const content = fs.readFileSync(file, 'utf8')
      expect(content.startsWith('# ')).toBe(true)
      expect(content).toContain(guest.name.en)
      expect(isGuestId(guest.id)).toBe(true)
    }
  })

  it('每位宾客都有中英文名、领域和一句判断', () => {
    for (const guest of GUESTS) {
      expect(guest.name.zh.length).toBeGreaterThan(0)
      expect(guest.name.en.length).toBeGreaterThan(0)
      expect(guest.field.zh.length).toBeGreaterThan(0)
      expect(guest.field.en.length).toBeGreaterThan(0)
      expect(guest.tagline.zh.length).toBeGreaterThan(0)
      expect(guest.tagline.en.length).toBeGreaterThan(0)
      expect(guest.initials.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('每张推荐桌都不超过 3 位且全部是有效宾客', () => {
    expect(MAX_TABLE_GUESTS).toBe(3)
    for (const preset of TABLE_PRESETS) {
      expect(preset.guests.length).toBeGreaterThan(0)
      expect(preset.guests.length).toBeLessThanOrEqual(MAX_TABLE_GUESTS)
      for (const id of preset.guests) {
        expect(isGuestId(id)).toBe(true)
      }
    }
  })

  it('按语言返回姓名，短名用于桌边标签', () => {
    const jobs = getGuest('steve-jobs')
    expect(guestName(jobs, 'zh')).toBe('史蒂夫·乔布斯')
    expect(guestName(jobs, 'en')).toBe('Steve Jobs')
    expect(guestName(jobs, 'zh', true)).toBe('乔布斯')
    expect(guestName(jobs, 'en', true)).toBe('Jobs')
  })
})
