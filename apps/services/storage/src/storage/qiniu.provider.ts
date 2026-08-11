import { Injectable, Logger } from '@nestjs/common'
import { createHmac, randomUUID } from 'node:crypto'
import { config } from '../config'
import type { PutObjectInput, ReadObjectResult, StorageProvider, StoredObject } from './storage-provider.interface'

/**
 * 七牛 Kodo 适配器
 *
 * 直接基于七牛 REST API（form upload / RS delete）实现，不依赖官方 SDK，
 * 便于保持 Provider 接口最小化。上传走公网上传域名，删除走 RS API。
 */
@Injectable()
export class QiniuProvider implements StorageProvider {
  readonly name = 'qiniu'

  private readonly logger = new Logger(QiniuProvider.name)

  getPublicUrl(key: string): string {
    return `${config.qiniu.domain.replace(/\/$/, '')}/${key}`
  }

  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const policy = {
      scope: `${config.qiniu.bucket}:${input.key}`,
      deadline: Math.floor(Date.now() / 1000) + 3600,
      fsizeLimit: config.maxPhotoBytes,
    }
    const form = new FormData()
    form.append('token', this.uploadToken(policy))
    form.append('key', input.key)
    form.append('file', new Blob([input.data], { type: input.contentType }), input.key)

    const response = await fetch(`${config.qiniu.uploadHost}/`, {
      method: 'POST',
      body: form,
    })
    if (!response.ok) {
      const body = await response.text()
      throw new Error(`qiniu upload failed: ${response.status} ${body.slice(0, 300)}`)
    }

    return {
      key: input.key,
      url: this.getPublicUrl(input.key),
      size: input.data.length,
      contentType: input.contentType,
    }
  }

  async deleteObject(key: string): Promise<void> {
    const entry = urlsafeBase64(`${config.qiniu.bucket}:${key}`)
    const path = `/delete/${entry}`
    const sign = urlsafeBase64(hmacSha1(path, config.qiniu.secretKey))
    const response = await fetch(`${config.qiniu.rsHost}${path}`, {
      method: 'DELETE',
      headers: { Authorization: `QBox ${config.qiniu.accessKey}:${sign}` },
    })
    // 612 = 文件不存在，视为删除成功
    if (!response.ok && response.status !== 612) {
      const body = await response.text()
      throw new Error(`qiniu delete failed: ${response.status} ${body.slice(0, 300)}`)
    }
  }

  async readObject(key: string): Promise<ReadObjectResult> {
    const response = await fetch(this.getPublicUrl(key))
    if (!response.ok) {
      throw new Error(`qiniu read failed: ${response.status}`)
    }
    return {
      data: Buffer.from(await response.arrayBuffer()),
      contentType: response.headers.get('content-type') ?? 'application/octet-stream',
    }
  }

  /**
   * 生成七牛上传凭证（uptoken）
   *
   * token = ak:sign(base64url(policy))，sign 为对 base64url(policy)
   * 做 HMAC-SHA1 后再 base64url 编码的结果。
   */
  private uploadToken(policy: Record<string, unknown>): string {
    const encodedPolicy = urlsafeBase64(JSON.stringify(policy))
    const sign = urlsafeBase64(hmacSha1(encodedPolicy, config.qiniu.secretKey))
    return `${config.qiniu.accessKey}:${sign}:${encodedPolicy}`
  }
}

function urlsafeBase64(input: string | Buffer): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function hmacSha1(data: string, secret: string): Buffer {
  return createHmac('sha1', secret).update(data, 'utf8').digest()
}

/** 便于测试：随机 key 前缀生成 */
export function newObjectPrefix(scope: string): string {
  return `${scope}/${randomUUID()}`
}
