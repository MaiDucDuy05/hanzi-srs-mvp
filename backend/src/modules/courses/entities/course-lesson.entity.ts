import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';

/**
 * Liên kết course ↔ lesson (1 lesson có thể thuộc nhiều course).
 * UNIQUE (course_id, lesson_id) tạo ở migration.
 */
@Entity('course_lessons')
export class CourseLesson extends BaseEntity {
  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
