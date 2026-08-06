import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
