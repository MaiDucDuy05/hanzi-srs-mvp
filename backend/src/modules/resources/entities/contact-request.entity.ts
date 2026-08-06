import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { ContactStatus } from '../../../common/enums/resources.enums';

/** Form liên hệ/tư vấn học (FR-25). */
@Entity('contact_requests')
export class ContactRequest extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', length: 20, default: ContactStatus.NEW })
  status: ContactStatus;
}
