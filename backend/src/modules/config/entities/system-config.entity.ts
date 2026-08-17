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

  @Column({ type: 'enum', enum: ConfigValueType, default: ConfigValueType.STRING })
  valueType: ConfigValueType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  group: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true, name: 'updatedBy' })
  updatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updatedByUser: User;

  @UpdateDateColumn()
  updatedAt: Date;
}
