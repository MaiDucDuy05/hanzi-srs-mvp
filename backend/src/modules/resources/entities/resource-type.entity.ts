import { Column, Entity, OneToMany, Index, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Resource } from './resource.entity';

/** Phân loại giáo trình / tài liệu trong Thư viện Toàn cầu (Global Library). */
@Entity('resource_types')
export class ResourceType extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Index('idx_resource_types_code', { unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => Resource, (resource) => resource.resourceType)
  resources: Resource[];
}
