import { Injectable, Logger } from '@nestjs/common'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { config } from '../config'
import type { PutObjectInput, ReadObjectResult, StorageProvider, StoredObject } from './storage-provider.interface'

/**
 * 服务器本地磁盘适配器
 *
 * 写入 PHOTOS_DIR（docker-compose 中为共享卷 photos_data）。
 * 只保存加工后的展示副本，原图在加工后即被丢弃。
 * 适合免备案起步；七牛适配器保留，备案就绪后可切换。
 */
@Injectable()
export class LocalProvider implements StorageProvider {
  readonly name = 'local'

  private readonly logger = new Logger(LocalProvider.name)

  private resolve(key: string): string {
    const root = path.resolve(config.photosDir)
    const full = path.resolve(root, key)
    if (!full.startsWith(`${root}${path.sep}`)) {
      throw new Error('invalid object key')
    }
    return full
  }

  getPublicUrl(key: string): string {
    return `${config.publicBaseUrl.replace(/\/$/, '')}/${key}`
  }

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const target = this.resolve(input.key)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, input.data)
    return {
      key: input.key,
      url: this.getPublicUrl(input.key),
      size: input.data.length,
      contentType: input.contentType,
    }
  }

  async readObject(key: string): Promise<ReadObjectResult> {
    const data = await readFile(this.resolve(key))
    return { data, contentType: contentTypeOf(key) }
  }

  async deleteObject(key: string): Promise<void> {
    await rm(this.resolve(key), { force: true })
  }
}

function contentTypeOf(key: string): string {
  if (key.endsWith('.webp')) return 'image/webp'
  if (key.endsWith('.jpg') || key.endsWith('.jpeg')) return 'image/jpeg'
  if (key.endsWith('.png')) return 'image/png'
  return 'application/octet-stream'
}
