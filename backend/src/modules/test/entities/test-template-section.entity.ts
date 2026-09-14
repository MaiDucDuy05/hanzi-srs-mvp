import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../common/base.entity";
import { TestTemplate } from "./test-template.entity";
import { QuestionSkill } from "../../question-bank/entities/question.enums";

/**
 * Cau truc tung phan thi ben trong mot TestTemplate.
 * Khi sinh de tu template, he thong se tao TestSection tuong ung
 * voi so luong cau hoi va ky nang duoc dinh nghia o day.
 */
@Entity("test_template_sections")
export class TestTemplateSection extends BaseEntity {
  @Column({ name: "template_id", type: "uuid" })
  templateId: string;

  @ManyToOne(() => TestTemplate)
  @JoinColumn({ name: "template_id" })
  template: TestTemplate;

  /** Ten phan thi. VD: "Phan 1: Nghe hieu" */
  @Column({ type: "varchar", length: 200 })
  name: string;

  /** Thu tu hien thi. */
  @Column({ name: "order_index", type: "int", default: 0 })
  orderIndex: number;

  /** Ky nang ngon ngu phan thi nay kiem tra. */
  @Column({ name: "target_skill", type: "varchar", length: 20 })
  targetSkill: QuestionSkill;

  /** Tong so cau hoi yeu cau cho phan nay. */
  @Column({ name: "question_count", type: "int" })
  questionCount: number;

  /**
   * So luong cau nhom (Group/Passage) cho phep trong phan nay.
   * 0 = khong co cau nhom (tat ca la cau don le).
   * VD: HSK 4 Phan Doc co the co 5 doan van, moi doan 4 cau.
   */
  @Column({ name: "group_count_allowed", type: "int", default: 0 })
  groupCountAllowed: number;

  /** Diem mac dinh cho moi cau hoi trong phan nay. */
  @Column({ name: "points_per_question", type: "float", default: 1 })
  pointsPerQuestion: number;
}
