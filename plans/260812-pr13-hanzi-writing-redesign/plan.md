# PR-13 Redesign Plan: Hanzi Writing Practice

## Context

Current `stroke-game-feature.tsx` is a placeholder — raw canvas drawing, no Hanzi Writer, no backend integration. PR-13 spec (`docs/modules/test-engine/pr-13.md`) requires:

- Hanzi Writer quiz with stroke-order validation
- Session management (start/complete) via backend
- Reuse `practice_attempts` table with `practiceType = HANZI_WRITING`
- Client-side `hanzi-writer` + custom char data loader (already exists ✅)
- Existing `writing-sec.ts` + `writing-mode.tsx` + `hanzi-writer-canvas.tsx` as foundation

---

## What's Already Built ✅

| File | Status |
|---|---|
| `hanzi-writer-canvas.tsx` | ✅ Full Hanzi Writer integration, dynamic import, quiz callbacks |
| `char-data-loader.ts` | ✅ Fetches from `/hanzi-data/<char>.json` with cache |
| `writing-sec.ts` | ✅ State machine: idle→playing→feedback→completed |
| `writing-mode.tsx` | ✅ React wrapper around WritingSec + HanziWriterCanvas |

## What's Missing ❌

### Backend (NestJS)
- `hanzi-writing.service.ts` — session logic, char validation
- `hanzi-writing.controller.ts` — 3 endpoints per spec
- `hanzi-writing.dto.ts` — Start/Complete DTOs
- `PracticeType.HANZI_WRITING` already in enum ✅

### Frontend API
- `hanziWritingStart(params)` — POST `/practice/hanzi-writing/start`
- `hanziWritingComplete(attemptId, data)` — POST `/practice/hanzi-writing/:attemptId/complete`
- Types: `HanziWritingStartResult`, `HanziWritingCompleteResult`

### Frontend Routes & Features
- `/practice/hanzi-writing/page.tsx` — Selection page
- `/practice/hanzi-writing/[attemptId]/page.tsx` — Practice page
- `hanzi-writing-selection-feature.tsx` — Source picker (HSK/lesson/topic)
- `hanzi-writing-practice-feature.tsx` — Full practice flow using WritingMode
- Navbar update: add Hanzi Writing to games menu

### Integration
- `practice-engine.ts` — add `HANZI_WRITING` branch
- `hanzi-writer` package install
- `/public/hanzi-data/` setup script

---

## Architecture

```mermaid
graph TD
    subgraph Frontend
        SEL[Selection Page<br/>/practice/hanzi-writing]
        PP[Practice Page<br/>/practice/hanzi-writing/[attemptId]]
        SEL --> PP
        PP --> PENG[practice-engine.ts<br/>HANZI_WRITING branch]
        PENG --> HWS[WritingSec<br/>writing-sec.ts]
        HWS --> HWC[HanziWriterCanvas<br/>hanzi-writer-canvas.tsx]
    end

    subgraph Backend
        START[POST /practice/hanzi-writing/start]
        COMPLETE[POST /practice/hanzi-writing/:id/complete]
        GET[GET /practice/attempts/:id]
        START --> AS[AttemptService<br/>consume PR-14]
        COMPLETE --> HWSVC[HanziWritingService]
        HWSVC --> PA[(practice_attempts<br/>HANZI_WRITING)]
    end

    PENG -->|start| START
    PENG -->|complete| COMPLETE
    HWC -->|quiz callbacks| HWS
    HWS -->|onComplete| PENG
```

---

## Files to Create / Modify

### Backend — New Files
1. **`backend/src/modules/practice/hanzi-writing.dto.ts`**
   - `StartHanziWritingDto` — `{ levelId?, lessonId?, topicId? }` (source selection)
   - `CompleteHanziWritingDto` — `{ characters: { char, mistakes, skipped }[], durationSeconds }`

2. **`backend/src/modules/practice/hanzi-writing.service.ts`**
   - `start()` — resolve chars from vocab, validate against char data, return list
   - `complete()` — validate chars belong to attempt, save mistakes/duration

3. **`backend/src/modules/practice/hanzi-writing.controller.ts`**
   - `POST /practice/hanzi-writing/start` — auth, PR-14 consume, create attempt + return chars
   - `POST /practice/hanzi-writing/:attemptId/complete` — validate ownership, save results
   - `GET /practice/attempts/:attemptId` — reuses existing attempt controller

4. **`backend/src/modules/practice/practice.module.ts`** — register controller + service

### Frontend API — New
5. **`frontend/src/lib/api/endpoints/hanzi-writing.ts`** — `start()`, `complete()` API calls

6. **`frontend/src/lib/api/types.ts`** — add:
   - `HanziWritingStartResult` — `{ attemptId, characters: HanziChar[] }`
   - `HanziChar` — `{ char, pinyin, meaning, audioKey? }`

7. **`frontend/src/lib/api/endpoints.ts`** — export hanzi-writing endpoints

### Frontend Routes — New
8. **`frontend/src/app/(student)/practice/hanzi-writing/page.tsx`** — route entry
9. **`frontend/src/app/(student)/practice/hanzi-writing/[attemptId]/page.tsx`** — practice route
10. **`frontend/src/features/practice/hanzi-writing-selection-feature.tsx`** — source picker + start
11. **`frontend/src/features/practice/hanzi-writing-practice-feature.tsx`** — full practice flow

### Integration
12. **`frontend/src/features/practice/components/practice-engine.ts`** — add `HANZI_WRITING` branch
13. **`frontend/src/features/layout/components/navbar.tsx`** — add Hanzi Writing to games submenu
14. **`frontend/src/lib/utils/constants.ts`** — add `HANZI_WRITING` to `activityKey()`

### Data Setup
15. **`frontend/scripts/copy-hanzi-data.mjs`** — extract unique HSK chars, copy JSON from `hanzi-writer-data`

---

## Key Design Decisions

### 1. Char Data Source (PR-13 §3.1 MVP)
- Use `hanzi-writer` CDN loader for prototype (no custom setup needed)
- In production: extract HSK character JSONs via `copy-hanzi-data.mjs` to `/public/hanzi-data/`
- `HanziWriterCanvas` already configured with `charDataLoader` using `loadCharData()`

### 2. Session State Flow
```
Selection → POST /start → attemptId → PracticePage loads chars
→ WritingMode (per-char quiz via HanziWriterCanvas)
→ onComplete per char → track mistakes
→ Final complete → POST /complete → show results
```

### 3. Backend Grading
No AI recognition — Hanzi Writer quiz runs client-side:
- `onMistake` callback increments mistake count for that character
- `onComplete` callback fires when char fully traced
- `complete()` sends `{ characters: [{ char, mistakes, skipped }] }` to backend
- Backend only validates chars belong to attempt, stores results

### 4. Missing Char Data (PR-13 §3.2)
- `loadCharData()` already returns `null` on failure
- `HanziWriterCanvas` gracefully handles missing data (no crash)
- UI shows "Chưa có dữ liệu nét viết" with skip option (add to WritingMode)

### 5. PR-14 Integration
- `start()` endpoint calls `attemptService.start()` same as other practice types
- Reuses `daily_practice_usage` table with `activityKey('HANZI_WRITING', ...)`

---

## Implementation Order

1. **Backend** — DTOs, service, controller (isolated, no frontend dependency)
2. **Frontend API** — types + endpoint calls
3. **Selection Feature + Route** — source picker, calls `start()`, navigates to practice route
4. **Practice Feature + Route** — integrates `WritingMode` + `HanziWriterCanvas`, calls `complete()`
5. **Practice Engine** — add `HANZI_WRITING` branch
6. **Navbar** — add Hanzi Writing to games
7. **Char data setup** — `copy-hanzi-data.mjs` script

## Risk Assessment

- **Hanzi Writer lib size** — loaded via dynamic import (client only), doesn't affect SSR bundle ✅
- **Char data missing** — handled gracefully with skip option ✅
- **Canvas touch events** — `HanziWriterCanvas` already uses `touch-none` + proper event handling ✅
- **Session restoration** — similar to existing practice types, reuse pattern ✅
