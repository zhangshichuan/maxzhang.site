import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { randomUUID } from 'node:crypto'
import { config } from '../config'
import { ApiKeyGuard } from '../auth/api-key.guard'
import { ImageService, type PhotoExif } from '../images/image.service'
import { STORAGE_PROVIDER, type StorageProvider, type StoredObject } from '../storage/storage-provider.interface'

interface UploadedPhotoResult {
  large: StoredObject
  thumb: StoredObject
  width: number
  height: number
  exif: PhotoExif
}

@Controller()
@UseGuards(ApiKeyGuard)
export class UploadController {
  constructor(
    @Inject(ImageService) private readonly imageService: ImageService,
    @Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider,
  ) {}

  /**
   * 接收 1～N 张原图，加工并写入对象存储，返回每个文件的展示副本与 EXIF 摘要。
   * 失败时尽力清理已写入的对象，避免留下孤儿文件。
   */
  @Post('uploads')
  @UseInterceptors(
    FilesInterceptor('files', config.maxPhotosPerWork, {
      limits: { fileSize: config.maxPhotoBytes },
    }),
  )
  async upload(@Body() _body: unknown, @UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) {
      throw new BadRequestException('no files uploaded')
    }

    const prefix = `photos/${randomUUID()}`
    const uploaded: StoredObject[] = []
    const results: UploadedPhotoResult[] = []

    try {
      for (const [index, file] of files.entries()) {
        const processed = await this.imageService.processPhoto(file.buffer)
        const baseKey = `${prefix}/${index}`
        const [large, thumb] = await Promise.all([
          this.provider.putObject({ key: `${baseKey}-large.webp`, data: processed.large, contentType: 'image/webp' }),
          this.provider.putObject({ key: `${baseKey}-thumb.webp`, data: processed.thumb, contentType: 'image/webp' }),
        ])
        uploaded.push(large, thumb)
        results.push({ large, thumb, width: processed.width, height: processed.height, exif: processed.exif })
      }
      return { provider: this.provider.name, photos: results }
    } catch (error) {
      await this.cleanup(uploaded)
      throw new InternalServerErrorException(error instanceof Error ? error.message : 'upload failed')
    }
  }

  /** 读取展示副本（供 Web 端同源代理 / 健康检查使用），按 key 白名单防路径穿越。 */
  @Get('files/:key')
  async readFile(@Param('key') key: string) {
    if (!/^photos\/[a-zA-Z0-9-]+\/\d+-(large|thumb)\.webp$/.test(key)) {
      throw new NotFoundException('object not found')
    }
    try {
      const object = await this.provider.readObject(key)
      return new StreamableFile(object.data, {
        type: object.contentType,
        disposition: undefined,
      })
    } catch {
      throw new NotFoundException('object not found')
    }
  }

  /** 删除一组对象，供 Web 端删除作品时清理云端文件。 */
  @Delete('objects')
  async deleteObjects(@Body() body: { keys: string[] }) {
    const keys = Array.isArray(body?.keys) ? body.keys : []
    await Promise.allSettled(keys.map((key) => this.provider.deleteObject(key)))
    return { deleted: keys.length }
  }

  private async cleanup(objects: StoredObject[]): Promise<void> {
    await Promise.allSettled(objects.map((object) => this.provider.deleteObject(object.key)))
  }
}
