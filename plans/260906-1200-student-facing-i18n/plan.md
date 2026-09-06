# Plan: i18n Student-facing Surfaces

## Goal
Localize all student-facing pages + their feature components so that locale switch between `vi` ↔ `en` covers every user-visible string, following the existing `next-intl` + namespaced JSON pattern.

## Decisions (user-confirmed)
- **Hero**: keep English copy in both locales (no `Home` namespace for body)
- **Mistake-book mock data**: translate mock data into English copy too (use a small bilingual mock keyed by locale)

## Conventions (matching existing codebase)
1. **Client components** (`'use client'`): `import { useTranslations } from 'next-intl'; const t = useTranslations('Ns');`
2. **Server components / async**: `import { getTranslations } from 'next-intl/server';` inside `generateMetadata` or page body
3. **File `messages/{vi,en}.json`**: append new namespace per module. Keys are `camelCase`. ICU placeholders for variables (e.g. `{xp}`, `{count}`)
4. **Lists of objects** (e.g. VIP benefits, mistake words): keep in component file but wrap display text in `t()`. For purely cosmetic mock data, put translations inside `messages/*.json`
5. **Punctuation & style**: keep alignment with existing keys in `messages/*.json` — Vi full sentences often end with `.`, En ones too. Avoid mixing emoji in keys.

## New Namespaces (to add to `messages/vi.json` + `messages/en.json`)

| Namespace | Used by |
|---|---|
| `Auth` | login/register/forgot-password pages + forms |
| `Contact` | `/contact` page + ContactForm |
| `Vip` | `upgrade-vip` page |
| `MistakeBook` | `/mistake-book` list, detail, layout mock list |
| `Constants` | practice / source / role labels (refactor `lib/utils/constants.ts`) |
| `Study` | study hub + learn-word/learn-grammar flows |
| `Srs` | `/review` (today's review feature) |
| `Speaking` | speaking hub + recording-modal |
| `Practice` (extend) | practice session UI, mode components, source picker |
| `Games` | hub + per-game components/features |
| `LiveQuiz` | player + shared UI |
| `Home` | home page metadata only |
| `Layout` | footer, maintenance banner, app-shell |
| `Exam` | exam-taking page + result feature |
| `Profile` | profile feature |
| `TopicDetail` | dashboard/topic-detail |

## File impact summary
- **2 message files** (`messages/vi.json`, `messages/en.json`): +~350 keys across ~16 namespaces
- **~10 page files**: localized JSX text + metadata via `generateMetadata`
- **~25 feature files**: add `useTranslations`, replace hardcoded strings
- **5 shared UI files** (`spinner.tsx`, `error-state.tsx`, `modal.tsx`, `app-shell.tsx`, `footer.tsx`)
- **1 constants refactor**: `lib/utils/constants.ts` to locale-aware helpers

## Phasing (incremental, each phase ends with green build)

### Phase 1 — Foundation
- [ ] Add all new namespace skeletons (empty objects initially) to both message files so build doesn't 404
- [ ] `lib/utils/constants.ts` → introduce locale-aware helpers (`labelForPracticeType(t, key)`, `labelForSourceType(t, key)`, `labelForRole(t, key)`); keep old exports as `*_LABELS_VI` shim if needed during refactor
- [ ] Refactor consumers of `*_LABELS` to use new helpers (5 files)
- [ ] Localize `features/ui/components/spinner.tsx`, `error-state.tsx`, `modal.tsx`, `features/layout/components/footer.tsx`, `maintenance-banner.tsx`, `app-shell.tsx`
- [ ] Localize `app/[locale]/layout.tsx` metadata via `generateMetadata`
- [ ] Localize `app/[locale]/loading.tsx`, `error.tsx`, `app/[locale]/(student)/loading.tsx`, `error.tsx`
- [ ] `npm run lint && npm run build` ✅

### Phase 2 — Auth surfaces
- [ ] Add `Auth` namespace (login/register/forgot-password labels, errors, button text)
- [ ] Refactor `login-form.tsx`, `register-form.tsx`, `forgot-password-form.tsx`
- [ ] Localize `app/[locale]/(auth)/login/register/forgot-password/page.tsx` (Welcome!, Welcome Back!, nav-back text, metadata)
- [ ] `npm run lint && npm run build` ✅

### Phase 3 — Public & Misc
- [ ] Add `Contact` namespace
- [ ] Localize `app/[locale]/(student)/contact/page.tsx` + `contact-form.tsx`
- [ ] Localize `app/[locale]/(student)/games/layout.tsx` and `study/layout.tsx` (aria/title attributes)
- [ ] Add `Home` namespace (just `metaTitle`, `metaDesc`); localize `app/[locale]/page.tsx` metadata. Skip hero body per user decision
- [ ] Localize every remaining `page.tsx` metadata in `(student)/*` that has hardcoded Vi title/description (settings, exams, resources, error/loading)
- [ ] `npm run lint && npm run build` ✅

### Phase 4 — Critical student flows (VIP + Mistake-book)
- [ ] Add `Vip` namespace
- [ ] Refactor `app/[locale]/(student)/dashboard/upgrade-vip/page.tsx` (164 lines, separate UI form values + benefit strings)
- [ ] Add `MistakeBook` namespace
- [ ] Refactor `app/[locale]/(student)/mistake-book/page.tsx`, `[id]/page.tsx`, `layout.tsx` — mock data goes to a locale-aware dataset (small in-file lookup keyed by locale)
- [ ] `npm run lint && npm run build` ✅

### Phase 5 — Remaining student features
- [ ] `features/student/student-exam-taking-page.tsx`, `student-exam-result-feature.tsx`, `mistake-book-feature.tsx`, `profile-feature.tsx`
- [ ] `features/study/study-feature.tsx` + `study/learn-word/*` + `study/learn-grammar/*`
- [ ] `features/srs/review-today-feature.tsx`
- [ ] `features/speaking/speaking-hub-feature.tsx` + `components/recording-modal.tsx`
- [ ] `features/dashboard/page-features/topic-detail-feature.tsx`
- [ ] `features/practice/components/*` (session, session-frame, fill-blank, flashcard, matching, sentence-ordering, source-picker, fill-game-feature, write-sentence-feature, sentence-game-feature, balloon-game-feature, memory-game-feature, match-game-feature, listening-game-feature)
- [ ] `features/games/components/*` (sentence-game-board, balloon-mode, balloon-hud, write-sentence-board, fill-game-board, fill-results, game-shared-ui, game-session, game-summary, hanzi-writer-canvas, match-game-board, memory-mode, writing-mode)
- [ ] `features/live-quiz/player/live-player-feature.tsx`
- [ ] `features/dashboard/components/game-selection-modal.tsx`
- [ ] `npm run lint && npm run build` ✅

## Risks & Mitigations
- **Mock data mixing**: mistake-book mock contains VI-only exam text. → Push mock into a small in-file bilingual lookup keyed by locale, do not translate inline
- **Hardcoded Vietnamese metadata**: ~30+ page files have `metadata.title = 'Tiếng Việt'`. → Replace with `async function generateMetadata({ params }) { const { locale } = await params; const t = await getTranslations({ locale, namespace: 'Common' }); return { title: t('metaTitle') }; }`
- **Practice lab/benefit arrays inline**: tip-style arrays (e.g. `BENEFITS` in upgrade-vip) → keep structure, wrap text in `t()`: `{ emoji: '∞', titleKey: 'vipBenefit1Title', descKey: 'vipBenefit1Desc' }`
- **`PRACTICE_TYPE_LABELS` typed `Record<PracticeType, string>`**: refactor to functions that take `t` and return string
- **File bloat**: feature files are large (some 200+ lines). Apply kebab-case module split per CLAUDE.md rules only if a file exceeds 200 lines after refactor (the existing files are already mostly within bounds)

## Validation
- After each phase: `cd frontend && npm run lint && npx next build` (no compile errors) ✅
- Manual smoke: open `/vi/...` and `/en/...` URLs, confirm no missing labels (no raw key like `practice.title` showing), and that locale switcher in AppShell works
- Vitest unit tests (if any tag the constants file) must still pass

## Out of Scope (post student-facing phases)
- Admin & teacher modules (separate plan)
- Internal text inside HSK vocab/grammar seeds (data, not UI)
- Mock-only admin demo data
