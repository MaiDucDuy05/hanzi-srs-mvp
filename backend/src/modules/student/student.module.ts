import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { PracticeAttempt } from '../practice/entities/practice-attempt.entity';
import { Lesson } from '../curriculum/entities/lesson.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { UserVocabularyProgress } from '../srs/entities/user-vocabulary-progress.entity';
import { AuthModule } from '../auth/auth.module';
import { PracticeModule } from '../practice/practice.module';
import { StudentProgressService } from './student-progress.service';
import { StudentProgressController } from './student-progress.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PracticeAttempt,
      Lesson,
      LessonContent,
      UserVocabularyProgress,
    ]),
    AuthModule,
    PracticeModule,
  ],
  controllers: [StudentProgressController],
  providers: [StudentProgressService],
})
export class StudentModule {}
