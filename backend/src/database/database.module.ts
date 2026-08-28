import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * DatabaseModule cấu hình TypeORM kết nối PostgreSQL cho NestJS runtime.
 * Config lấy từ .env qua @nestjs/config.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // schema quản lý bằng migration
        logging: false,
        extra: {
          max: 50, // Tăng connection pool size để chịu tải Spike 500 VUs
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
