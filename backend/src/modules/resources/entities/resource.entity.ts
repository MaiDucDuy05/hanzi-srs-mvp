import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ContentStatus } from '../../../common/enums/curriculum.enums';
import { ResourceTier } from '../../../common/enums/resources.enums';

/** Tài liệu tham khảo (PPT...) trong thư viện (FR-24). file_key trỏ S3. */
@Entity('resources')
export class Resource extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'file_key', type: 'varchar', length: 255 })
  fileKey: string;

  @Column({ name: 'file_size', type: 'int', default: 0 })
  fileSize: number;

  @Column({ type: 'varchar', length: 10, default: ResourceTier.FREE })
  tier: ResourceTier;

  @Column({ name: 'uploader_id', type: 'uuid' })
  uploaderId: string;

  @Column({ type: 'varchar', length: 20, default: ContentStatus.DRAFT })
  status: ContentStatus;

  @Column({ name: 'hidden_by_admin', type: 'boolean', default: false })
  hiddenByAdmin: boolean;

  @Column({ name: 'hide_reason', type: 'text', nullable: true })
  hideReason: string | null;

  @Column({ name: 'hidden_at', type: 'timestamptz', nullable: true })
  hiddenAt: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
