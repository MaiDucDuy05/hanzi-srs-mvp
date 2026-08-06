import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseLesson } from './entities/course-lesson.entity';
import { CourseService, CourseLessonService } from './courses.service';
import { CourseController, CourseLessonController } from './courses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Course, CourseLesson])],
  controllers: [CourseController, CourseLessonController],
  providers: [CourseService, CourseLessonService],
  exports: [CourseService],
})
export class CoursesModule {}
