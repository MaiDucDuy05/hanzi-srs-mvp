import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import {
  PracticeQuestionService,
  PracticeAttemptService,
} from './practice.service';
import {
  PracticeQuestionController,
  PracticeAttemptController,
} from './practice.controller';
import { HanziWritingController } from './hanzi-writing.controller';
import { SentenceOrderingController } from './sentence-ordering.controller';
import { SentenceOrderingService } from './sentence-ordering.service';
import { GradingService } from './grading.service';
import { HanziWritingService } from './hanzi-writing.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PracticeQuestion, PracticeAttempt, TopicVocabulary, LessonContent]),
    SubscriptionModule,
  ],
  controllers: [
    PracticeQuestionController,
    PracticeAttemptController,
    SentenceOrderingController,
    HanziWritingController,
  ],
  providers: [
    PracticeQuestionService,
    PracticeAttemptService,
    SentenceOrderingService,
    GradingService,
    HanziWritingService,
  ],
  exports: [PracticeAttemptService, SentenceOrderingService, GradingService, HanziWritingService],
})
export class PracticeModule {}
