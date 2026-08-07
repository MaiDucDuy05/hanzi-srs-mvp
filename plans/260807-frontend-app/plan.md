# Plan: HSK Learning Platform — Frontend App (MVP)

**Date:** 2026-08-07
**Folder:** `frontend/` (Next.js 16.3.0, App Router, Tailwind v4, TypeScript)
**Backend API:** `http://localhost:8000/api/v1` (NestJS; JWT-protected; `{ data, message }` envelope)

## Scope
Build learner-facing MVP + teacher test tool + basic admin, wired to the real NestJS API.
Practice/game grading happens client-side because the current backend only stores attempts
(`practice-attempts` start/submit accept `score` from client; no server grading yet).

## Rendering strategy
- Data pages = **Client Components** fetching via a shared API client.
  Auth qua **HttpOnly cookie** `access_token` (backend set `Set-Cookie`; xoá `TOKEN_KEY` + interceptor gắn header 2026-08-07).
  Profile nạp từ `GET /auth/me` theo cookie; `credentials: 'include'` + rewrite `/api/v1` → backend (same-origin, cookie auto-send).
- Hub/static pages = Server Components.
- `loading.tsx` / `error.tsx` boundaries per async route segment.

## Routes
| Area | Routes |
|---|---|
| Auth | `/login`, `/register` |
| Home | `/` dashboard hub |
| Learn (FR-01) | `/learn`, `/learn/[levelCode]`, `/learn/[levelCode]/[lessonId]` |
| Topics (FR-02) | `/topics`, `/topics/[slug]` |
| Practice (PR-03,04,09,10) | `/practice`, `/practice/matching`, `/practice/flashcards`, `/practice/fill-blank`, `/practice/sentence-ordering` (+ `/[attemptId]` each) |
| Writing (PR-13) | `/practice/hanzi-writing` (+ `/[attemptId]`) |
| Games (PR-11,12) | `/games/pinyin-balloon`, `/games/memory` (+ `/[attemptId]` each) |
| Tests (PR-05) | `/tests/join`, `/tests/[id]`, `/tests/[id]/attempt/[attemptId]`, `/tests/results/[attemptId]` |
| Teacher | `/teacher/tests`, `/teacher/tests/new`, `/teacher/tests/[id]/edit`, `/teacher/tests/[id]/results` |
| Admin | `/admin/curriculum`, `/admin/curriculum/lessons/[id]`, `/admin/topics`, `/admin/topics/[id]`, `/admin/practice-questions`, `/admin/practice-questions/[id]` |
| Misc | `/resources`, `/contact`, `/upgrade-vip`, `/mistake-book`, `/profile` |

## Key lib modules
- `lib/api/client.ts` — fetch wrapper (cookie HttpOnly, credentials include, no header), ApiError, `data` unwrap
- `lib/api/types.ts` — API entity types mirroring backend entities
- `lib/api/endpoints.ts` — typed endpoint functions (+ `authApi.me`, `authApi.logout`)
- `lib/auth/auth-context.tsx` — AuthProvider (login/register/logout; user từ `/auth/me`; lắng nghe `hanzi:unauthorized`)
- `lib/hooks/use-api.ts` — `useApi` fetch hook
- `lib/utils/*` — cn, pinyin normalizer, format, storage, constants

## Dependencies to add
- `hanzi-writer`, `hanzi-writer-data` (PR-13)

## Verification
- `next build` zero type errors
- Manual smoke against running backend
- `tester` + `code-reviewer` agents

## Batch: architecture hardening (2026-08-07, sau /architecture-designer)
Implement từ đề xuất review kiến trúc — chi tiết: `plans/reports/architect-review-260807-frontend.md` (resolution log).
- **P2-8** `session-frame.tsx` (LimitScreen + SummaryCard) dùng chung practice & games
- **P2-7** `usePracticeEngine<TState>` generic (union state ở session/games)
- **P1-4** cancelled-flag chống setState sau unmount: learn/profile/tests-join/resources
- **P2-9** `EntityManager` hỗ trợ update + wire update API 6 entity admin
- **P2-6** tách `tests/[testId]` → `use-take-test.ts` + `test-result-card.tsx` + `test-question-nav.tsx`
- **FE-008** `client.test.ts` (11 test transport; tổng vitest 19→30)
- **FE-006** FIXED (2026-08-07, sau khi auth chuyển sang HttpOnly cookie): `src/proxy.ts` (tên mới của middleware trong Next 16) — đọc cookie `access_token`, chặn route sớm + role gate `/admin` (ADMIN) `/teacher` (TEACHER/ADMIN), redirect `/login?next=`; `src/lib/auth/server-auth.ts` `getServerUser()` — RSC fetch `/auth/me` server-side qua cookie (không lộ JWT vào URL); 4 trang public `/`, `/contact`, `/login`, `/register` thành Server Component + 3 client islands (`LoginForm`/`RegisterForm`/`ContactForm`) + metadata SEO. Verify: tsc/eslint/vitest 29/29/build 23/23 + smoke proxy (307 redirect các case).
- **Deferred:** FE-007 codegen types (backend chưa có Swagger)
