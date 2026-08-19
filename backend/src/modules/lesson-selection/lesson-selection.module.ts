import { Module } from '@nestjs/common';
import { LessonSelectionService } from './lesson-selection.service';
import { LessonSelectionController } from './lesson-selection.controller';
import { CurriculumModule } from '../curriculum/curriculum.module';
import { ResourcesModule } from '../resources/resources.module';

@Module({
  imports: [CurriculumModule, ResourcesModule],
  controllers: [LessonSelectionController],
  providers: [LessonSelectionService],
})
export class LessonSelectionModule {}
