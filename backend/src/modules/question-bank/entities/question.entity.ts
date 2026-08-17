import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base.entity';
import { TestQuestionType } from '../../../common/enums/test.enums';
import { User } from '../../auth/entities/user.entity';

export enum QuestionVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum QuestionDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

@Entity('questions')
export class Question extends BaseEntity {
  @Column({ name: 'creator_id', type: 'uuid' })
  creatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ type: 'varchar', length: 20 })
  type: TestQuestionType;

  @Column({ type: 'varchar', length: 20, default: QuestionVisibility.PRIVATE })
  visibility: QuestionVisibility;

  @Column({ name: 'hsk_level', type: 'int', nullable: true })
  hskLevel: number | null;

  @Column({ name: 'lesson_id', type: 'uuid', nullable: true })
  lessonId: string | null;

  @Column({ type: 'varchar', length: 20, default: QuestionDifficulty.MEDIUM })
  difficulty: QuestionDifficulty;

  @Column({ type: 'jsonb' })
  content: Record<string, unknown>;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[] | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
