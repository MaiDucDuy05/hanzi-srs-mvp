import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { Role, UserStatus } from '../../../common/enums/user.enums';

/**
 * Bảng users — tài khoản người dùng (Free/Teacher/Admin).
 * VIP là trạng thái gói ở bảng subscriptions, không phải role.
 * Email unique và case-insensitive (index trên LOWER(email)).
 */
@Entity('users')
export class User extends BaseEntity {
  @Index('idx_users_email_unique', { unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 20, default: Role.FREE })
  role: Role;

  @Column({ type: 'varchar', length: 20, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
