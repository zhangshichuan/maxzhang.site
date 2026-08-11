/**
 * 存储服务配置
 *
 * 全部来自环境变量，不读取 .env（由上层 dev 脚本 / docker-compose 注入）。
 */
export const config = {
  port: Number(process.env.PORT ?? 9001),
  apiKey: process.env.STORAGE_API_KEY ?? '',
  maxPhotosPerWork: Number(process.env.MAX_PHOTOS_PER_WORK ?? 10),
  maxPhotoBytes: Number(process.env.MAX_PHOTO_BYTES ?? 50 * 1024 * 1024),
  provider: process.env.STORAGE_PROVIDER ?? 'local',
  photosDir: process.env.PHOTOS_DIR ?? `${process.cwd()}/data/photos`,
  publicBaseUrl: process.env.STORAGE_PUBLIC_BASE_URL ?? 'http://localhost:9001/files',
  qiniu: {
    accessKey: process.env.QINIU_ACCESS_KEY ?? '',
    secretKey: process.env.QINIU_SECRET_KEY ?? '',
    bucket: process.env.QINIU_BUCKET ?? '',
    domain: process.env.QINIU_DOMAIN ?? '',
    uploadHost: process.env.QINIU_UPLOAD_HOST ?? 'https://upload.qiniup.com',
    rsHost: process.env.QINIU_RS_HOST ?? 'https://rs.qiniu.com',
  },
}
