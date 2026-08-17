import { Column, Entity, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ContentType } from '../../../common/enums/curriculum.enums';
import { Lesson } from './lesson.entity';

/**
 * Liên kết polymorphic bài học ↔ từ vựng/ngữ pháp (FR-01).
 * content_type = VOCABULARY | GRAMMAR, content_id = id bảng tương ứng.
 * UNIQUE (lesson_id, content_type, content_id) tạo ở migration.
 */
@Entity('lesson_contents')
@Unique(['lessonId', 'contentType', 'contentId'])
export class LessonContent extends BaseEntity {
  @Column({ name: 'lesson_id', type: 'uuid' })
  lessonId: string;

  @ManyToOne(() => Lesson)
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @Column({ name: 'content_type', type: 'varchar', length: 20 })
  contentType: ContentType;

  @Column({ name: 'content_id', type: 'uuid' })
  contentId: string;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;
}
