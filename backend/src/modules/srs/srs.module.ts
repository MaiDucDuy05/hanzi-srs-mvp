/**
 * SrsModule — SRS spaced-repetition endpoints.
 * Imports CurriculumModule để truy cập LessonContent + Vocabulary repos qua re-export.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { UserVocabularyProgress } from './entities/user-vocabulary-progress.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { SrsController } from './srs.controller';
import { SrsService } from './srs.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserVocabularyProgress, LessonContent, Vocabulary, TopicVocabulary]),
    CurriculumModule,
  ],
  controllers: [SrsController],
  providers: [SrsService],
  exports: [SrsService],
})
export class SrsModule {}
