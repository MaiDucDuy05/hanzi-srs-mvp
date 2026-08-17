import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Course } from './course.entity';
import { Lesson } from '../../curriculum/entities/lesson.entity';

/**
 * Liên kết course ↔ lesson (1 lesson có thể thuộc nhiều course).
 * UNIQUE (course_id, lesson_id) tạo ở migration.
 */
@Entity('course_lessons')
@Unique(['courseId', 'lessonId'])
export class CourseLesson extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
