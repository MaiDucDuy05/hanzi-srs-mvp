import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { TestTemplateService } from "./test-template.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

function ok(data: any, msg: string) {
  return data?.meta ? { ...data, message: msg } : { data, message: msg };
}

@Controller("test-templates")
@UseGuards(JwtAuthGuard)
export class TestTemplateController {
  constructor(private readonly svc: TestTemplateService) {}

  /** GET /test-templates?hskLevel=3&category=FINAL_EXAM */
  @Get()
  async list(@Query() q: { hskLevel?: string; category?: string; page?: string; limit?: string }) {
    return ok(
      await this.svc.listTemplates({
        hskLevel: q.hskLevel ? Number(q.hskLevel) : undefined,
        category: q.category,
        page: Number(q.page ?? 1),
        limit: Number(q.limit ?? 50),
      }),
      "Templates retrieved"
    );
  }

  /** GET /test-templates/:id */
  @Get(":id")
  async getOne(@Param("id") id: string) {
    return ok(await this.svc.getTemplate(id), "Template retrieved");
  }

  /** POST /test-templates/:id/create-test - Tao test tu template */
  @Post(":id/create-test")
  async createTest(
    @Param("id") templateId: string,
    @Body() body: { name?: string },
    @CurrentUser("sub") userId: string
  ) {
    return ok(await this.svc.createTestFromTemplate(templateId, userId, body), "Test created from template");
  }
}

@Controller("test-sections")
@UseGuards(JwtAuthGuard)
export class TestSectionController {
  constructor(private readonly svc: TestTemplateService) {}

  /** GET /test-sections?testId=xxx */
  @Get()
  async list(@Query("testId") testId: string) {
    return ok(await this.svc.getTestSections(testId), "Sections retrieved");
  }

  /** POST /test-sections/:id/auto-generate */
  @Post(":id/auto-generate")
  async autoGenerate(@Param("id") sectionId: string, @CurrentUser("sub") userId: string) {
    return ok(await this.svc.autoGenerateSection(sectionId, userId), "Section auto-generated");
  }

  /** POST /test-sections/:id/questions - Them cau hoi thu cong */
  @Post(":id/questions")
  async addQuestions(
    @Param("id") sectionId: string,
    @Body() body: { questionIds: string[] },
    @CurrentUser("sub") userId: string
  ) {
    return ok(await this.svc.addQuestionsToSection(sectionId, body.questionIds, userId), "Questions added");
  }
}

@Controller("tests")
@UseGuards(JwtAuthGuard)
export class TestValidateController {
  constructor(private readonly svc: TestTemplateService) {}

  /** GET /tests/:id/validate-structure */
  @Get(":id/validate-structure")
  async validate(@Param("id") testId: string) {
    return ok(await this.svc.validateTestStructure(testId), "Validation done");
  }
}
