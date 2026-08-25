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
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Cache preflight for 24 hours
  });
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true }),
  );

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
