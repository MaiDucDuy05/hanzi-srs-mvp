# Tiến trình dự án HSK Learning Platform — So sánh Spec vs Implementation

**Ngày báo cáo:** 2026-08-10
**Phạm vi:** Backend NestJS + Frontend NextJS

---

## Tổng quan

| Trạng thái | Ý nghĩa |
|:---:|:---|
| ✅ | Hoàn thành đúng spec |
| ⚠️ | Partial — có backend nhưng chưa có UI hoặc ngược lại |
| 🔴 | Lệch — hoạt động không đúng spec |
| ❌ | Chưa triển khai |

---

## 1. Module: Nội dung học — FR-01

### Backend — ✅ Hoàn thành

| Entity | Controller | Routes | Spec |
|--------|-----------|--------|------|
| `hsk_levels` | `HskLevelController` | GET, GET/:id, POST, PATCH, DELETE | ✅ |
| `lessons` | `LessonController` | GET, GET/:id, POST, PATCH, DELETE | ✅ |
| `vocabularies` | `VocabularyController` | GET, GET/:id, POST, PATCH, DELETE | ✅ |
| `grammar_points` | `GrammarPointController` | GET, GET/:id, POST, PATCH, DELETE | ✅ |
| `lesson_contents` | `LessonContentController` | GET, GET/:id, POST, PATCH, DELETE | ✅ |
| `topics` | `TopicController` | GET, GET/:id, POST, PATCH, DELETE | ✅ |
| `topic_vocabularies` | `TopicVocabularyController` | GET, GET/:id, POST, PATCH, DELETE | ✅ |

### Frontend — ✅ Hoàn thành

| Route/Component | Spec | Trạng thái |
|---|---|---|
| `/admin/curriculum` | FR-01 §4.2 | ✅ |
| `/study/[lessonId]` | FR-01 §4.1 | ✅ |
| HSK level + lesson listing | FR-01 §4.1 | ✅ |
| Vocabulary display (Hán, pinyin, nghĩa, audio) | FR-01 §6 | ✅ |

---

## 2. Module: Kiểm tra & Luyện tập — PR-03/04/05/09/10/11/12/13

### Backend Practice Controllers — ✅ Hoàn thành

| Controller | Routes | Spec |
|-----------|--------|------|
| `PracticeQuestionController` | GET /practice-questions, GET/:id, POST, PATCH, DELETE | ✅ PR-09/10 |
| `PracticeAttemptController` | GET /practice-attempts, GET/:id, POST (start), PATCH (submit) | ✅ PR-03/04/09/10/11/12/13 |

### Backend Test Controllers — ✅ Hoàn thành

| Controller | Routes | Spec |
|-----------|--------|------|
| `TestController` | GET, GET/:id, POST, PATCH, DELETE | ✅ PR-05 |
| `TestQuestionController` | GET, GET/:id, POST, PATCH, DELETE | ✅ PR-05 |
| `TestAttemptController` | GET, GET/:id, POST (start), PATCH (submit), GET/:id/answers, POST /answers | ✅ PR-05 |
| `CoursesController` | GET /courses, GET/:id, POST, PATCH, DELETE | ✅ |
| `CourseLessonController` | GET /course-lessons, GET/:id, POST, PATCH, DELETE | ✅ |

### Frontend Practice Pages — ✅ Hoàn thành

| Route/Component | Spec | Trạng thái |
|---|---|---|
| `/games/flashcard` | PR-04 | ✅ (flashcard-mode.tsx) |
| `/games/listening` | PR-11 (Pinyin Balloon) | ✅ (balloon-mode.tsx) |
| `/games/match` | PR-03 (Word Matching) | ✅ (matching-mode.tsx) |
| `/games/memory` | PR-12 | ✅ (memory-mode.tsx) |
| `/games/sentence` | PR-10 | ✅ (sentence-ordering-mode.tsx) |
| `/games/stroke` | PR-13 (Hanzi Writing) | ✅ (writing-mode.tsx) |
| `/practice/lessons` | PR-03/04 | ✅ |
| `practice-engine.ts` | PR-03/04/09/10/11/12/13 | ✅ |

### Frontend Test Pages — ✅ Hoàn thành

| Route/Component | Spec | Trạng thái |
|---|---|---|
| `/teacher/tests` | PR-05 §4.1 | ✅ |
| `/teacher/tests/[testId]` | PR-05 §4.1 | ✅ |
| `/tests/[testId]` | PR-05 §4.2 | ✅ |
| `/tests/join` | PR-05 §4.2 | ✅ |
| `use-take-test.ts` | PR-05 §4.2 | ✅ (đã fix answer double-nest hôm nay) |

---

## 3. Module: Giới hạn lượt — PR-14

### Backend — ✅ Hoàn thành

| Controller | Routes | Spec |
|-----------|--------|------|
| `SubscriptionController` | GET /subscriptions, GET /subscriptions/me, GET/:id, POST, PATCH, DELETE | ✅ |
| `DailyUsageController` | POST /daily-usage/checkLimit | ✅ |
| `LimitSettingsController` | GET /limit-settings, PUT /limit-settings | ✅ |

### Frontend — ✅ Hoàn thành

| Route/Component | Spec | Trạng thái |
|---|---|---|
| `subscriptionApi.checkLimit()` | PR-14 §4.2 | ✅ |
| `subscriptionApi.me()` | PR-14 §4.2 | ✅ |
| `practice-engine.ts` (limit screen) | PR-14 §4.2 + §4.3 | ✅ |

**⚠️ Minor:** Spec PR-14 §3.4 đề xuất endpoint `GET /api/practice/limits/status` nhưng backend dùng `POST /daily-usage/checkLimit` — hoạt động đúng, chỉ khác tên route. Không ảnh hưởng chức năng.

---

## 4. Module: Tài nguyên & Thương mại — FR-24/25/26, FR-17, FR-08

### Backend — ✅ Hoàn thành

| Controller | Routes | Spec |
|-----------|--------|------|
| `ResourceController` | GET, GET/:id, POST, PATCH, DELETE | ✅ FR-24 |
| `ContactController` | POST /contact-requests (Public), GET, PATCH | ✅ FR-25 |
| `MistakeBookController` | GET, GET/:id, POST, DELETE | ✅ FR-17 |
| `VipUpgradeController` | GET, GET/:id, POST, PATCH (review) | ✅ FR-26 |
| `AiJobController` | GET, GET/:id, POST | ✅ FR-15/16 |
| `SpeakingController` | GET, GET/:id, POST, PATCH | ✅ FR-08 |

### Frontend — ✅ Hoàn thành

| Route/Component | Spec | Trạng thái |
|---|---|---|
| `/resources` | FR-24 | ✅ |
| `/contact` | FR-25 | ✅ |
| `/mistake-book` | FR-17 | ✅ |
| `/upgrade-vip` | FR-26 | ✅ |

---

## 5. Module: Chủ đề học — FR-02

### Backend — ✅ Có

| Entity | Controller | Routes |
|--------|-----------|--------|
| `topics` | `TopicController` | CRUD đầy đủ |
| `topic_vocabularies` | `TopicVocabularyController` | CRUD đầy đủ |

### Frontend — ❌ Chưa có UI riêng

- Spec FR-02 yêu cầu học "theo chủ đề (con vật, đồ ăn...)"
- Backend `TopicController` + `TopicVocabularyController` đã tồn tại
- Frontend có `/topics` và `/topics/[slug]` routes nhưng chưa rõ mức độ hoàn thiện so với spec
- Cần xem lại `topics/[slug]` page để xác nhận có hiển thị vocabulary theo topic không

---

## 6. Module: Courses (ngoài spec gốc)

| | Backend | Frontend |
|--|---------|---------|
| **Courses** | ✅ `CoursesController` + `CourseLessonController` | ⚠️ `coursesApi` mới thêm (2026-08-10), chưa có page |

---

## 7. API Mismatches — Đã fix hôm nay (2026-08-10)

### 🔴 Đã fix: `submitAnswer` double-nesting

| | Trước (sai) | Sau (đúng) |
|--|------------|------------|
| `use-take-test.ts:87-90` | `answer: { answer: a }` | `answer: a` |
| `endpoints.ts:228` | `answer?: Record<string,unknown>` | `answer?: unknown` |

**Nguyên nhân:** Frontend gửi `{ answer: { answer: actualValue } }` nhưng backend DTO `SubmitTestAnswerDto` expect `{ answer: actualValue }` flat. Backend đúng, frontend sai.

### ⚠️ Còn tồn tại: `SpeakingAttempt` — backend có, frontend mới có API

- `speakingApi` + `SpeakingAttempt` type vừa thêm vào endpoints.ts + types.ts
- UI chưa xây — FR-08 (luyện thi nói HSKK) chưa hoàn thiện

### ⚠️ Còn tồn tại: `CourseLesson` — backend có, frontend mới có API

- `coursesApi.listLessons()` vừa thêm
- Frontend `/dashboard/courses/[id]` route có tồn tại nhưng chưa rõ kết nối backend

---

## 8. Bảng tổng hợp theo Spec

| Spec | Mã | Backend | Frontend | Status |
|------|:---|:--------|:---------|:------:|
| Danh mục từ vựng/ngữ pháp | FR-01 | ✅ | ✅ | ✅ |
| Học theo chủ đề | FR-02 | ✅ | ⚠️ partial | ⚠️ |
| Nối từ Trung-Pinyin-Việt | PR-03 | ✅ | ✅ | ✅ |
| Flashcard | PR-04 | ✅ | ✅ | ✅ |
| Giáo viên tạo bài kiểm tra | PR-05 | ✅ | ✅ | ✅ |
| Điền chỗ trống | PR-09 | ✅ | ✅ | ✅ |
| Sắp xếp câu | PR-10 | ✅ | ✅ | ✅ |
| Game bắn bóng pinyin | PR-11 | ✅ | ✅ | ✅ |
| Game memory | PR-12 | ✅ | ✅ | ✅ |
| Luyện viết chữ Hán | PR-13 | ✅ | ✅ | ✅ |
| Giới hạn lượt (Free 3/bài/ngày) | PR-14 | ✅ | ✅ | ✅ |
| Sổ lỗi sai | FR-17 | ✅ | ✅ | ✅ |
| Thư viện tài liệu (PPT) | FR-24 | ✅ | ✅ | ✅ |
| Liên hệ tư vấn | FR-25 | ✅ | ✅ | ✅ |
| Đăng ký nâng cấp VIP | FR-26 | ✅ | ✅ | ✅ |
| Luyện thi nói HSKK | FR-08 | ✅ | ⚠️ API mới, UI pending | ⚠️ |
| AI tạo câu chuyện | FR-15 | ✅ | ⚠️ pending UI | ⚠️ |

---

## 9. Các vấn đề cần giải quyết

### Cao — Cần fix sớm

| # | Issue | Ghi chú |
|---|-------|---------|
| 1 | **FR-02 UI chưa rõ ràng** — Topics page hoạt động đến đâu? | Cần review `/topics/[slug]` page |
| 2 | **Speaking UI chưa có** — FR-08: học sinh ghi âm + giáo viên chấm | Backend ready, UI pending |
| 3 | **Courses UI chưa kết nối** — `/dashboard/courses/[id]` dùng data gì? | Backend ready, cần kết nối `coursesApi` |

### Thấp — Cải thiện dần

| # | Issue | Ghi chú |
|---|-------|---------|
| 4 | PR-14 route name khác spec (`/daily-usage/checkLimit` vs `/practice/limits/status`) | Hoạt động đúng, chỉ khác tên |
| 5 | `UserController` `@Roles(Role.ADMIN)` nhưng `updateUser` exposed trong `resourceApi` | 403 cho non-admin — đã document |

---

## 10. Đánh giá tổng thể

```
Tiến độ hoàn thành: ~85%

✅ Backend hoàn thiện:  8/8 modules (auth, curriculum, practice, test, subscription, resources, courses, audio)
✅ Frontend hoàn thiện:  6/6 core features (curriculum, practice games x6, test, resources)
⚠️ Partial:              3 items (FR-02 topics UI, FR-08 speaking UI, courses page)
```

**Kết luận:** Hệ thống MVP cơ bản đã hoạt động. 3 vấn đề còn tồn tại đều là UI-level, backend đã sẵn sàng. Priority tiếp theo: kết nối courses page với backend, xây speaking UI, kiểm tra topics page.
