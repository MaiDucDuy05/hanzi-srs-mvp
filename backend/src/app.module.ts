import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { CoursesModule } from './modules/courses/courses.module';
import { PracticeModule } from './modules/practice/practice.module';
import { TestModule } from './modules/test/test.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { ResourcesModule } from './modules/resources/resources.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    CurriculumModule,
    CoursesModule,
    PracticeModule,
    TestModule,
    SubscriptionModule,
    ResourcesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
