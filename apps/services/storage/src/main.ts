import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { config } from './config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(config.port, '0.0.0.0')
  console.log(`[storage] listening on :${config.port}`)
}

void bootstrap()
