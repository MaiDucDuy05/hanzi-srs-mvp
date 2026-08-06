import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 001 — Initial schema (25 bảng) cho HSK Learning Platform.
 *
 * Quyết định đã chốt:
 * - UUID PK (gen_random_uuid, PG16 built-in), timestamptz created_at/updated_at.
 * - Enum dùng varchar + CHECK (dễ migrate hơn Postgres ENUM).
 * - JSONB cho dữ liệu linh hoạt (question_data, answer_data, options...).
 * - practice_attempts: PARTITION BY RANGE (created_at) theo tháng;
 *   PK composite (id, created_at) bắt buộc cho partition key.
 *   Partial unique index cho idempotency_key đặt TRỰC TIẾP trên từng partition
 *   (PG không cho partial unique trên partitioned parent).
 * - test_attempts: partial unique (test_id, user_id) WHERE status='IN_PROGRESS'
 *   — cho phép attempt_limit > 1 (teacher cấu hình), chống 2 attempt đang làm.
 * - users: unique index trên LOWER(email) — login case-insensitive.
 */
export class InitialSchema0011786005366597 implements MigrationInterface {
  name = 'InitialSchema0011786005366597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const statements: string[] = [
      // ============ USERS & SUBSCRIPTIONS ============
      `CREATE TABLE users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(100) NOT NULL,
        role varchar(20) NOT NULL DEFAULT 'FREE',
        status varchar(20) NOT NULL DEFAULT 'ACTIVE',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        CONSTRAINT chk_users_role CHECK (role IN ('FREE','TEACHER','ADMIN')),
        CONSTRAINT chk_users_status CHECK (status IN ('ACTIVE','BANNED'))
      )`,

      // Login case-insensitive
      `CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(email))`,

      `CREATE TABLE subscriptions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        plan varchar(10) NOT NULL DEFAULT 'FREE',
        status varchar(20) NOT NULL DEFAULT 'ACTIVE',
        starts_at timestamptz NOT NULL,
        expires_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_subscriptions_plan CHECK (plan IN ('FREE','VIP')),
        CONSTRAINT chk_subscriptions_status CHECK (status IN ('ACTIVE','EXPIRED','CANCELLED'))
      )`,

      // Entitlement check: index-only scan (INCLUDE) + partial WHERE ACTIVE
      `CREATE INDEX idx_subscriptions_entitlement
        ON subscriptions (user_id, status) INCLUDE (plan, expires_at)
        WHERE status = 'ACTIVE'`,

      // ============ CURRICULUM (FR-01, FR-02) ============
      `CREATE TABLE hsk_levels (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code varchar(10) NOT NULL,
        name varchar(100) NOT NULL,
        display_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,
      `CREATE UNIQUE INDEX uq_hsk_levels_code ON hsk_levels (code)`,

      `CREATE TABLE lessons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        level_id uuid NOT NULL REFERENCES hsk_levels(id),
        title varchar(200) NOT NULL,
        description text,
        display_order int NOT NULL DEFAULT 0,
        status varchar(20) NOT NULL DEFAULT 'DRAFT',
        published_at timestamptz,
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_lessons_status CHECK (status IN ('DRAFT','PUBLISHED'))
      )`,
      `CREATE INDEX idx_lessons_level_status_order
        ON lessons (level_id, status, display_order)`,

      `CREATE TABLE vocabularies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        level_id uuid NOT NULL REFERENCES hsk_levels(id),
        hanzi varchar(50) NOT NULL,
        pinyin varchar(100) NOT NULL,
        meaning_vi text NOT NULL,
        audio_key varchar(255),
        status varchar(20) NOT NULL DEFAULT 'DRAFT',
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_vocabularies_status CHECK (status IN ('DRAFT','PUBLISHED'))
      )`,
      `CREATE INDEX idx_vocabularies_level_status ON vocabularies (level_id, status)`,
      `CREATE INDEX idx_vocabularies_hanzi ON vocabularies (hanzi)`,

      `CREATE TABLE grammar_points (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        level_id uuid NOT NULL REFERENCES hsk_levels(id),
        title varchar(200) NOT NULL,
        structure text,
        explanation text,
        status varchar(20) NOT NULL DEFAULT 'DRAFT',
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_grammar_points_status CHECK (status IN ('DRAFT','PUBLISHED'))
      )`,
      `CREATE INDEX idx_grammar_points_level_status
        ON grammar_points (level_id, status)`,

      `CREATE TABLE lesson_contents (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        lesson_id uuid NOT NULL REFERENCES lessons(id),
        content_type varchar(20) NOT NULL,
        content_id uuid NOT NULL,
        display_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_lesson_contents_type
          CHECK (content_type IN ('VOCABULARY','GRAMMAR'))
      )`,
      `CREATE UNIQUE INDEX uq_lesson_contents
        ON lesson_contents (lesson_id, content_type, content_id)`,

      `CREATE TABLE topics (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        description text,
        thumbnail_key varchar(255),
        recommended_level_id uuid REFERENCES hsk_levels(id),
        status varchar(20) NOT NULL DEFAULT 'DRAFT',
        display_order int NOT NULL DEFAULT 0,
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_topics_status CHECK (status IN ('DRAFT','PUBLISHED'))
      )`,
      `CREATE UNIQUE INDEX uq_topics_slug ON topics (slug)`,
      `CREATE INDEX idx_topics_status_order ON topics (status, display_order)`,

      `CREATE TABLE topic_vocabularies (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        topic_id uuid NOT NULL REFERENCES topics(id),
        vocabulary_id uuid NOT NULL REFERENCES vocabularies(id),
        display_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,
      `CREATE UNIQUE INDEX uq_topic_vocabularies
        ON topic_vocabularies (topic_id, vocabulary_id)`,

      // ============ COURSES (người lớn / trẻ em) ============
      `CREATE TABLE courses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(100) NOT NULL,
        slug varchar(100) NOT NULL,
        description text,
        thumbnail_key varchar(255),
        audience varchar(10) NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'DRAFT',
        display_order int NOT NULL DEFAULT 0,
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_courses_audience CHECK (audience IN ('ADULT','CHILD')),
        CONSTRAINT chk_courses_status CHECK (status IN ('DRAFT','PUBLISHED'))
      )`,
      `CREATE UNIQUE INDEX uq_courses_slug ON courses (slug)`,
      `CREATE INDEX idx_courses_audience_status_order
        ON courses (audience, status, display_order)`,

      `CREATE TABLE course_lessons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id uuid NOT NULL REFERENCES courses(id),
        lesson_id uuid NOT NULL REFERENCES lessons(id),
        display_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,
      `CREATE UNIQUE INDEX uq_course_lessons ON course_lessons (course_id, lesson_id)`,

      // ============ PRACTICE (dùng chung) ============
      // practice_attempts: PARTITIONED BY RANGE (created_at) theo tháng.
      // Lưu ý: PK phải gồm partition key; FK và index thường được hỗ trợ.
      `CREATE TABLE practice_attempts (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        practice_type varchar(30) NOT NULL,
        source_type varchar(20) NOT NULL,
        source_id varchar(64) NOT NULL,
        idempotency_key varchar(64),
        question_data jsonb,
        answer_data jsonb,
        score int NOT NULL DEFAULT 0,
        correct_count int NOT NULL DEFAULT 0,
        wrong_count int NOT NULL DEFAULT 0,
        move_count int NOT NULL DEFAULT 0,
        duration_seconds int NOT NULL DEFAULT 0,
        status varchar(20) NOT NULL DEFAULT 'IN_PROGRESS',
        started_at timestamptz NOT NULL DEFAULT now(),
        completed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        PRIMARY KEY (id, created_at),
        CONSTRAINT chk_practice_attempts_type CHECK (
          practice_type IN ('WORD_MATCHING','FLASHCARD','FILL_BLANK',
            'SENTENCE_ORDERING','PINYIN_BALLOON_GAME','MEMORY_GAME','HANZI_WRITING')
        ),
        CONSTRAINT chk_practice_attempts_source CHECK (
          source_type IN ('LEVEL','LESSON','TOPIC')
        ),
        CONSTRAINT chk_practice_attempts_status CHECK (
          status IN ('IN_PROGRESS','COMPLETED')
        )
      ) PARTITION BY RANGE (created_at)`,

      // Partitions: tháng hiện tại + tháng sau + default (an toàn khi qua tháng).
      // Script tạo partition định kỳ phải nhắc tạo thêm các partition theo tháng.
      `CREATE TABLE practice_attempts_2026_08 PARTITION OF practice_attempts
        FOR VALUES FROM ('2026-08-01') TO ('2026-09-01')`,
      `CREATE TABLE practice_attempts_2026_09 PARTITION OF practice_attempts
        FOR VALUES FROM ('2026-09-01') TO ('2026-10-01')`,
      `CREATE TABLE practice_attempts_default PARTITION OF practice_attempts DEFAULT`,

      // Partial unique idempotency index — bắt buộc đặt trên TỪNG partition
      // (PG không cho partial unique index trên partitioned parent).
      `CREATE UNIQUE INDEX uq_practice_attempts_idem_2026_08
        ON practice_attempts_2026_08 (user_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL`,
      `CREATE UNIQUE INDEX uq_practice_attempts_idem_2026_09
        ON practice_attempts_2026_09 (user_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL`,
      `CREATE UNIQUE INDEX uq_practice_attempts_idem_default
        ON practice_attempts_default (user_id, idempotency_key)
        WHERE idempotency_key IS NOT NULL`,

      // Index thường trên parent (tự động lan sang partition mới).
      `CREATE INDEX idx_practice_attempts_user_status
        ON practice_attempts (user_id, status)`,
      `CREATE INDEX idx_practice_attempts_user_type_created
        ON practice_attempts (user_id, practice_type, created_at DESC)`,

      `CREATE TABLE practice_questions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        question_type varchar(30) NOT NULL,
        level_id uuid REFERENCES hsk_levels(id),
        lesson_id uuid REFERENCES lessons(id),
        prompt text,
        question_data jsonb,
        answer_data jsonb,
        accepted_answers jsonb,
        answer_type varchar(20),
        translation text,
        explanation text,
        status varchar(20) NOT NULL DEFAULT 'DRAFT',
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_practice_questions_type CHECK (
          question_type IN ('FILL_BLANK','SENTENCE_ORDERING')
        ),
        CONSTRAINT chk_practice_questions_status CHECK (
          status IN ('DRAFT','PUBLISHED')
        ),
        CONSTRAINT chk_practice_questions_answer_type CHECK (
          answer_type IS NULL OR answer_type IN ('HANZI','PINYIN','TEXT')
        )
      )`,
      // Generator chọn câu đã publish theo loại + level (partial index nhỏ gọn).
      `CREATE INDEX idx_practice_questions_gen
        ON practice_questions (question_type, status, level_id)
        WHERE status = 'PUBLISHED'`,

      // ============ TEACHER TESTS (PR-05) ============
      `CREATE TABLE tests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        teacher_id uuid NOT NULL REFERENCES users(id),
        name varchar(200) NOT NULL,
        description text,
        time_limit_minutes int NOT NULL DEFAULT 0,
        attempt_limit int NOT NULL DEFAULT 1,
        status varchar(20) NOT NULL DEFAULT 'DRAFT',
        access_code varchar(20),
        show_score_immediately boolean NOT NULL DEFAULT true,
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_tests_status CHECK (status IN ('DRAFT','PUBLISHED','CLOSED'))
      )`,
      `CREATE UNIQUE INDEX uq_tests_access_code
        ON tests (access_code) WHERE access_code IS NOT NULL`,
      `CREATE INDEX idx_tests_teacher_status ON tests (teacher_id, status)`,

      `CREATE TABLE test_questions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        test_id uuid NOT NULL REFERENCES tests(id),
        question_type varchar(20) NOT NULL,
        content text NOT NULL,
        options jsonb,
        correct_answer jsonb,
        points int NOT NULL DEFAULT 1,
        display_order int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_test_questions_type CHECK (
          question_type IN ('SINGLE_CHOICE','TRUE_FALSE','SHORT_ANSWER')
        )
      )`,
      `CREATE INDEX idx_test_questions_test_order
        ON test_questions (test_id, display_order)`,

      `CREATE TABLE test_attempts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        test_id uuid NOT NULL REFERENCES tests(id),
        user_id uuid NOT NULL REFERENCES users(id),
        status varchar(20) NOT NULL DEFAULT 'IN_PROGRESS',
        started_at timestamptz NOT NULL DEFAULT now(),
        submitted_at timestamptz,
        score int NOT NULL DEFAULT 0,
        duration_seconds int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_test_attempts_status CHECK (
          status IN ('IN_PROGRESS','SUBMITTED')
        )
      )`,
      // Chống 2 attempt đang làm song song; KHÔNG unique toàn cục vì
      // attempt_limit do teacher cấu hình (>1). "Nộp 1 lần" enforce ở service.
      `CREATE UNIQUE INDEX uq_test_attempts_active
        ON test_attempts (test_id, user_id) WHERE status = 'IN_PROGRESS'`,
      `CREATE INDEX idx_test_attempts_test_user_submitted
        ON test_attempts (test_id, user_id, submitted_at DESC)`,

      `CREATE TABLE test_answers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        attempt_id uuid NOT NULL REFERENCES test_attempts(id),
        question_id uuid NOT NULL REFERENCES test_questions(id),
        answer jsonb,
        is_correct boolean NOT NULL DEFAULT false,
        points_awarded int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,
      `CREATE UNIQUE INDEX uq_test_answers_attempt_question
        ON test_answers (attempt_id, question_id)`,

      // ============ SUBSCRIPTION / RATE LIMIT (PR-14) ============
      `CREATE TABLE daily_practice_usage (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        activity_key varchar(255) NOT NULL,
        usage_date date NOT NULL,
        used_count int NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,
      `CREATE UNIQUE INDEX uq_daily_usage_user_key_date
        ON daily_practice_usage (user_id, activity_key, usage_date)`,

      `CREATE TABLE practice_limit_settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        free_limit int NOT NULL DEFAULT 3,
        reset_timezone varchar(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
        enabled boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,

      // ============ RESOURCES & COMMERCE (FR-24,25,26, FR-08,15,16,17) ============
      `CREATE TABLE resources (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar(200) NOT NULL,
        description text,
        file_key varchar(255) NOT NULL,
        tier varchar(10) NOT NULL DEFAULT 'FREE',
        uploader_id uuid NOT NULL REFERENCES users(id),
        status varchar(20) NOT NULL DEFAULT 'DRAFT',
        deleted_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_resources_tier CHECK (tier IN ('FREE','VIP')),
        CONSTRAINT chk_resources_status CHECK (status IN ('DRAFT','PUBLISHED'))
      )`,
      `CREATE INDEX idx_resources_tier_status_created
        ON resources (tier, status, created_at DESC) WHERE deleted_at IS NULL`,

      `CREATE TABLE vip_upgrade_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        status varchar(20) NOT NULL DEFAULT 'PENDING',
        note text,
        reviewed_by uuid REFERENCES users(id),
        requested_at timestamptz NOT NULL DEFAULT now(),
        reviewed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_vip_upgrade_requests_status CHECK (
          status IN ('PENDING','APPROVED','REJECTED')
        )
      )`,
      `CREATE INDEX idx_vip_upgrade_requests_user_status
        ON vip_upgrade_requests (user_id, status)`,

      `CREATE TABLE contact_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(100) NOT NULL,
        email varchar(255) NOT NULL,
        phone varchar(30),
        message text NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'NEW',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_contact_requests_status CHECK (
          status IN ('NEW','CONTACTED','CLOSED')
        )
      )`,
      `CREATE INDEX idx_contact_requests_status_created
        ON contact_requests (status, created_at DESC)`,

      `CREATE TABLE ai_generation_jobs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        job_type varchar(20) NOT NULL,
        input_data jsonb NOT NULL,
        output_data jsonb,
        status varchar(20) NOT NULL DEFAULT 'PENDING',
        error text,
        completed_at timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_ai_jobs_type CHECK (job_type IN ('STORY','STUDY_PATH')),
        CONSTRAINT chk_ai_jobs_status CHECK (
          status IN ('PENDING','PROCESSING','COMPLETED','FAILED')
        )
      )`,
      `CREATE INDEX idx_ai_jobs_status_created ON ai_generation_jobs (status, created_at)`,
      `CREATE INDEX idx_ai_jobs_user_status ON ai_generation_jobs (user_id, status)`,

      `CREATE TABLE mistake_book (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        source_type varchar(20) NOT NULL,
        source_id varchar(64) NOT NULL,
        question_type varchar(30) NOT NULL,
        question_snapshot jsonb NOT NULL,
        user_answer jsonb,
        correct_answer jsonb,
        explanation text,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`,
      `CREATE INDEX idx_mistake_book_user_source
        ON mistake_book (user_id, source_type, source_id, created_at DESC)`,
      `CREATE INDEX idx_mistake_book_user_created
        ON mistake_book (user_id, created_at DESC)`,

      `CREATE TABLE speaking_attempts (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id),
        audio_key varchar(255) NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'SUBMITTED',
        graded_by uuid REFERENCES users(id),
        score numeric,
        feedback text,
        submitted_at timestamptz NOT NULL DEFAULT now(),
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT chk_speaking_attempts_status CHECK (
          status IN ('SUBMITTED','GRADED')
        )
      )`,
      `CREATE INDEX idx_speaking_attempts_user_status
        ON speaking_attempts (user_id, status)`,
    ];

    for (const sql of statements) {
      await queryRunner.query(sql);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'speaking_attempts',
      'mistake_book',
      'ai_generation_jobs',
      'contact_requests',
      'vip_upgrade_requests',
      'resources',
      'practice_limit_settings',
      'daily_practice_usage',
      'test_answers',
      'test_attempts',
      'test_questions',
      'tests',
      'practice_questions',
      'practice_attempts',
      'course_lessons',
      'courses',
      'topic_vocabularies',
      'topics',
      'lesson_contents',
      'grammar_points',
      'vocabularies',
      'lessons',
      'hsk_levels',
      'subscriptions',
      'users',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
    }
  }
}
