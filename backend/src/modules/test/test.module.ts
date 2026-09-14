import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Test } from './entities/test.entity';
import { TestQuestion } from './entities/test-question.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { TestAnswer } from './entities/test-answer.entity';
import { TestAssignment } from './entities/test-assignment.entity';
import { TestSection } from './entities/test-section.entity';
import { TestTemplate } from './entities/test-template.entity';
import { TestTemplateSection } from './entities/test-template-section.entity';
import {
  TestService,
  TestQuestionService,
  TestAttemptService,
  TestAnswerService,
} from './test.service';
import { TestAssignmentService } from './test-assignment.service';
import { TestTemplateService } from './test-template.service';
import { TestController, TestQuestionController, TestAttemptController } from './test.controller';
import { TestAssignmentController } from './test-assignment.controller';
import { TestTemplateController, TestSectionController, TestValidateController } from './test-template.controller';
import { Question } from '../question-bank/entities/question.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Test,
      TestQuestion,
      TestAttempt,
      TestAnswer,
      TestAssignment,
      TestSection,
      TestTemplate,
      TestTemplateSection,
      Question,
    ]),
  ],
  controllers: [
    TestController,
    TestQuestionController,
    TestAttemptController,
    TestAssignmentController,
    TestTemplateController,
    TestSectionController,
    TestValidateController,
  ],
  providers: [
    TestService,
    TestQuestionService,
    TestAttemptService,
    TestAnswerService,
    TestAssignmentService,
    TestTemplateService,
  ],
  exports: [TestService],
})
export class TestModule {}
