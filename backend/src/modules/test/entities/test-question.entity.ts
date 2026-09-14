import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/base.entity";
import { TestSection } from "./test-section.entity";
import { Question } from "../../question-bank/entities/question.entity";

/**
 * Bang trung gian lien ket giua Section cua De thi va cau hoi trong Ngan hang.
 * Mot cau hoi luon phai nam trong mot TestSection cu the.
 */
@Entity("test_questions")
export class TestQuestion extends BaseEntity {
  /** FK -> test_sections.id (thay the test_id cu) */
  @Column({ name: "section_id", type: "uuid", nullable: true })
  sectionId: string | null;

  @ManyToOne(() => TestSection)
  @JoinColumn({ name: "section_id" })
  section: TestSection;

  /** Giu lai test_id de backward-compatible voi query hien tai */
  @Column({ name: "test_id", type: "uuid", nullable: true })
  testId: string | null;

  @Column({ name: "question_id", type: "uuid" })
  questionId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: "question_id" })
  question: Question;

  @Column({ type: "int", default: 1 })
  points: number;

  @Column({ name: "display_order", type: "int", default: 0 })
  displayOrder: number;
}
