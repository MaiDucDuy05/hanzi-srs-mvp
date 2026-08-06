import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HskLevel } from './entities/hsk-level.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { GrammarPoint } from './entities/grammar-point.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonContent } from './entities/lesson-content.entity';
import { Topic } from './entities/topic.entity';
import { TopicVocabulary } from './entities/topic-vocabulary.entity';
import {
  HskLevelService, VocabularyService, GrammarPointService,
  LessonService, LessonContentService, TopicService, TopicVocabularyService,
} from './curriculum.service';
import {
  HskLevelController, VocabularyController, GrammarPointController,
  LessonController, LessonContentController, TopicController, TopicVocabularyController,
} from './curriculum.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([HskLevel, Vocabulary, GrammarPoint, Lesson, LessonContent, Topic, TopicVocabulary]),
  ],
  controllers: [
    HskLevelController, VocabularyController, GrammarPointController,
    LessonController, LessonContentController, TopicController, TopicVocabularyController,
  ],
  providers: [
    HskLevelService, VocabularyService, GrammarPointService,
    LessonService, LessonContentService, TopicService, TopicVocabularyService,
  ],
  exports: [VocabularyService, GrammarPointService, LessonService, TopicService],
})
export class CurriculumModule {}
