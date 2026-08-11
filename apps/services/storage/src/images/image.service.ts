import { Injectable } from '@nestjs/common'
import exifr from 'exifr'
import sharp from 'sharp'

export interface PhotoExif {
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

export interface ProcessedPhoto {
  large: Buffer
  thumb: Buffer
  width: number
  height: number
  exif: PhotoExif
}

const LARGE_EDGE = 3000
const THUMB_EDGE = 800

/**
 * 图片加工服务
 *
 * 以视觉无损标准生成两个 WebP 变体（大图 / 缩略图），
 * 转换时默认剥离 EXIF；拍摄参数在加工前单独提取。
 */
@Injectable()
export class ImageService {
  async processPhoto(buffer: Buffer): Promise<ProcessedPhoto> {
    const [exif, large, thumb] = await Promise.all([
      extractExif(buffer),
      sharp(buffer)
        .rotate()
        .resize({ width: LARGE_EDGE, height: LARGE_EDGE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 95 })
        .toBuffer(),
      sharp(buffer)
        .rotate()
        .resize({ width: THUMB_EDGE, height: THUMB_EDGE, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer(),
    ])
    const largeMeta = await sharp(large).metadata()

    return {
      large,
      thumb,
      width: largeMeta.width ?? 0,
      height: largeMeta.height ?? 0,
      exif,
    }
  }
}

async function extractExif(buffer: Buffer): Promise<PhotoExif> {
  const empty: PhotoExif = {
    takenAt: null,
    latitude: null,
    longitude: null,
    camera: null,
    lens: null,
    focal: null,
    aperture: null,
    shutter: null,
    iso: null,
  }

  let data: Record<string, unknown> | undefined
  try {
    data = await exifr.parse(buffer, {
      pick: [
        'DateTimeOriginal',
        'Make',
        'Model',
        'LensModel',
        'FocalLength',
        'FocalLengthIn35mmFormat',
        'FNumber',
        'ExposureTime',
        'ISO',
        'latitude',
        'longitude',
      ],
    })
  } catch {
    // WebP / 部分 PNG 会被 exifr 判为未知格式；EXIF 只是增强信息，缺失不阻断上传。
    return empty
  }
  if (!data) {
    return empty
  }

  const camera = [data.Make, data.Model].filter(Boolean).join(' ').trim() || null
  const focalRaw = data.FocalLengthIn35mmFormat ?? data.FocalLength
  const exposure = data.ExposureTime
  const shutter =
    typeof exposure === 'number' ? (exposure < 1 ? `1/${Math.round(1 / exposure)}s` : `${exposure}s`) : null

  return {
    takenAt: data.DateTimeOriginal instanceof Date ? data.DateTimeOriginal.toISOString() : null,
    latitude: typeof data.latitude === 'number' ? data.latitude : null,
    longitude: typeof data.longitude === 'number' ? data.longitude : null,
    camera,
    lens: typeof data.LensModel === 'string' ? data.LensModel : null,
    focal: typeof focalRaw === 'number' ? `${Math.round(focalRaw)}mm` : null,
    aperture: typeof data.FNumber === 'number' ? `f/${data.FNumber}` : null,
    shutter,
    iso: typeof data.ISO === 'number' ? `ISO ${data.ISO}` : null,
  }
}
