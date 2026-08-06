# Plan: NestJS Feature Layer Implementation

## Status: Planning | Priority: High

## Context

Database layer complete (20 entities, migration 001, seeds). Need full NestJS feature layer: modules, controllers, services, DTOs, and JWT auth — built on top of existing entities. Backend only.

---

## Phase 1: Infrastructure Setup

**Package installation & global config**

- Install: `@nestjs/jwt` `@nestjs/passport` `passport` `passport-jwt` `bcrypt` `class-validator` `class-transformer` `@types/passport-jwt` `@types/bcrypt`
- `main.ts`: enable `ValidationPipe({ transform: true, whitelist: true })`, CORS
- `src/common/`: add `pagination.dto.ts` (shared `PaginationQueryDto`, `PaginatedResponse<T>`)
- `src/common/`: add `api-response.interface.ts` (standard `{ data, meta, message }` wrapper)
- `src/common/`: add `filters/http-exception.filter.ts` (global exception → standard format)
- Verify build compiles

## Phase 2: Auth Module

**Files to create/modify:**

- `src/modules/auth/auth.module.ts` — register `TypeOrmModule.forFeature([User])`, `JwtModule.registerAsync()`, providers
- `src/modules/auth/dto/`:
  - `register.dto.ts` — email, password, fullName (class-validator)
  - `login.dto.ts` — email, password
  - `create-user.dto.ts` — email, password, fullName, role (admin-use)
  - `update-user.dto.ts` — fullName, role, status (PartialType)
  - `user-query.dto.ts` — extends PaginationQueryDto, adds role/status filter
- `src/modules/auth/auth.service.ts` — register, login, validateUser, generateToken
- `src/modules/auth/auth.controller.ts` — POST /auth/register, POST /auth/login
- `src/modules/auth/user.service.ts` — CRUD (findAll paginated, findById, create, update, softDelete)
- `src/modules/auth/user.controller.ts` — GET/POST/PATCH/DELETE /users
- `src/modules/auth/guards/`:
  - `jwt-auth.guard.ts` — extend AuthGuard('jwt'), check `@Public()` decorator
  - `roles.guard.ts` — check `@Roles()` metadata
- `src/modules/auth/strategies/jwt.strategy.ts` — passport JWT strategy
- `src/modules/auth/decorators/`:
  - `roles.decorator.ts` — `@Roles(Role.FREE, Role.TEACHER, ...)`
  - `public.decorator.ts` — `@Public()` skip JWT
  - `current-user.decorator.ts` — `@CurrentUser()` extract user from JWT payload

## Phase 3: Curriculum Module

**Entities:** HskLevel, Vocabulary, GrammarPoint, Lesson, LessonContent, Topic, TopicVocabulary

- `src/modules/curriculum/curriculum.module.ts`
- `src/modules/curriculum/dto/` — for each entity: create, update, query DTOs
- Services (one per entity): HskLevelService, VocabularyService, GrammarPointService, LessonService, LessonContentService, TopicService, TopicVocabularyService
- Controllers (one per entity): same structure, RESTful endpoints
- CRUD pattern per entity: GET /{resource} (paginated), GET /{resource}/:id, POST /{resource}, PATCH /{resource}/:id, DELETE /{resource}/:id (softDelete where applicable)

## Phase 4: Courses Module

**Entities:** Course, CourseLesson

- `src/modules/courses/courses.module.ts`
- `src/modules/courses/dto/` — create, update, query per entity
- Services: CourseService, CourseLessonService
- Controllers: CourseController, CourseLessonController
- CRUD pattern, with list endpoints filterable by audience/slug/status

## Phase 5: Practice Module

**Entities:** PracticeQuestion, PracticeAttempt

- `src/modules/practice/practice.module.ts`
- `src/modules/practice/dto/` — create, update, query, submit-attempt dto
- Services: PracticeQuestionService, PracticeAttemptService
- Controllers: PracticeQuestionController, PracticeAttemptController
- Key behaviors: start attempt (new IN_PROGRESS, snapshot questions), submit attempt (COMPLETED, compute score), list attempts by user/practiceType

## Phase 6: Test Module

**Entities:** Test, TestQuestion, TestAnswer, TestAttempt

- `src/modules/test/test.module.ts`
- `src/modules/test/dto/` — create test, update test, create question, submit attempt, grade answer DTOs
- Services: TestService, TestQuestionService, TestAttemptService, TestAnswerService
- Controllers: same structure
- Key behaviors: teacher creates test with questions, students start attempt (with attempt_limit check), submit answers per question, submit entire attempt

## Phase 7: Subscription Module

**Entities:** Subscription, DailyPracticeUsage, PracticeLimitSettings

- `src/modules/subscription/subscription.module.ts`
- `src/modules/subscription/dto/` — create subscription, update settings, check-limit DTOs
- Services: SubscriptionService, DailyUsageService, LimitSettingsService
- Controllers: SubscriptionController, DailyUsageController, LimitSettingsController
- Key behaviors: track daily usage, enforce free limits (3/bài), VIP entitlement check

## Phase 8: Resources Module

**Entities:** Resource, AiGenerationJob, ContactRequest, MistakeBook, SpeakingAttempt, VipUpgradeRequest

- `src/modules/resources/resources.module.ts`
- `src/modules/resources/dto/` — DTOs per entity
- Services (6), Controllers (6)
- Key behaviors: AI job creation (PENDING → worker picks up), contact form, VIP upgrade request flow, mistake book CRUD

## Phase 9: Wire Up & Build

- `app.module.ts`: import all 7 feature modules (AuthModule, CurriculumModule, CoursesModule, PracticeModule, TestModule, SubscriptionModule, ResourcesModule)
- Add global guard: `APP_GUARD` → JwtAuthGuard (check Public decorator)
- Run `npm run build` — verify zero type errors
- Run `npm run test` — verify tests pass (update minimal test)

---

## File Count Estimate

| Phase | Files Created | Files Modified |
|-------|--------------|----------------|
| 1. Infrastructure | 4 | 1 (main.ts) |
| 2. Auth | 18 | 0 |
| 3. Curriculum | 22 | 0 |
| 4. Courses | 8 | 0 |
| 5. Practice | 8 | 0 |
| 6. Test | 13 | 0 |
| 7. Subscription | 10 | 0 |
| 8. Resources | 19 | 0 |
| 9. Wire Up | 0 | 1 (app.module.ts) |
| **Total** | ~102 | 2 |

## Risk Notes

- Partitioned `practice_attempts` table: TypeORM entity works read/write but `.save()` needs `created_at` set. PG routes by month automatically.
- `lesson_contents` polymorphic: no FK to vocabulary/grammar tables, validated in service layer.
- `practice_limit_settings` is single-row config — upsert pattern (not multi-row).

## Dependencies

- Phase 1 must complete first (packages + global infra)
- Phase 2 (auth) must complete before global guard in Phase 9
- Phases 3–8 are independent and can run in parallel (if using agents)
