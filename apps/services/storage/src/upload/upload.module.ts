import { Module } from '@nestjs/common'
import { HealthController } from '../health/health.controller'
import { ImageService } from '../images/image.service'
import { StorageModule } from '../storage/storage.module'
import { UploadController } from './upload.controller'

@Module({
  imports: [StorageModule],
  controllers: [UploadController, HealthController],
  providers: [ImageService],
})
export class UploadModule {}
