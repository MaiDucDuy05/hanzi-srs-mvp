# Database Schema Design Proposal — HSK Learning Platform

- **Type:** Researcher report (đề xuất thiết kế database)
- **Date:** 2026-08-06
- **Author:** Claude (BE architecture)
- **Nguồn phân tích:** `README.md`, `docs/docs.md` (BRD), `docs/modules/**` (FR-01, FR-02, PR-03, PR-04, PR-05, PR-09, PR-10, PR-11, PR-12, PR-13, PR-14)
- **Backend hiện trạng:** NestJS 11 scaffold trống (chưa có DB/ORM/module nghiệp vụ)

---

## 1. Tóm tắt

Đề xuất thiết kế schema PostgreSQL cho nền tảng HSK Learning Platform MVP, phủ **toàn bộ BRD** (23 bảng) dựa trên đặc tả FR/PR trong `docs/`. Công nghệ: **PostgreSQL 14+ + TypeORM** (`@nestjs/typeorm`, migration CLI, `synchronize: false`).

## 2. Nguyên tắc thiết kế

1. **PK**: UUID (`gen_random_uuid()`).
2. **Timestamps**: mọi bảng có `created_at`, `updated_at` (`timestamptz`, default `now()`).
3. **Soft delete**: chỉ bảng nội dung chính (`lessons`, `vocabularies`, `topics`, `tests`, `resources`, `practice_questions`) có `deleted_at`; bảng attempt/answer/history **không** soft delete (dữ liệu bất biến).
4. **Enum**: `varchar + CHECK constraint` thay vì Postgres ENUM → dễ migrate.
5. **JSONB** cho dữ liệu linh hoạt (`question_data`, `answer_data`, `options`, `accepted_answers`) đúng tinh thần "giảm số bảng" của docs.
6. **Index**: theo đúng query patterns docs nêu (theo status + display_order, lookup level/lesson/user).
7. **Polymorphic FK**: `practice_attempts.source_type + source_id` (LEVEL/LESSON/TOPIC) — không tạo FK cứng.

## 3. Nhóm bảng đã đặc tả (17 bảng)

### 3.1 Core & Auth

**`users`**
- `id` uuid PK, `email` varchar(255) UNIQUE, `password_hash` varchar(255) (Argon2), `full_name` varchar(100)
- `role` varchar(20) (`FREE`/`TEACHER`/`ADMIN` — VIP là trạng thái gói, không phải role), `status` varchar(20) (`ACTIVE`/`BANNED`)
- `created_at`, `updated_at`, `deleted_at`

**`subscriptions`** (PR-14 §3.5)
- `user_id` FK→users, `plan` varchar(10) (`VIP`/`FREE`), `status` varchar(20) (`ACTIVE`/`EXPIRED`/`CANCELLED`)
- `starts_at`, `expires_at`
- Entitlement = role TEACHER/ADMIN **hoặc** subscription ACTIVE & `expires_at` > now
- Index `(user_id, status)`

### 3.2 Curriculum (FR-01 + FR-02)

**`hsk_levels`** — `code` UNIQUE (`HSK1`…`HSK9`), `name`, `display_order`.

**`lessons`** — `level_id` FK, `title`, `description`, `display_order`, `status` (`DRAFT`/`PUBLISHED`), `published_at`, `deleted_at`. Index `(level_id, status, display_order)`.

**`vocabularies`** — `level_id` FK, `hanzi`, `pinyin`, `meaning_vi`, `audio_key` (S3 key, nullable), `status`, `deleted_at`. Index `(level_id, status)` + index `hanzi`.

**`grammar_points`** — `level_id` FK, `title`, `structure`, `explanation`, `status`, `deleted_at`.

**`lesson_contents`** — `lesson_id` FK, `content_type` (`VOCABULARY`/`GRAMMAR`), `content_id` uuid, `display_order`. UNIQUE `(lesson_id, content_type, content_id)`.

**`topics`** — `name`, `slug` UNIQUE, `description`, `thumbnail_key`, `recommended_level_id` FK→hsk_levels (nullable), `status`, `display_order`, `deleted_at`.

**`topic_vocabularies`** — `topic_id` FK, `vocabulary_id` FK, `display_order`. UNIQUE `(topic_id, vocabulary_id)`.

### 3.3 Practice dùng chung (PR-03, 04, 09, 10, 11, 12, 13)

**`practice_attempts`** — 1 bảng cho tất cả dạng luyện tập:
- `user_id` FK→users, `practice_type` varchar(30) (`WORD_MATCHING`/`FLASHCARD`/`FILL_BLANK`/`SENTENCE_ORDERING`/`PINYIN_BALLOON_GAME`/`MEMORY_GAME`/`HANZI_WRITING`)
- `source_type` varchar(20) (`LEVEL`/`LESSON`/`TOPIC`), `source_id` varchar(64)
- `question_data` jsonb (snapshot bộ câu hỏi), `answer_data` jsonb (đáp án/event log)
- `score`, `correct_count`, `wrong_count`, `move_count`, `duration_seconds`
- `status` (`IN_PROGRESS`/`COMPLETED`), `started_at`, `completed_at`
- Index `(user_id, status)`, `(user_id, practice_type, created_at DESC)`

**`practice_questions`** (PR-09/PR-10):
- `question_type` (`FILL_BLANK`/`SENTENCE_ORDERING`), `level_id` FK NULL, `lesson_id` FK NULL
- `prompt`, `question_data` jsonb, `answer_data` jsonb (token order), `accepted_answers` jsonb, `answer_type` (`HANZI`/`PINYIN`/`TEXT`), `translation`, `explanation`, `status`, `deleted_at`

### 3.4 Teacher Test (PR-05)

**`tests`** — `teacher_id` FK→users, `name`, `description`, `time_limit_minutes`, `attempt_limit`, `status` (`DRAFT`/`PUBLISHED`/`CLOSED`), `access_code` UNIQUE, `show_score_immediately` bool, `deleted_at`.

**`test_questions`** — `test_id` FK, `question_type` (`SINGLE_CHOICE`/`TRUE_FALSE`/`SHORT_ANSWER`), `content`, `options` jsonb, `correct_answer` jsonb, `points`, `display_order`.

**`test_attempts`** — `test_id` FK, `user_id` FK, `status` (`IN_PROGRESS`/`SUBMITTED`), `started_at`, `submitted_at`, `score`, `duration_seconds`. UNIQUE `(test_id, user_id, status)` — chống nộp 2 lần.

**`test_answers`** — `attempt_id` FK, `question_id` FK, `answer` jsonb, `is_correct`, `points_awarded`. UNIQUE `(attempt_id, question_id)`.

### 3.5 Subscription & Rate limit (PR-14)

**`daily_practice_usage`** — `user_id` FK, `activity_key` (`practiceType:sourceType:sourceId`), `usage_date` date, `used_count`, `updated_at`. UNIQUE `(user_id, activity_key, usage_date)`. Không cần job reset; dọn dữ liệu >90 ngày.

**`practice_limit_settings`** — single-row config: `free_limit` (default 3), `reset_timezone` (default `Asia/Ho_Chi_Minh`), `enabled`.

## 4. Nhóm bảng phụ trợ — toàn bộ BRD (6 bảng)

**`vip_upgrade_requests`** (FR-26)
- `user_id` FK, `status` (`PENDING`/`APPROVED`/`REJECTED`), `note` text, `reviewed_by` FK NULL, `requested_at`, `reviewed_at`. Index `(user_id, status)`.

**`contact_requests`** (FR-25)
- `name`, `email`, `phone`, `message` text, `status` (`NEW`/`CONTACTED`/`CLOSED`), `created_at`, `updated_at`.

**`resources`** (FR-24)
- `title`, `description`, `file_key` (S3), `tier` (`FREE`/`VIP` — kiểm soát quyền theo gói NFR-06), `uploader_id` FK, `status`, `deleted_at`.

**`ai_generation_jobs`** (FR-15/16 — xử lý bất đồng bộ)
- `user_id` FK, `job_type` (`STORY`/`STUDY_PATH`), `input_data` jsonb, `output_data` jsonb NULL, `status` (`PENDING`/`PROCESSING`/`COMPLETED`/`FAILED`), `error` text NULL, `created_at`, `completed_at`. Index `(user_id, status)`.
- NFR-01: API AI ≤10s; lâu hơn → job PENDING + NestJS Schedule xử lý nền + frontend poll.

**`mistake_book`** (FR-17 — sổ lỗi sai)
- `user_id` FK, `source_type`/`source_id`, `question_type`, `question_snapshot` jsonb, `user_answer`/`correct_answer` jsonb, `explanation` NULL, `created_at`. Index `(user_id, created_at DESC)`.

**`speaking_attempts`** (FR-08 — luyện nói HSKK)
- `user_id` FK, `audio_key` (S3), `status` (`SUBMITTED`/`GRADED`), `graded_by` FK NULL, `score` numeric NULL, `feedback` text NULL, `submitted_at`, `created_at`.

## 5. Bảng hoãn lại (3 bảng)

`classes`, `class_students`, `assignments` (FR-21/22/23 Teacher Tools) — PR-05 chủ động hoãn module lớp học (giao bài bằng link/mã trước). Chỉ cần thêm `assignments` khi triển khai module này; không phá cấu trúc `tests`/`test_attempts`.

## 6. Tổng hợp

| Nhóm | Bảng |
|---|---|
| Core & Auth | `users`, `subscriptions` |
| Curriculum | `hsk_levels`, `lessons`, `vocabularies`, `grammar_points`, `lesson_contents`, `topics`, `topic_vocabularies` |
| Practice | `practice_attempts`, `practice_questions` |
| Teacher Test | `tests`, `test_questions`, `test_attempts`, `test_answers` |
| Subscription | `daily_practice_usage`, `practice_limit_settings` |
| Phụ trợ BRD | `vip_upgrade_requests`, `contact_requests`, `resources`, `ai_generation_jobs`, `mistake_book`, `speaking_attempts` |
| **Tổng** | **23 bảng** (+ 3 bảng class hoãn lại) |

## 7. Kế hoạch triển khai (khi được duyệt)

1. Cài `@nestjs/typeorm typeorm pg` + `@nestjs/config`; tạo `docker-compose.yml` (postgres:16) + `.env` (`DATABASE_URL`).
2. Tạo `src/database/`: `database.module.ts`, `data-source.ts`, `migrations/`, `seeds/`.
3. Migration `001-initial-schema`: 23 bảng + unique/index (UUID PK, CHECK enums, JSONB, `deleted_at`).
4. Seed idempotent: `hsk_levels` (HSK1–9) luôn; dữ liệu mẫu cho dev.
5. Chạy `npm run build` + test đảm bảo compile sạch.

## 8. Câu hỏi chưa rõ (không chặn việc dựng DB)

- Ngưỡng "độ khó" khi AI sinh câu chuyện theo cấp HSK (docs §6 #1) — cần BA chốt khi triển khai FR-15.
- Số cột `correct_count`/`move_count` trên `practice_attempts`: tách cột giúp thống kê FR-18 dễ hơn; có thể gộp vào `answer_data` JSONB nếu muốn tối giản.
