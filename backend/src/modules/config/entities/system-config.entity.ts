import { Entity, PrimaryColumn, Column, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum ConfigValueType {
  INT = 'INT',
  STRING = 'STRING',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export enum ConfigGroup {
  LIMITS = 'limits',
  GAMIFICATION = 'gamification',
  AI = 'ai',
  COMMERCE = 'commerce',
  FEATURES = 'features',
  SYSTEM = 'system',
}

@Entity('system_configs')
export class SystemConfig {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  /** varchar thay vì enum để dễ migrate (quy ước project). */
  @Column({ name: 'valueType', type: 'varchar', length: 20, default: ConfigValueType.STRING })
  valueType: ConfigValueType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  group: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'updatedBy', type: 'uuid', nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User | null;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
