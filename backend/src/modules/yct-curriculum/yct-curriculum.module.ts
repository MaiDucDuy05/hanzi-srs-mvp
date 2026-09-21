import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YctLevel } from './entities/yct-level.entity';
import { YctLesson } from './entities/yct-lesson.entity';
import { YctVocabulary } from './entities/yct-vocabulary.entity';
import { YctCurriculumService } from './services/yct-curriculum.service';
import { AdminYctService } from './services/admin-yct.service';
import { YctCurriculumController } from './controllers/yct-curriculum.controller';
import { AdminYctController } from './controllers/admin-yct.controller';
import { AdminModule } from '../admin/admin.module';
import { AdminContentModule } from '../admin-content/admin-content.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([YctLevel, YctLesson, YctVocabulary]),
    AdminModule,
    AdminContentModule,
  ],
  controllers: [YctCurriculumController, AdminYctController],
  providers: [YctCurriculumService, AdminYctService],
  exports: [YctCurriculumService, AdminYctService],
})
export class YctCurriculumModule {}
