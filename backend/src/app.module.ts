import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
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
import { AudioModule } from './modules/audio/audio.module';
import { AdminModule } from './modules/admin/admin.module';
import { SrsModule } from './modules/srs/srs.module';
import { LessonSelectionModule } from './modules/lesson-selection/lesson-selection.module';
import { StudentModule } from './modules/student/student.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { AdminContentModule } from './modules/admin-content/admin-content.module';
import { SystemConfigModule } from './modules/config/config.module';
import { QuestionBankModule } from './modules/question-bank/question-bank.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000, // 1 minute
            limit: 10000, // Very high limit for dev
          },
          {
            name: 'auth',
            ttl: 60000, // 1 minute
            limit: 1000, // High limit for auth
          },
        ],
      }),
    }),
    DatabaseModule,
    AuthModule,
    CurriculumModule,
    CoursesModule,
    PracticeModule,
    TestModule,
    SubscriptionModule,
    ResourcesModule,
    AudioModule,
    AdminModule,
    SrsModule,
    LessonSelectionModule,
    StudentModule,
    AchievementsModule,
    AdminContentModule,
    SystemConfigModule,
    QuestionBankModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
