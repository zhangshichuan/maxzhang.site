/**
 * 存储厂商抽象
 *
 * 所有厂商能力都收敛到这个接口：上传、删除、生成公网 URL。
 * v1 只有七牛适配器；接入 S3 兼容厂商（OSS、R2、MinIO）时新增实现即可。
 */
export interface StoredObject {
  key: string
  url: string
  size: number
  contentType: string
}

export interface PutObjectInput {
  key: string
  data: Buffer
  contentType: string
}

export interface ReadObjectResult {
  data: Buffer
  contentType: string
}

export interface StorageProvider {
  readonly name: string
  putObject(input: PutObjectInput): Promise<StoredObject>
  readObject(key: string): Promise<ReadObjectResult>
  deleteObject(key: string): Promise<void>
  getPublicUrl(key: string): string
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER')
