import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import {
  Audience,
  ContentStatus,
} from '../../../common/enums/curriculum.enums';

/**
 * Course — lộ trình học chia theo đối tượng người lớn / trẻ em.
 * Lesson được gắn vào course qua bảng course_lessons (1 lesson có thể thuộc nhiều course).
 */
@Entity('courses')
export class Course extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'thumbnail_key', type: 'varchar', length: 255, nullable: true })
  thumbnailKey: string | null;

  @Column({ type: 'varchar', length: 10 })
  audience: Audience;

  @Column({ type: 'varchar', length: 20, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
