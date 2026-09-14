import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "../../../common/base.entity";
import { TestCategory } from "../../../common/enums/test.enums";
import { TestTemplateSection } from "./test-template-section.entity";

/**
 * Mau de thi chuan HSK.
 * He thong seed san cac template theo cap do HSK (1-6) va loai ky thi.
 * Giao vien chon template, he thong sinh khung de (TestSection rong)
 * roi giao vien tu dien cau hoi vao (Manual) hoac boc ngau nhien (Auto).
 */
@Entity("test_templates")
export class TestTemplate extends BaseEntity {
  /** Phan loai bai kiem tra */
  @Column({ type: "varchar", length: 30 })
  category: TestCategory;

  /** Cap do HSK (1-6). null = khong gan voi HSK cu the. */
  @Column({ name: "hsk_level", type: "int", nullable: true })
  hskLevel: number | null;

  /** Ten mau de. VD: "Kiem tra 15 phut - HSK 3" */
  @Column({ type: "varchar", length: 200 })
  name: string;

  /** Mo ta cau truc de. VD: "40 cau nghe, 30 cau doc, 10 cau viet" */
  @Column({ type: "text", nullable: true })
  description: string | null;

  /** Thoi gian lam bai mac dinh (phut). */
  @Column({ name: "time_limit_minutes", type: "int", default: 0 })
  timeLimitMinutes: number;

  /**
   * Template cua he thong (seed san) - khong cho phep xoa/sua.
   * false = template do giao vien tu tao.
   */
  @Column({ name: "is_system_default", type: "boolean", default: false })
  isSystemDefault: boolean;

  /** ID cua giao vien tao template nay (null neu la system default). */
  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string | null;

  /** Cho phep giao vien khac dung chung template nay. */
  @Column({ name: "is_public", type: "boolean", default: false })
  isPublic: boolean;

  @OneToMany(() => TestTemplateSection, (s) => s.template, { eager: false })
  sections?: TestTemplateSection[];
}
