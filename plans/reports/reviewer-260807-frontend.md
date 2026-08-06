# Frontend Review — hanzi-srs-mvp (Next 16.3 / React 19 / Tailwind v4 / TS strict)

Scope: `frontend/src/**`. Findings ranked most-severe first. Each verified against the NestJS backend (`backend/src`).

---

## 1. [CRITICAL] Test auto-submit on timer expiry submits a BLANK attempt (stale closure)

**File:** `src/app/tests/[testId]/page.tsx:71-85` (timer) + `87-141` (`submit`)

The interval closes over the `submit` instance captured at the render where `phase` became `'running'`. That instance's `useCallback` deps (`[answers, attemptId, elapsed, questions]`) were frozen at that moment: `answers = {}`, `elapsed = 0`. The user answers questions afterward, re-renders create new `submit` closures, but the interval (deps `[phase, test]`, unchanged) keeps calling the original one from inside the `setElapsed` updater.

**What breaks:** when the timer hits `timeLimitMinutes*60`, `submit()` runs with empty `answers` → no `submitAnswer` calls, `duration = elapsed || 1 = 1`, local grading yields 0%. The attempt is then closed server-side (status SUBMITTED), consuming the student's single attempt.

**Failing scenario:** student spends 30 min answering a 30-min test, lets the clock run out → auto-submit sends zero answers, final screen shows 0% and "Câu đúng 0/N"; backend records the attempt as submitted with duration 1s. Manual "Nộp bài" works (fresh closure), so the bug only hits on timeout — i.e. the exact case the timer exists for.

**Fix:** read live values via refs (e.g. `answersRef`/`elapsedRef`) inside `submit`, or have the timer call `submitRef.current()` where `submitRef` is updated every render. Also move the `void submit()` call out of the `setElapsed` updater (side effect in a state updater is unsafe and double-invoked under StrictMode/concurrency; currently only masked by `submittingRef`).

---

## 2. [HIGH] Profile & Resources pages broken for all non-admin users (403 on `/subscriptions`)

**Files:**
- `src/app/profile/page.tsx:31` — `subscriptionApi.list({ userId: user.id })`
- `src/app/resources/page.tsx:26` — `subscriptionApi.list({ userId: user.id })`
- `src/app/upgrade-vip/page.tsx:35` — `resourceApi.listVipRequests({ userId: user.id })` (breaks history card)

**Backend:** `GET /subscriptions` is `@Roles(Role.ADMIN)` (`backend/src/modules/subscription/subscription.controller.ts:12`); `GET /vip-upgrade-requests` is `@Roles(Role.ADMIN)` (`vip-upgrade-request.controller.ts:13`). RolesGuard is registered globally (`app.module.ts`).

**What breaks:** profile and resources pages fire `subscriptionApi.list(...)` in a `Promise.all`; the 403 rejects the whole batch → both pages render the global error state for every FREE/TEACHER user (the majority). upgrade-vip loses its request history and shows an error banner.

**Failing scenario:** a fresh FREE user opens `/profile` → `GET /subscriptions?userId=...` → 403 → "Có lỗi xảy ra"; profile content never renders. Same for `/resources`.

---

## 3. [MEDIUM-HIGH] Answer key exposed to test-takers (client-side grading)

**File:** `src/app/tests/[testId]/page.tsx:45-50,104-127`

`testApi.listQuestions({ testId })` returns full `TestQuestion` entities; `backend/.../test.service.ts:36-42` (findAll) does not strip `correctAnswer`. The test page then grades locally using `q.correctAnswer`.

**What breaks:** test integrity. A student can open DevTools, inspect the `/test-questions?testId=...` response, and read every correct answer before/during the test.

**Failing scenario:** any student doing a graded test clicks the Questions tab in Network tab → all `correctAnswer` values visible → can answer 100% without knowing the material. MVP design decision ("backend chưa tính điểm"), but for a scored, attempt-limited test this is a real integrity hole; at minimum flag for backend to exclude `correctAnswer` from the student-facing list endpoint.

---

## 4. [MEDIUM-HIGH] Writing mode double-advance: "skip" during the 900 ms completion window skips a character

**File:** `src/components/games/writing-mode.tsx:36-62,99-101`

`handleDone` sets `feedback:'done'` and schedules `advance(true)` in 900 ms. The "Chữ này khó — bỏ qua" button has **no `disabled={feedback === 'done'}`** guard, and the pending timeout is never cancelled.

**What breaks:** skip during the done-window runs `advance(false)` (index k→k+1), then the still-pending timeout runs `advance(true)` with the old closure (index k→k+1 again) → the next character is skipped entirely and counters are inflated.

**Failing scenario:** user writes a character correctly (onComplete), then within ~0.9 s clicks "bỏ qua" → two advances fire; the following character never appears, `correct`/`wrong` both increment.

---

## 5. [MEDIUM] Expired/invalid token is never detected; user gets stuck

**Files:** `src/lib/api/client.ts:56-95`, `src/lib/auth/auth-context.tsx:40-44`, guards (`auth-guard.tsx`, `teacher-guard.tsx`, `admin-guard.tsx`)

`AuthProvider` blindly trusts `localStorage` user/token on mount; `apiFetch` has no 401 handling (no `clearAuth`/redirect on `ApiError(401)`), and guards only check the locally stored role.

**What breaks:** after token expiry, every API call returns 401 → pages show error states; guards still consider the user "logged in" so they never redirect to `/login`. Recovery requires manual logout.

**Failing scenario:** user's JWT expires mid-session (e.g. next-day visit) → opens `/learn`, `/practice`, `/profile` → all error out; navbar still shows them as logged in; only the "Thoát" button recovers the session.

---

## 6. [MEDIUM] `testApi.listAnswers` returns the envelope, not the array

**File:** `src/lib/api/endpoints.ts:219-220`

`apiFetch<TestAnswer[]>(...)` is not wrapped in `unwrap()`, but the backend returns `{ data: [...], message }` (`test.controller.ts:48` via `ok()`). The promise resolves to the envelope object cast as `TestAnswer[]`.

**Impact:** latent — the function is currently unused in `src/`. Any future caller (e.g. a "review answers" screen) will iterate over `{data, message}` and break. Fix: `.then(unwrap)`.

---

## 7. [MEDIUM] Daily-practice limit slot consumed before the attempt actually starts

**File:** `src/components/practice/practice-engine.ts:87-102`

`subscriptionApi.checkLimit(...)` hits backend `checkAndIncrement`, which **increments** `usedCount` server-side (`backend/.../subscription.service.ts:74-76`) — before `practiceApi.start(...)`. If `start` throws or the user navigates away during loading, the free slot is burned; a retry consumes another.

**Failing scenario:** FREE user (limit 3) clicks a practice type; backend returns 500 on `POST /practice-attempts` → slot 1 of 3 consumed with no attempt recorded; user retries → slot 2 consumed.

---

## 8. [LOW] Audio playback 404s — no `/api/audio` route or rewrite

**File:** `src/components/ui/audio-button.tsx:24`

`url = /api/audio/${audioKey}`. There is no `src/app/api` route handler and `next.config.ts` has no rewrite/proxy. The relative URL hits the Next app origin (port 3000), not the backend, and 404s.

**Failing scenario:** any AudioButton (lesson pages, topics, flashcard, fill-blank, writing) is clicked → 404, no sound.

---

## Notes (verified, not bugs)

- **XSS:** the only `innerHTML` usage is `containerRef.current.innerHTML = ''` (clear) in `hanzi-writer-canvas.tsx:35,66` — safe; no `dangerouslySetInnerHTML` anywhere; all user/DB text is rendered via JSX escaping.
- **Token exposure:** JWT lives in `localStorage` (XSS-stealable — standard for this stack) but is never placed in URLs/query strings. No query-string token leaks found.
- **`useSearchParams`:** only in `practice/page.tsx` and `games/page.tsx`, both wrapped in `<Suspense>`. OK.
- **Guards:** no redirect loops — unauthenticated → `/login`, wrong role → `/`, and no guarded page is a login target. OK.
- **Envelope contract:** single `{data, message}` and paginated `{data, meta, message}` match the backend `ok()` helper; `listAnswers` is the one mismatch (finding 6).
- **`tsc --noEmit`:** passes clean; no compile errors.
- **Double-click guards** in fill-blank/ordering/balloon/memory are mitigated by re-render + `disabled` in practice; the only reachable variant of the stale-guard race is the writing-mode one (finding 4).

## Unresolved questions

- Is `/api/audio` meant to be served by the backend at a different path (e.g. `/api/v1/audio/:key`) or proxied in deployment (nginx)? If so, finding 8 is dev-only.
- Should `checkLimit` semantics change to "check-only" (no increment) with a separate increment on `start`? (finding 7)

---

## Resolution log (2026-08-07)

| # | Verdict | Action |
| :--- | :--- | :--- |
| 1 | CONFIRMED | **Fixed.** Timer restructured: `submit` declared first, `submitRef` synced via effect, deadline via `setTimeout` calling `submitRef.current()`; side-effect moved out of the `setElapsed` updater. |
| 2 | CONFIRMED | **Fixed.** Profile/resources/upgrade-vip no longer call admin-only endpoints for non-admin users (role-guarded, 403-tolerant); plan card shows "quản lý bởi admin" fallback; resources VIP gating uses role proxy (Teacher/Admin per BRD matrix) since backend lacks a self-service entitlement endpoint. |
| 3 | CONFIRMED (backend) | **Documented.** Backend `GET /test-questions` returns `correctAnswer`; client grading required for MVP. Backend work: strip `correctAnswer` for student-facing list. |
| 4 | CONFIRMED | **Fixed.** `doneTimerRef` cancels pending advance on skip/unmount; skip button `disabled` during the 900ms done-window. |
| 5 | CONFIRMED | **Fixed.** `apiFetch` on 401 (auth requests only) clears auth + dispatches `hanzi:unauthorized`; AuthProvider listens and nulls user/token → guards redirect to `/login`. |
| 6 | CONFIRMED | **Fixed.** `listAnswers` now `unwrap()`s the envelope. |
| 7 | CONFIRMED (backend) | **Documented.** Backend `POST /daily-usage/checkLimit` increments (`checkAndIncrement`) while `POST /practice-attempts` does not enforce limits — frontend must call checkLimit as the gate, so a failed `start` burns a slot. Backend work per PR-14 §3.2: make increment + attempt creation atomic in one transaction. |
| 8 | CONFIRMED | **Mitigated.** AudioButton base URL now from `NEXT_PUBLIC_AUDIO_BASE_URL` (default `/api/audio`); adds `error` listener + `play().catch()` so missing audio degrades gracefully instead of hanging. Actual audio serving (S3/CDN) is backend infra work. |
