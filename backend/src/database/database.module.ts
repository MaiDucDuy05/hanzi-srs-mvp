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
          max: 30, // Giữ an toàn dưới 100 (giới hạn của infra), nhường chỗ cho zombies/admin.
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
