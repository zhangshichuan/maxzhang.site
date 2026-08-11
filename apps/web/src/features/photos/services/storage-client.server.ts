const STORAGE_BASE_URL = (process.env.STORAGE_BASE_URL ?? 'http://localhost:9001').replace(/\/$/, '')
const STORAGE_API_KEY = process.env.STORAGE_API_KEY ?? ''

export interface StoragePhotoExif {
  takenAt: string | null
  latitude: number | null
  longitude: number | null
  camera: string | null
  lens: string | null
  focal: string | null
  aperture: string | null
  shutter: string | null
  iso: string | null
}

export interface StoragePhotoResult {
  large: { key: string; url: string }
  thumb: { key: string; url: string }
  width: number
  height: number
  exif: StoragePhotoExif
}

export interface StorageUploadResponse {
  provider: string
  photos: StoragePhotoResult[]
}

/**
 * 把存储服务返回的对象地址转成 Web 同源地址。
 * local 适配器的文件由 Web 静态伺服（dev 走 Vite public，生产走 .output/public/photos 卷）；
 * 未来切到七牛等公网厂商时，返回的是外链，原样保留。
 */
export function toPublicPhotoUrl(object: { key: string; url: string }, provider: string): string {
  return provider === 'local' ? `/photos/${object.key}` : object.url
}

export async function uploadPhotosToStorage(form: FormData): Promise<StorageUploadResponse> {
  const response = await fetch(`${STORAGE_BASE_URL}/uploads`, {
    method: 'POST',
    headers: { 'x-storage-key': STORAGE_API_KEY },
    body: form,
  })
  if (!response.ok) {
    throw new Error(`storage upload failed: ${response.status}`)
  }
  return (await response.json()) as StorageUploadResponse
}

export async function deleteObjectsFromStorage(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await fetch(`${STORAGE_BASE_URL}/objects`, {
    method: 'DELETE',
    headers: { 'x-storage-key': STORAGE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys }),
  })
}
