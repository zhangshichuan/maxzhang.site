const PHOTO_HASH_PREFIX = '#photo/'

/**
 * 从 location.hash 中解析当前打开的作品 slug。
 * `#photo/abc` → `'abc'`；其他 hash 或空 → `null`。
 */
export function parsePhotoHash(hash: string): string | null {
  if (!hash.startsWith(PHOTO_HASH_PREFIX)) return null
  const slug = hash.slice(PHOTO_HASH_PREFIX.length)
  return slug.length > 0 ? slug : null
}

/**
 * 生成作品的深链 hash，供弹窗打开时写入地址栏。
 */
export function photoHash(slug: string): string {
  return `${PHOTO_HASH_PREFIX}${encodeURIComponent(slug)}`
}
