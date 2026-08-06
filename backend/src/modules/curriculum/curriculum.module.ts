import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HskLevel } from './entities/hsk-level.entity';
import { Vocabulary } from './entities/vocabulary.entity';
import { GrammarPoint } from './entities/grammar-point.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonContent } from './entities/lesson-content.entity';
import { Topic } from './entities/topic.entity';
import { TopicVocabulary } from './entities/topic-vocabulary.entity';
import { HskLevelService } from './hsk-level.service';
import { VocabularyService } from './vocabulary.service';
import { GrammarPointService } from './grammar-point.service';
import { LessonService } from './lesson.service';
import { LessonContentService } from './lesson-content.service';
import { TopicService } from './topic.service';
import { TopicVocabularyService } from './topic-vocabulary.service';
import { HskLevelController } from './hsk-level.controller';
import { VocabularyController } from './vocabulary.controller';
import { GrammarPointController } from './grammar-point.controller';
import { LessonController } from './lesson.controller';
import { LessonContentController } from './lesson-content.controller';
import { TopicController } from './topic.controller';
import { TopicVocabularyController } from './topic-vocabulary.controller';

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
