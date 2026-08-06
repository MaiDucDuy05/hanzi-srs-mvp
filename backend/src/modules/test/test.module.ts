import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/test.entity';
import { TestQuestion } from './entities/test-question.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { TestAnswer } from './entities/test-answer.entity';
import { TestService, TestQuestionService, TestAttemptService, TestAnswerService } from './test.service';
import { TestController, TestQuestionController, TestAttemptController } from './test.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Test, TestQuestion, TestAttempt, TestAnswer])],
  controllers: [TestController, TestQuestionController, TestAttemptController],
  providers: [TestService, TestQuestionService, TestAttemptService, TestAnswerService],
  exports: [TestService],
})
export class TestModule {}
