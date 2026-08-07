import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Auth qua HttpOnly cookie (access_token) — cần credentials: true khi FE gọi
  // cross-origin (NEXT_PUBLIC_API_URL trỏ host khác). Mặc định dev: FE proxy
  // /api/v1 qua Next rewrite nên là same-origin, cookie tự gửi.
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
