import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { ConfigCacheService } from './config-cache.service';
import { SystemConfigController } from './system-config.controller';
import { MaintenanceMiddleware } from './maintenance.middleware';
import { AdminModule } from '../admin/admin.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig]),
    AdminModule,
  ],
  controllers: [SystemConfigController],
  providers: [ConfigCacheService],
  exports: [ConfigCacheService],
})
export class SystemConfigModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MaintenanceMiddleware)
      .forRoutes('*');
  }
}
