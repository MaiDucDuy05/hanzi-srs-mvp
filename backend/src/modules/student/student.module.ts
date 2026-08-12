import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { AuthModule } from '../auth/auth.module';
import { PracticeModule } from '../practice/practice.module';
import { StudentProgressService } from './student-progress.service';
import { StudentProgressController } from './student-progress.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, PracticeAttempt]),
    AuthModule,
    PracticeModule,
  ],
  controllers: [StudentProgressController],
  providers: [StudentProgressService],
})
export class StudentModule {}
