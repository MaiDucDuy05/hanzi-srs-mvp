# Code Review — Backend Hardening (PR-05 / PR-14) + Frontend Alignment

Reviewer: code-reviewer · 2026-08-07 · Commit `af84946`
Scope: server-side test grading, atomic daily-limit consumption, self-service subscription, audio serving, frontend alignment.
Verification performed: `tsc --noEmit` clean on backend + frontend; `jest` 6/6 pass; route/param matching, unique indexes, ownership, concurrency traced against `001-initial-schema.ts` migration.

---

## Findings

### 1. HIGH — test.service.ts:261 `TestAnswerService.submitAnswer` + :206 `submit` — cross-test answer injection inflates score
`submitAnswer` loads the question by `dto.questionId` and grades it, but **never verifies `question.testId === attempt.testId`** (FK `test_answers.question_id → test_questions(id)` allows any question). `submit` then computes `earned = Σ pointsAwarded` over **all** stored answers (line 222) while `totalPoints` only sums the attempt's own test questions (line 221).
**Failure:** A student starts test T1 (1×1pt question), then `POST /test-attempts/{id}/answers` with questionIds from other published tests (IDs enumerable via `GET /tests` + `GET /test-questions`). Each injected answer graded correct (e.g. guessed TRUE_FALSE) adds to `earned` without adding to `totalPoints` → `score` exceeds 100 / is arbitrarily inflated. DB-level and API-level both permit it.
**Fix:** In `submitAnswer`, reject `question.testId !== attempt.testId` (400). In `submit`, join answers to the test's questions (filter by `question.testId === test.id`) before summing `earned`.

### 2. HIGH — test.controller.ts:122/:125 (test.service.ts:160-176) — attempt metadata IDOR
`GET /test-attempts` and `GET /test-attempts/:id` have **no ownership or role check**. `findAll` filters by the client-supplied `?userId=`, so any authenticated user can enumerate any other user's attempts (testId, status, score, duration). `findOne` returns any attempt by id. This directly contradicts the PR-05 ownership goal — the answers endpoint (`findByAttempt`) was scoped (owner/TEACHER/ADMIN) but the parent attempts were not; profile page depends on this leak by passing its own `userId`.
**Fix:** In `findAll`, force `where.userId = jwt.sub` (ignore client param) unless role is TEACHER/ADMIN; restrict `testId` enumeration to TEACHER/ADMIN or to the caller's own attempts. In `findById`, 403 unless owner/TEACHER/ADMIN (mirror `findByAttempt`).

### 3. MEDIUM — practice.service.ts:78/:139 — same IDOR pattern + submit has no ownership
`PracticeAttemptService.findAll` filters by client `?userId=` (any user reads another's practice history). `submit(id, dto)` has **no ownership check at all** — any authenticated user can `PATCH /practice-attempts/{victimId}` and force another user's in-progress attempt to `COMPLETED` with arbitrary score (kills the victim's active session; corrupts their record). Pre-existing code, but it sits inside this hardening batch's ownership theme.
**Fix:** Mirror the test module: scope `findAll` to owner unless TEACHER/ADMIN; require `attempt.userId === jwt.sub` in `submit`.

### 4. MEDIUM — frontend tests/[testId]/page.tsx:118 — `timeLimitMinutes: 0` instant auto-submit
`setTimeout(submit, test.timeLimitMinutes * 60 * 1000)`. `timeLimitMinutes` defaults to 0 in the DB and is optional in `CreateTestDto`. With 0, `setTimeout(fn, 0)` auto-submits ~immediately after "Bắt đầu" (0 answers, score 0); the info screen also shows "0 phút". No "no time limit" semantics exist.
**Fix:** Guard `if (test.timeLimitMinutes > 0)` before scheduling the deadline (treat 0 as unlimited), or enforce `@Min(1)` on the DTO and in the teacher form.

### 5. MEDIUM — subscription.service.ts:144 `peek` — Teacher/Admin not exempt (inconsistent with :171 `consumeInTransaction`)
`consumeInTransaction` exempts TEACHER/ADMIN (and VIP) from consuming; `peek` only checks VIP. A Teacher/Admin whose usage row exists at/over the free limit gets `allowed:false` from `/daily-usage/checkLimit`, so the frontend shows the limit screen and never calls `start()` (which would succeed).
**Fix:** Pass `role` into `peek` and exempt TEACHER/ADMIN, or skip the pre-check for those roles on the client.

### 6. MEDIUM — resources VIP gate is client-side only (resource.service.ts:findById returns `fileKey` to anyone)
The new resources page gates download buttons on `subscriptionApi.me()`/role, but `GET /resources/:id` returns the full resource incl. `fileKey` to any authenticated user. The moment a fileKey is a public URL/CDN link, FREE users can bypass the VIP gate by calling the API directly. (Resources backend not modified in this batch — flagging because the frontend change builds on it.)
**Fix:** Strip `fileKey` server-side unless VIP/Teacher/Admin; serve files through an authorized endpoint instead of returning raw URLs.

### 7. LOW — subscription.service.ts:199-211 — 429 on rollback edge in `consumeInTransaction`
If the concurrent winner inserts the usage row then rolls back its whole transaction, the loser's catch-path re-`SELECT FOR UPDATE` returns null → falls into `!usage` → throws 429 although the user should have been allowed.
**Fix:** On null re-select, retry the insert once (or treat null as allowed since no committed row exists).

### 8. LOW — subscription.dto.ts:41 `CheckPracticeLimitDto` requires `userId` that the controller ignores
Controller uses `@CurrentUser('sub')`; body `userId` is dead. Client must send a UUID that is never validated against the JWT — confusing contract; if omitted → 400 despite being unneeded.
**Fix:** Drop `userId` from the DTO (server derives from JWT).

### 9. LOW — `showScoreImmediately:false` not enforced server-side
Frontend finished-screen hides the score, but the score is still computed/stored and served to the student via `GET /test-attempts` / `:id` and displayed on profile/page.tsx:154. "Điểm sẽ được giáo viên công bố" is cosmetic.
**Fix:** If the requirement is true score-hiding, omit `score` from non-TEACHER/ADMIN responses when `showScoreImmediately=false`.

### 10. LOW — concurrent `start`/`submitAnswer` races → 500
Two concurrent `POST /test-attempts` for same test+user both pass the `submittedCount` check → second insert violates `uq_test_attempts_active` (partial unique) → unhandled `QueryFailedError` → 500. Same for concurrent `submitAnswer` upsert (find-then-save) on `uq_test_answers_attempt_question`. Pre-existing.
**Fix:** Catch unique-violation and map to 409/return the existing entity.

### 11. LOW — audio.controller.ts:26 `sanitizeKey` restricts to `[A-Za-z0-9._-]`
Non-ASCII filenames (Chinese chars, Vietnamese diacritics e.g. `nước.mp3`, spaces) → 400, and `@Get(':key')` won't match encoded `/`. Path-traversal protection itself is solid (regex + `..`/`\`/`/`/NUL rejection + `absPath.startsWith(storageDir)` belt-and-braces; Express 5 `:key` single-segment). Verify the actual `audioKey` naming convention (pinyin/ID-based?) before relying on this.
Also stale comment frontend audio-button.tsx:6 ("backend chưa có route phát audio").

### 12. LOW — misc
- Unused `NotFoundException` import: practice.service.ts:3, test.service.ts:3.
- `today()` uses UTC; `resetTimezone` setting (`Asia/Ho_Chi_Minh`) is defined but never applied — daily reset happens at UTC midnight, not the configured TZ. Documented as MVP but note it.
- practice-engine.ts:102 generates a fresh `idempotencyKey: uuid()` per start; backend idempotency only helps if the same key is reused. A start that times out client-side then reloads → new key → double attempt count. Consider persisting the key until first success.

---

## Verified OK (no action)
- `gradeQuestion` + `stripAnswers` logic correct; tests cover SINGLE_CHOICE/TRUE_FALSE/SHORT_ANSWER incl. normalization edge cases. TRUE_FALSE bool vs string coercion matches both teacher-form (`{answer:true}`) and student submission.
- `consumeInTransaction` row-lock concurrency: lost-update prevented for existing rows; insert race handled via unique-violation catch + re-lock; rollback refunds usage (attempt-insert failure → usage increment rolls back); 429 thrown before increment; max `usedCount == freeLimit`. No deadlock risk (single-table, consistent lock order).
- Idempotency: sequential retry with same key returns existing attempt without consuming (pre-check outside txn is safe for the intended reuse pattern).
- `GET /subscriptions/me` declared before `:id`; `:id` scoped to owner/ADMIN. `/daily-usage/checkLimit` route matches frontend exactly (`@Post('checkLimit')`). VIP/role exemption consistent with BRD matrix on the resources page.
- Audio: MIME by extension, Range via `res.sendFile`, 404 JSON fallback when headers unsent; `@Public()` respected by JwtAuthGuard; rewrite `/api/audio/:path*` → backend correct.
- `TestAnswerService.findByAttempt` owner/TEACHER/ADMIN scoping correct; `submit` ownership + IN_PROGRESS transition correct; compile clean; 6/6 backend tests pass.

---

## Unresolved questions
1. What is the actual naming convention of `audioKey` values (ASCII/pinyin vs Chinese/Vietnamese)? If non-ASCII, audio.controller sanitize will 400 and break pronunciation playback.
2. Is `timeLimitMinutes: 0` an intended "no limit" value? Product decision needed — current behavior instant-submits.
3. Should Teacher/Admin be exempt at the `peek` pre-check too, or is the pre-check intentionally free-tier-only?
4. Is showing the student's own auto-computed score on the profile page acceptable when `showScoreImmediately=false` (teacher-announced scores)?
5. Confirm the test-attempts list endpoint must stay open for the teacher results flow — the fix in finding #2 must not break teacher's `listAttempts({testId})`.
