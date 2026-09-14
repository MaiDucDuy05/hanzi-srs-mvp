import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TestTemplate } from "./entities/test-template.entity";
import { TestTemplateSection } from "./entities/test-template-section.entity";
import { TestSection } from "./entities/test-section.entity";
import { Test } from "./entities/test.entity";
import { TestQuestion } from "./entities/test-question.entity";
import { Question } from "../question-bank/entities/question.entity";
import { TestCategory } from "../../common/enums/test.enums";
import { QuestionSkill } from "../question-bank/entities/question.enums";
import { paginatedResult } from "../../common/helpers/query-helpers";

@Injectable()
export class TestTemplateService {
  constructor(
    @InjectRepository(TestTemplate) private templateRepo: Repository<TestTemplate>,
    @InjectRepository(TestTemplateSection) private templateSectionRepo: Repository<TestTemplateSection>,
    @InjectRepository(TestSection) private sectionRepo: Repository<TestSection>,
    @InjectRepository(Test) private testRepo: Repository<Test>,
    @InjectRepository(TestQuestion) private testQuestionRepo: Repository<TestQuestion>,
    @InjectRepository(Question) private questionRepo: Repository<Question>,
  ) {}

  /** Lay danh sach template co the filter theo hsk_level, category */
  async listTemplates(params: { hskLevel?: number; category?: string; page?: number; limit?: number }) {
    const { hskLevel, category, page = 1, limit = 50 } = params;
    const qb = this.templateRepo.createQueryBuilder("t")
      .leftJoinAndSelect("t.sections", "s")
      .orderBy("t.hskLevel", "ASC")
      .addOrderBy("t.category", "ASC");
    if (hskLevel) qb.andWhere("t.hskLevel = :hskLevel", { hskLevel });
    if (category) qb.andWhere("t.category = :category", { category });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return paginatedResult(data, total, page, limit);
  }

  /** Lay chi tiet 1 template kem sections */
  async getTemplate(id: string) {
    const t = await this.templateRepo.findOne({ where: { id } as any, relations: ["sections"] });
    if (!t) throw new NotFoundException("Template not found");
    t.sections?.sort((a, b) => a.orderIndex - b.orderIndex);
    return t;
  }

  /**
   * Tao bai test moi tu template:
   * - Tao Test record voi category va template_id.
   * - Tao cac TestSection tuong ung voi TestTemplateSection.
   * - Tra ve Test kem sections (rong - giao vien tu dien sau).
   */
  async createTestFromTemplate(templateId: string, teacherId: string, options?: { name?: string }) {
    const template = await this.getTemplate(templateId);

    // Tao Test
    const test = this.testRepo.create({
      teacherId,
      name: options?.name || template.name,
      description: template.description,
      timeLimitMinutes: template.timeLimitMinutes,
      hskLevel: template.hskLevel,
      category: template.category as TestCategory,
      templateId: template.id,
      status: "DRAFT" as any,
    });
    const savedTest = await this.testRepo.save(test);

    // Tao TestSection tuong ung voi template
    const sections: TestSection[] = [];
    for (const ts of template.sections ?? []) {
      const section = this.sectionRepo.create({
        testId: savedTest.id,
        name: ts.name,
        orderIndex: ts.orderIndex,
        targetSkill: ts.targetSkill as QuestionSkill,
        requiredQuestionCount: ts.questionCount,
      });
      sections.push(await this.sectionRepo.save(section));
    }
    return { test: savedTest, sections };
  }

  /** Lay danh sach sections cua 1 test */
  async getTestSections(testId: string) {
    return this.sectionRepo.find({
      where: { testId } as any,
      order: { orderIndex: "ASC" },
    });
  }

  /**
   * Auto-generate: boc ngau nhien cau hoi tu ngân hang vao 1 section.
   * Lay cau hoi co skill tuong ung va hsk_level tuong ung.
   */
  async autoGenerateSection(sectionId: string, teacherId: string) {
    const section = await this.sectionRepo.findOne({ where: { id: sectionId } as any });
    if (!section) throw new NotFoundException("Section not found");
    if (!section.requiredQuestionCount) throw new BadRequestException("Section has no required question count");
    if (!section.targetSkill) throw new BadRequestException("Section has no target skill defined");

    const test = await this.testRepo.findOne({ where: { id: section.testId } as any });
    if (!test) throw new NotFoundException("Test not found");
    if (test.teacherId !== teacherId) throw new BadRequestException("Not authorized");

    // Xoa cau hoi cu trong section nay (neu co)
    await this.testQuestionRepo.delete({ sectionId: sectionId } as any);

    // Boc ngau nhien cau hoi phu hop
    const qb = this.questionRepo.createQueryBuilder("q")
      .where("q.skill = :skill", { skill: section.targetSkill })
      .andWhere("q.isActive = true")
      .andWhere("q.parentId IS NULL"); // Chi lay cau goc (khong lay cau con)

    if (test.hskLevel) qb.andWhere("q.hskLevel = :level", { level: test.hskLevel });

    qb.orderBy("RANDOM()").take(section.requiredQuestionCount);
    const questions = await qb.getMany();

    if (questions.length === 0) {
      throw new BadRequestException(`Khong du cau hoi trong ngan hang cho phan "${section.name}". Vui long them cau hoi truoc.`);
    }

    // Insert vao test_questions
    const testQuestions = questions.map((q, i) =>
      this.testQuestionRepo.create({
        testId: section.testId,
        sectionId: section.id,
        questionId: q.id,
        points: 1,
        displayOrder: i,
      })
    );
    await this.testQuestionRepo.save(testQuestions);
    return { inserted: testQuestions.length, available: questions.length };
  }

  /**
   * Validate cau truc de thi:
   * - Kiem tra so luong cau hoi trong moi section co du khong.
   * - Kiem tra skill cau hoi co khop voi section khong.
   */
  async validateTestStructure(testId: string) {
    const sections = await this.sectionRepo.find({ where: { testId } as any });
    const results = [];
    let allValid = true;

    for (const section of sections) {
      const questions = await this.testQuestionRepo.find({ 
        where: { sectionId: section.id } as any,
        relations: ['question', 'question.children']
      });
      const required = section.requiredQuestionCount ?? 0;
      let actual = 0;
      for (const tq of questions) {
        if (tq.question?.type === 'GROUP') {
          actual += (tq.question.children?.length || 0);
        } else {
          actual += 1;
        }
      }
      const isValid = required === 0 || actual >= required;
      if (!isValid) allValid = false;

      results.push({
        sectionId: section.id,
        sectionName: section.name,
        targetSkill: section.targetSkill,
        required,
        actual,
        isValid,
        missing: Math.max(0, required - actual),
      });
    }

    return { testId, isValid: allValid, sections: results };
  }

  /** Them cau hoi thu cong vao 1 section */
  async addQuestionsToSection(sectionId: string, questionIds: string[], teacherId: string) {
    const section = await this.sectionRepo.findOne({ where: { id: sectionId } as any });
    if (!section) throw new NotFoundException("Section not found");
    const test = await this.testRepo.findOne({ where: { id: section.testId } as any });
    if (!test || test.teacherId !== teacherId) throw new BadRequestException("Not authorized");

    const existing = await this.testQuestionRepo.find({ where: { sectionId } as any });
    const existingIds = new Set(existing.map((q) => q.questionId));
    const newIds = questionIds.filter((id) => !existingIds.has(id));

    if (newIds.length === 0) return { inserted: 0 };
    const toInsert = newIds.map((questionId, i) =>
      this.testQuestionRepo.create({
        testId: section.testId,
        sectionId,
        questionId,
        points: 1,
        displayOrder: existing.length + i,
      })
    );
    await this.testQuestionRepo.save(toInsert);
    return { inserted: toInsert.length };
  }

  /** Xoa cau hoi khoi section */
  async removeQuestionFromSection(sectionId: string, questionId: string, teacherId: string) {
    const section = await this.sectionRepo.findOne({ where: { id: sectionId } as any });
    if (!section) throw new NotFoundException("Section not found");
    const test = await this.testRepo.findOne({ where: { id: section.testId } as any });
    if (!test || test.teacherId !== teacherId) throw new BadRequestException("Not authorized");
    await this.testQuestionRepo.delete({ sectionId, questionId } as any);
    return { removed: true };
  }
}
