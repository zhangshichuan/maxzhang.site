import { Controller, Get, Inject } from '@nestjs/common'
import { STORAGE_PROVIDER, type StorageProvider } from '../storage/storage-provider.interface'

/** 公开健康检查：供 Docker healthcheck / dev 脚本探测，不要求 API key。 */
@Controller()
export class HealthController {
  constructor(@Inject(STORAGE_PROVIDER) private readonly provider: StorageProvider) {}

  @Get('healthz')
  health() {
    return { ok: true, provider: this.provider.name }
  }
}
