import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/base.entity";
import { Test } from "./test.entity";
import { QuestionSkill } from "../../question-bank/entities/question.enums";

/**
 * Phan thi (Section) ben trong mot Bai thi (Test).
 * Vi du: Phan 1 - Nghe hieu, Phan 2 - Doc hieu, Phan 3 - Viet.
 */
@Entity("test_sections")
export class TestSection extends BaseEntity {
  @Column({ name: "test_id", type: "uuid" })
  testId: string;

  @ManyToOne(() => Test)
  @JoinColumn({ name: "test_id" })
  test: Test;

  @Column({ type: "varchar", length: 200 })
  name: string;

  @Column({ type: "text", nullable: true })
  instruction: string | null;

  @Column({ name: "order_index", type: "int", default: 0 })
  orderIndex: number;

  @Column({ name: "target_skill", type: "varchar", length: 20, nullable: true })
  targetSkill: QuestionSkill | null;

  /** So luong cau hoi yeu cau theo Template. null = Custom, khong gioi han. */
  @Column({ name: "required_question_count", type: "int", nullable: true })
  requiredQuestionCount: number | null;
}
