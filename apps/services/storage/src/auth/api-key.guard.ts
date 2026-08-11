import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'
import { config } from '../config'

/**
 * 服务间鉴权守卫
 *
 * Web 端调用时必须携带 x-storage-key；本地开发未配置 key 时放行，
 * 方便只跑图片加工链路联调。
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!config.apiKey) return true
    const request = context.switchToHttp().getRequest<Request>()
    if (request.header('x-storage-key') !== config.apiKey) {
      throw new UnauthorizedException('invalid storage api key')
    }
    return true
  }
}
