import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HskLevel } from '../curriculum/entities/hsk-level.entity';
import { Lesson } from '../curriculum/entities/lesson.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';
import { GrammarPoint } from '../curriculum/entities/grammar-point.entity';
import { Topic } from '../curriculum/entities/topic.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { PracticeQuestion } from '../practice/entities/practice-question.entity';
import { AdminModule } from '../admin/admin.module';

import { AdminCoursesController } from './controllers/admin-courses.controller';
import { AdminLessonsController } from './controllers/admin-lessons.controller';
import { AdminVocabulariesController } from './controllers/admin-vocabularies.controller';
import { AdminGrammarsController } from './controllers/admin-grammars.controller';
import { AdminTopicsController } from './controllers/admin-topics.controller';
import { AdminQuestionsController } from './controllers/admin-questions.controller';
import { AdminUploadsController } from './controllers/admin-uploads.controller';
import { AdminTeacherContentController } from './controllers/admin-teacher-content.controller';

import { AdminCoursesService } from './services/admin-courses.service';
import { AdminLessonsService } from './services/admin-lessons.service';
import { AdminVocabulariesService } from './services/admin-vocabularies.service';
import { AdminGrammarsService } from './services/admin-grammars.service';
import { AdminTopicsService } from './services/admin-topics.service';
import { AdminQuestionsService } from './services/admin-questions.service';
import { S3UploadService } from './services/s3-upload.service';
import { CsvImportService } from './services/csv-import.service';
import { AdminTeacherContentService } from './services/admin-teacher-content.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HskLevel,
      Lesson,
      Vocabulary,
      GrammarPoint,
      Topic,
      TopicVocabulary,
      PracticeQuestion,
    ]),
    AdminModule, // To use AuditLogService
  ],
  controllers: [
    AdminCoursesController,
    AdminLessonsController,
    AdminVocabulariesController,
    AdminGrammarsController,
    AdminTopicsController,
    AdminQuestionsController,
    AdminUploadsController,
    AdminTeacherContentController,
  ],
  providers: [
    AdminCoursesService,
    AdminLessonsService,
    AdminVocabulariesService,
    AdminGrammarsService,
    AdminTopicsService,
    AdminQuestionsService,
    S3UploadService,
    CsvImportService,
    AdminTeacherContentService,
  ],
})
export class AdminContentModule {}
