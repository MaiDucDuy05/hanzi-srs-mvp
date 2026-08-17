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
import { FillBlankController } from './fill-blank.controller';
import { FillBlankService } from './fill-blank.service';
import { GradingService } from './grading.service';
import { HanziWritingService } from './hanzi-writing.service';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { ResourcesModule } from '../resources/resources.module';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PracticeQuestion, PracticeAttempt, TopicVocabulary, LessonContent, Vocabulary]),
    SubscriptionModule,
    AchievementsModule,
    ResourcesModule,
  ],
  controllers: [
    PracticeQuestionController,
    PracticeAttemptController,
    SentenceOrderingController,
    FillBlankController,
    HanziWritingController,
  ],
  providers: [
    PracticeQuestionService,
    PracticeAttemptService,
    SentenceOrderingService,
    FillBlankService,
    GradingService,
    HanziWritingService,
  ],
  exports: [PracticeAttemptService, SentenceOrderingService, FillBlankService, GradingService, HanziWritingService],
})
export class PracticeModule {}
