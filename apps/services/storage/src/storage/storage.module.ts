import { Module } from '@nestjs/common'
import { config } from '../config'
import { LocalProvider } from './local.provider'
import { QiniuProvider } from './qiniu.provider'
import { STORAGE_PROVIDER } from './storage-provider.interface'

@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: () => (config.provider === 'qiniu' ? new QiniuProvider() : new LocalProvider()),
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
