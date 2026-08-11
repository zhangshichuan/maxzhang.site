import { randomUUID } from 'node:crypto'
import { prisma } from '@/src/server/db'
import { deleteObjectsFromStorage, toPublicPhotoUrl, uploadPhotosToStorage } from './storage-client.server'

export interface CreatePhotoWorkInput {
  captionZh: string
  captionEn: string
  location: string
  tags: string[]
  form: FormData
}

/**
 * 创建作品：先把原图交给存储服务加工并入库，成功后写 SQLite。
 * 任一步失败都会尽力清理已上传的云端文件。
 */
export async function createPhotoWork(input: CreatePhotoWorkInput): Promise<{ slug: string }> {
  const captionZh = input.captionZh.trim()
  if (!captionZh) {
    throw new Error('中文图注不能为空')
  }
  if (input.tags.length > 20) {
    throw new Error('标签最多 20 个')
  }

  const uploaded = await uploadPhotosToStorage(input.form)
  if (!uploaded.photos.length) {
    throw new Error('没有可用的照片')
  }

  const firstExif = uploaded.photos[0].exif
  const takenAt = firstExif.takenAt ? new Date(firstExif.takenAt) : new Date()
  const location =
    input.location.trim() ||
    (firstExif.latitude != null && firstExif.longitude != null
      ? `${firstExif.latitude.toFixed(6)}, ${firstExif.longitude.toFixed(6)}`
      : null)
  const slug = `photo-${Date.now().toString(36)}-${randomUUID().slice(0, 6)}`

  try {
    await prisma.photoWork.create({
      data: {
        slug,
        captionZh,
        captionEn: input.captionEn.trim(),
        takenAt,
        location,
        tags: JSON.stringify(input.tags),
        coverIndex: 0,
        photos: {
          create: uploaded.photos.map((photo, index) => ({
            sortIndex: index,
            largeKey: photo.large.key,
            thumbKey: photo.thumb.key,
            largeUrl: toPublicPhotoUrl(photo.large, uploaded.provider),
            thumbUrl: toPublicPhotoUrl(photo.thumb, uploaded.provider),
            width: photo.width,
            height: photo.height,
            camera: photo.exif.camera,
            lens: photo.exif.lens,
            focal: photo.exif.focal,
            aperture: photo.exif.aperture,
            shutter: photo.exif.shutter,
            iso: photo.exif.iso,
          })),
        },
      },
    })
    return { slug }
  } catch (error) {
    await deleteObjectsFromStorage(uploaded.photos.flatMap((photo) => [photo.large.key, photo.thumb.key])).catch(
      () => {},
    )
    throw error
  }
}

/** 删除作品：先删 SQLite（级联照片），再尽力清理云端对象。 */
export async function deletePhotoWork(slug: string): Promise<void> {
  const work = await prisma.photoWork.findUnique({
    where: { slug },
    include: { photos: true },
  })
  if (!work) {
    throw new Error('作品不存在')
  }
  await prisma.photoWork.delete({ where: { slug } })
  await deleteObjectsFromStorage(work.photos.flatMap((photo) => [photo.largeKey, photo.thumbKey])).catch(() => {})
}
