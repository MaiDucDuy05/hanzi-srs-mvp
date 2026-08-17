import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/test.entity';
import { TestQuestion } from './entities/test-question.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { TestAnswer } from './entities/test-answer.entity';
import { TestAssignment } from './entities/test-assignment.entity';
import {
  TestService,
  TestQuestionService,
  TestAttemptService,
  TestAnswerService,
} from './test.service';
import { TestAssignmentService } from './test-assignment.service';
import { TestController, TestQuestionController, TestAttemptController } from './test.controller';
import { TestAssignmentController } from './test-assignment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Test,
      TestQuestion,
      TestAttempt,
      TestAnswer,
      TestAssignment,
    ]),
  ],
  controllers: [
    TestController,
    TestQuestionController,
    TestAttemptController,
    TestAssignmentController,
  ],
  providers: [
    TestService,
    TestQuestionService,
    TestAttemptService,
    TestAnswerService,
    TestAssignmentService,
  ],
  exports: [TestService],
})
export class TestModule {}
