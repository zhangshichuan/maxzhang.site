import { describe, expect, it } from 'vitest'
import { parsePhotoHash, photoHash } from '@/src/features/photos/model/photo-hash'

describe('photo-hash', () => {
  it('parses a photo deep link', () => {
    expect(parsePhotoHash('#photo/photo-msnf1q0f-15ec1d')).toBe('photo-msnf1q0f-15ec1d')
  })

  it('returns null for an empty or unrelated hash', () => {
    expect(parsePhotoHash('')).toBeNull()
    expect(parsePhotoHash('#')).toBeNull()
    expect(parsePhotoHash('#photo/')).toBeNull()
    expect(parsePhotoHash('#post/abc')).toBeNull()
  })

  it('round-trips a slug through hash helpers', () => {
    const slug = 'photo-msnew2rx-5ce5f6'
    expect(parsePhotoHash(photoHash(slug))).toBe(slug)
  })
})
