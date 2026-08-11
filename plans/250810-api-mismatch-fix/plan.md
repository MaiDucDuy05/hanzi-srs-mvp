# Plan: API Mismatch Fix — Frontend vs Backend Alignment

## Overview

Fix critical and medium API mismatches found between frontend API calls (`frontend/src/lib/api/endpoints.ts`) and backend NestJS controllers.

---

## Issues Summary

| # | Issue | Severity | Files |
|---|-------|----------|-------|
| 1 | `submitAnswer` — `answer` double-nested: FE sends `{ answer: { answer: a } }` but BE expects `{ answer: actualValue }` | 🔴 CRITICAL | `frontend/src/features/tests/components/use-take-test.ts`, `frontend/src/lib/api/endpoints.ts` |
| 2 | `Course`/`CourseLesson` — no frontend API, backend exists | 🟡 MEDIUM | `frontend/src/lib/api/endpoints.ts` (missing) |
| 3 | `SpeakingAttempt` — backend exists, no frontend | 🟡 MEDIUM | `frontend/src/lib/api/endpoints.ts` (missing) |
| 4 | `UserController` `@Roles(Role.ADMIN)` — FE exposes `updateUser` but non-admin gets 403 | 🟡 MEDIUM | `frontend/src/lib/api/endpoints.ts` vs `backend/src/modules/auth/user.controller.ts` |

---

## Phase 1 — Fix Critical Mismatch (submitAnswer)

### Step 1.1: Fix `endpoints.ts` submitAnswer type & body

**File:** `frontend/src/lib/api/endpoints.ts`

The `submitAnswer` signature currently accepts `answer?: Record<string, unknown>` and passes it as-is inside `{ questionId, answer: { answer: a } }` (double-nested).

Fix: accept `answer?: unknown` directly and send flat structure.

```typescript
submitAnswer: (attemptId: string, data: { questionId: string; answer?: unknown }) =>
  unwrap(apiFetch<Single<TestAnswer>>(`/test-attempts/${attemptId}/answers`, {
    method: 'POST',
    body: JSON.stringify({ questionId: data.questionId, answer: data.answer }),
  })),
```

### Step 1.2: Fix `use-take-test.ts` call site

**File:** `frontend/src/features/tests/components/use-take-test.ts:87-90`

```typescript
// BEFORE (double-nested):
await testApi.submitAnswer(attemptId!, {
  questionId: q.id,
  answer: { answer: a },  // ← wrong
});

// AFTER (flat — matches backend DTO):
await testApi.submitAnswer(attemptId!, {
  questionId: q.id,
  answer: a,  // ← correct
});
```

**Security:** No security impact — this is a data-shape fix. Backend DTO uses `@IsOptional() answer?: Record<string, unknown>` which accepts any object. Client-side input is preserved as-is.

### Step 1.3: Verify backend DTO accepts the shape

**File:** `backend/src/modules/test/dto/test.dto.ts`

```typescript
export class SubmitTestAnswerDto {
  @IsUUID() questionId: string;
  @IsOptional() answer?: Record<string, unknown>;  // ← flat, correct
}
```

Backend already expects flat `{ answer: actualValue }`. No backend change needed.

---

## Phase 2 — Add Missing Frontend APIs

### Step 2.1: Add `Course` type to frontend types

**File:** `frontend/src/lib/api/types.ts`

The `Course` interface already exists. Verify it's complete:

```typescript
export interface Course {
  id: string;
  name: string;
  description: string | null;
  audience: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}
```

### Step 2.2: Add `coursesApi` to endpoints

**File:** `frontend/src/lib/api/endpoints.ts`

Add after the existing `resourceApi`:

```typescript
export const coursesApi = {
  list: (params: { status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Course>>(`/courses${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  get: (id: string) => unwrap(apiFetch<Single<Course>>(`/courses/${id}`)),

  listLessons: (params: { courseId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<CourseLesson>>(`/course-lessons${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),
};
```

### Step 2.3: Add `SpeakingAttempt` type and `speakingApi`

**File:** `frontend/src/lib/api/types.ts`

Add:

```typescript
export type SpeakingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface SpeakingAttempt {
  id: string;
  userId: string;
  audioKey: string;
  status: SpeakingStatus;
  score: number | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**File:** `frontend/src/lib/api/endpoints.ts`

Add:

```typescript
export const speakingApi = {
  list: (params: { userId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<SpeakingAttempt>>(`/speaking-attempts${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  create: (data: { audioKey: string }) =>
    unwrap(apiFetch<Single<SpeakingAttempt>>('/speaking-attempts', { method: 'POST', body: JSON.stringify(data) })),
};
```

**Security note:** Backend `SpeakingAttemptController` requires auth — `apiFetch` attaches cookie automatically. No `@Public()` on endpoints.

---

## Phase 3 — Document Admin-Only `updateUser` Gap

### Step 3.1: Add comment to `resourceApi.updateUser`

**File:** `frontend/src/lib/api/endpoints.ts`

The `updateUser` function maps to `PATCH /users/:id` which is `@Roles(Role.ADMIN)` on the backend. Non-admin users will receive 403. Add a comment clarifying this is admin-only:

```typescript
// Admin-only — returns 403 for non-admin users.
updateUser: (id: string, data: Partial<User>) =>
  unwrap(apiFetch<Single<User>>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),
```

---

## Implementation Order

- [x] **Phase 1**: Fix critical `submitAnswer` mismatch (endpoints.ts + use-take-test.ts)
- [x] **Phase 2**: Add `coursesApi` and `speakingApi` to endpoints.ts + types
- [x] **Phase 3**: Add admin-only comment to `updateUser`
- [x] **Verify**: Run `npm run build` on frontend — ✅ Compiled successfully
- [ ] **Verify**: Run backend tests if any exist

## Dependencies

- None — changes are isolated to frontend API layer
- Backend requires no changes for Phase 1 (DTO already correct)
- Phase 2 requires backend controllers already exist (confirmed)

## Risk Assessment

- **Phase 1**: Low risk — fixes data shape mismatch. Run build after.
- **Phase 2**: Low risk — adds new API bindings, no existing code changes.
- **Phase 3**: Informational only — no code change.
