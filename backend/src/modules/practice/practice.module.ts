import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { PracticeQuestionService, PracticeAttemptService } from './practice.service';
import { PracticeQuestionController, PracticeAttemptController } from './practice.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PracticeQuestion, PracticeAttempt])],
  controllers: [PracticeQuestionController, PracticeAttemptController],
  providers: [PracticeQuestionService, PracticeAttemptService],
  exports: [PracticeAttemptService],
})
export class PracticeModule {}
