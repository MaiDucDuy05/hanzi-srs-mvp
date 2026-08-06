# Database Schema — Performance & Design Review

- **Type:** Reviewer report (database-optimizer skill)
- **Date:** 2026-08-06
- **Author:** Claude (BE architecture)
- **Đối tượng review:** `plans/reports/researcher-2026-08-06-database-schema-design.md`
- **Phương pháp:** Design-time review — DB chưa dựng, không có baseline runtime. Suy ra query patterns từ `docs/modules/**`, soát index/unique/type/đồng thời, đối chiếu reference `index-strategies.md` + `postgresql-tuning.md`.

---

## 1. Đánh giá tổng quan

Schema 23 bảng nhìn chung đúng và sát docs (JSONB giảm bảng, polymorphic source, soft delete). Tuy nhiên phát hiện:

- **1 lỗi thiết kế dữ liệu** (unique index của `test_attempts` mâu thuẫn với `attempt_limit > 1` của PR-05).
- **1 thiếu sót schema quan trọng** (chưa có cột `idempotency_key` — bắt buộc theo PR-14 §3.3, nếu thiếu thì retry request sẽ tốn lượt oan và vi phạm tiêu chí nghiệm thu).
- **~8 khuyến nghị index bổ sung** cho các query pattern thực tế mà report gốc bỏ sót.
- **Các lưu ý về đồng thời (PR-14), TOAST/GIN, partitioning** và cấu hình PG khi deploy.

## 2. Phát hiện & ảnh hưởng

| # | Mức | Vấn đề | Hệ quả |
|---|---|---|---|
| 1 | **CAO** | `test_attempts` UNIQUE `(test_id, user_id, status)` | Giáo viên cấu hình `attempt_limit = 2` → học sinh không thể làm lần 2 vì chỉ có 1 dòng `SUBMITTED`. Trái với PR-05 §2 "số lần được làm". |
| 2 | **CAO** | Thiếu cột `idempotency_key` trên `practice_attempts` | Không triển khai được PR-14 §3.3 (Idempotency-Key). Request timeout → retry tạo attempt mới → tốn lượt, vi phạm nghiệm thu. |
| 3 | TRUNG BÌNH | `users.email` unique thường nhưng login có thể so khớp case-insensitive | `WHERE LOWER(email)=...` sẽ bỏ qua index → seq scan. |
| 4 | TRUNG BÌNH | `ai_generation_jobs` thiếu index cho worker poll | Worker query `status=PENDING ORDER BY created_at` không có index hỗ trợ. |
| 5 | TRUNG BÌNH | `practice_questions` thiếu index cho generator | Generator chọn câu đã publish theo level/lesson → scan lọc thủ công. |
| 6 | TRUNG BÌNH | `resources` thiếu index danh sách theo tier | Thư viện tài liệu lọc FREE/VIP không có index. |
| 7 | THẤP | `mistake_book` thiếu index theo nguồn | FR-23 giáo viên xem sổ lỗi sai học sinh theo bài/level. |
| 8 | THẤP | Generator dùng `ORDER BY random()` | Ở scale lớn phải sort toàn bộ tập hợp lệ mỗi lần. |
| 9 | THẤP | `subscriptions` index `(user_id, status)` | Query entitlement lọc thêm `expires_at > now()` — có thể tối ưu bằng INCLUDE/partial. |
| 10 | THÔNG TIN | `practice_attempts` + `daily_practice_usage` tăng nhanh | Cần chiến lược dữ liệu cũ + partitioning khi scale. |

## 3. Đề xuất sửa

### 3.1. Sửa lỗi dữ liệu — `test_attempts`

Bỏ UNIQUE `(test_id, user_id, status)`. Thay bằng:

```sql
-- Chống 2 attempt IN_PROGRESS song song cho cùng bài (partial unique index)
CREATE UNIQUE INDEX uq_test_attempts_active
    ON test_attempts (test_id, user_id)
    WHERE status = 'IN_PROGRESS';

-- "Nộp 1 lần" được enforce ở tầng service (transition IN_PROGRESS→SUBMITTED
-- có điều kiện WHERE status='IN_PROGRESS'), không cần unique toàn cục.
-- Index thường cho truy vấn kết quả:
CREATE INDEX idx_test_attempts_test_user
    ON test_attempts (test_id, user_id, submitted_at DESC);
```

### 3.2. Bổ sung cột bắt buộc — `practice_attempts`

```sql
ALTER TABLE practice_attempts ADD COLUMN idempotency_key varchar(64) NULL;
CREATE UNIQUE INDEX uq_practice_attempts_idem
    ON practice_attempts (user_id, idempotency_key)
    WHERE idempotency_key IS NOT NULL;   -- partial: chỉ khoá khi có key
```

Luồng PR-14 §3.3: đầu `/start` → nếu `idempotency_key` trùng (cùng user) trả attempt cũ; ngược lại tạo mới trong cùng transaction với việc tăng lượt.

### 3.3. Index bổ sung (toàn schema)

```sql
-- #3 users: login không phân biệt hoa thường
CREATE UNIQUE INDEX uq_users_email_lower ON users (LOWER(email));

-- #4 AI jobs: worker poll
CREATE INDEX idx_ai_jobs_status_created ON ai_generation_jobs (status, created_at);

-- #5 generator câu hỏi đã publish
CREATE INDEX idx_practice_questions_gen
    ON practice_questions (question_type, status, level_id)
    WHERE status = 'PUBLISHED';

-- #6 resources list theo tier
CREATE INDEX idx_resources_tier_status
    ON resources (tier, status, created_at DESC)
    WHERE deleted_at IS NULL;

-- #7 sổ lỗi sai theo nguồn (FR-23)
CREATE INDEX idx_mistake_book_user_source
    ON mistake_book (user_id, source_type, source_id, created_at DESC);

-- #9 entitlement check
CREATE INDEX idx_subscriptions_entitlement
    ON subscriptions (user_id, status) INCLUDE (plan, expires_at)
    WHERE status = 'ACTIVE';
```

### 3.4. Practice attempts — chiến lược sinh câu hỏi (thay `ORDER BY random()`)

Không đổi schema; áp dụng khi viết generator:

```sql
-- Cách 1 (MVP): lấy id set trước, shuffle trong app
SELECT id FROM vocabularies
WHERE level_id = $1 AND status = 'PUBLISHED' AND deleted_at IS NULL;

-- Cách 2 (khi lượng từ lớn): sampling trên index id
SELECT ... FROM vocabularies
WHERE level_id = $1 AND status = 'PUBLISHED'
  AND id >= (SELECT id FROM vocabularies ORDER BY id LIMIT 1 OFFSET floor(random()*N))
LIMIT 5;
```

### 3.5. Partitioning & dữ liệu cũ (để dành khi scale, không làm ngay)

- `practice_attempts`: nên dựng **ngay từ đầu** dạng `PARTITION BY RANGE (created_at)` theo tháng nếu dự đoán > vài triệu dòng/năm; nếu không, để sau bằng cách tạo bảng mới và rename. Không đổi kiến trúc API.
- `daily_practice_usage`: xoá hàng loạt định kỳ (`DELETE ... WHERE usage_date < now() - 90d`) ngoài giờ thấp điểm; cân nhắc partition theo tháng nếu cần.
- Sau bulk load/cleanup: chạy `ANALYZE`.

### 3.6. Cấu hình PostgreSQL khi deploy (MVP, single EC2 ~2-4GB RAM)

```ini
# postgresql.conf — khởi điểm cho Supabase Free / EC2 nhỏ
shared_buffers = 1GB            # 25% RAM
effective_cache_size = 3GB      # 75% RAM
work_mem = 16MB
maintenance_work_mem = 256MB
random_page_cost = 1.1          # SSD
max_connections = 100
default_statistics_target = 200
log_min_duration_statement = 500
```

Lưu ý: Supabase Free không cho chỉnh `shared_buffers`; nếu dùng Supabase thì phần tuning chỉ áp dụng cho EC2 tự host.

## 4. Lưu ý đã cân nhắc và giữ nguyên

- **Không thêm GIN trên `question_data`/`answer_data` JSONB** — MVP không query theo nội dung jsonb; GIN tốn ghi và storage.
- **`activity_key` varchar(64)** trong `daily_practice_usage` — giữ theo docs (không normalize thành FK) để tránh join; index unique đã đủ.
- **Index `(level_id, status, display_order)`** trên `lessons` — đúng thứ tự cột (equality trước, low-cardinality `status` sau level).
- **`test_answers` UNIQUE `(attempt_id, question_id)`** — hợp lý, cũng phục vụ lookup theo attempt.
- **JSONB snapshot trong attempt** — đúng tinh thần PR-09/10 "chấm theo snapshot"; không bị ảnh hưởng khi Admin sửa câu hỏi.
- **`gen_random_uuid()`** — có sẵn từ PG13+, không cần extension `pgcrypto`.

## 5. Kế hoạch validate khi triển khai

1. Sau migration: tạo seed dữ liệu mẫu (vài nghìn từ, vài nghìn attempt).
2. Chạy EXPLAIN cho 8 query pattern chính (list lessons, topic detail, start/submit attempt, results theo test, usage đếm, entitlement, worker poll, sổ lỗi sai) → xác nhận `Index Scan`/`Index Only Scan`, không `Seq Scan` trên bảng lớn.
3. Test đồng thời PR-14: 2 request cùng idempotency key → 1 attempt; 2 request khác key song song → không vượt `used_count`.
4. Theo dõi `pg_stat_user_indexes` sau 30 ngày để bỏ index chưa dùng.

## 6. Câu hỏi chưa rõ / chưa quyết

- `attempt_limit` của `tests`: mặc định là bao nhiêu (1 hay nhiều)? Ảnh hưởng xác nhận fix #1 — nhưng fix đề xuất đã đúng cho cả 2 trường hợp.
- Có cần case-insensitive login không (ảnh hưởng fix #3)?
- Dự đoán scale attempt/tháng để quyết định partition ngay hay để sau (#3.5)?
