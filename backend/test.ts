import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function test() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get('SystemConfigController');
  console.log(await service.getConfigs());
  await app.close();
}
test();
