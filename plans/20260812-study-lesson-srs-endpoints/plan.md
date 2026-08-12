# Plan: Study Lesson API Endpoints + SRS

## Context
- Gap analysis: `study-lesson-feature.tsx` 100% mock, cần lesson contents aggregate + SRS + vocab search + vocab fields.
- Decisions: Full SRS (SM-2 + table + 2 endpoints); add partOfSpeech + example columns; backend + frontend.

## Backend

### 1. Migration `002-study-lesson-srs-vocab-fields.ts`
- ALTER `vocabularies` ADD `part_of_speech varchar(30)`, `example text` (nullable)
- CREATE `user_vocabulary_progress`: id, user_id FK, vocabulary_id FK, mastery_level int default 0, review_count int default 0, easiness_factor numeric(3,2) default 2.50, interval_days int default 0, next_review_at timestamptz default now(), last_reviewed_at timestamptz, created_at, updated_at
- UNIQUE(user_id, vocabulary_id), INDEX(user_id, next_review_at)

### 2. Vocabulary entity + DTO + service
- Entity: +`partOfSpeech`, `example` columns
- `VocabularyQueryDto`: +`search?: string`
- `Create/UpdateVocabularyDto`: +`partOfSpeech?`, `example?`
- `VocabularyService.findAll`: +search (ILike hanzi/pinyin/meaningVi, same pattern as UserService)

### 3. Lesson contents aggregate
- `LessonService`: inject LessonContent + Vocabulary + GrammarPoint repos; +`getContents(lessonId)` → fetch lesson_contents, batch fetch vocab + grammar by contentId, return `{ vocabularies, grammarPoints }`
- `LessonController`: +`@Get(':id/contents')` → `lessonService.getContents(id)`
- DTO: `LessonContentsAggregate` interface

### 4. SRS module (new `modules/srs/`)
- `entities/user-vocabulary-progress.entity.ts`
- `dto/srs.dto.ts`: `ReviewDto` (vocabularyId + rating: AGAIN/HARD/GOOD/EASY), `ProgressQueryDto` (lessonId)
- `srs.service.ts`: `submitReview(userId, dto)` — SM-2 algorithm (upsert progress row, update mastery/interval/easiness/nextReviewAt), `getProgress(userId, lessonId)` — join qua lesson_contents → return progress map
- `srs.controller.ts`: `POST /srs/review` (authenticated), `GET /srs/progress?lessonId=X` (authenticated)
- `srs.module.ts`: imports TypeOrmModule.forFeature([UserVocabularyProgress]) + CurriculumModule
- `srs.service.spec.ts`: unit test SM-2 logic

### 5. Wire
- `app.module.ts`: import SrsModule
- `curriculum.module.ts`: exports LessonContentService (for SRS getProgress join)

## Frontend

### 6. Types (`types.ts`)
- Vocabulary: +`partOfSpeech`, `example`
- +`SrsRating` = 'AGAIN'|'HARD'|'GOOD'|'EASY'
- +`UserVocabProgress` { vocabularyId, masteryLevel, nextReviewAt, lastReviewedAt }
- +`LessonContentsAggregate` { vocabularies: Vocabulary[], grammarPoints: GrammarPoint[] }

### 7. API endpoints
- `curriculum.ts`: +`getLessonContents(lessonId)`, `listVocabularies` +`search` param
- New `endpoints/srs.ts`: `srsApi.submitReview(vocabularyId, rating)`, `srsApi.getProgress(lessonId)`
- `endpoints.ts`: export srs

### 8. Wire `study-lesson-feature.tsx`
- Fetch `getLessonContents(lessonId)` + `srsApi.getProgress(lessonId)` in useEffect
- Wire search input → filter vocab list
- Vocab table: real data (hanzi, pinyin, meaningVi, partOfSpeech, masteryLevel from progress)
- Grammar list: real data (title, structure, explanation)
- Flashcard mode: pass vocabularies + onReview to FlashcardGameFeature
- Loading/error states

### 9. Wire `FlashcardGameFeature`
- Accept props: `vocabularies: Vocabulary[]`, `onReview?: (vocabId, rating) => void`
- Display real vocab (hanzi, pinyin, meaningVi)
- Audio button → play `/api/audio/${audioKey}`
- Again/Hard/Good/Easy → `onReview(vocab.id, rating)` + advance card
- Progress bar from card index

## SM-2 mapping
- AGAIN→rating 0: mastery=max(0,m-1), interval=0, nextReview=now
- HARD→rating 3: interval=max(1, interval*1.2), EF-=0.15
- GOOD→rating 4: mastery=min(4,m+1), interval=round(interval*EF), EF+=0.1
- EASY→rating 5: mastery=min(4,m+2), interval=round(interval*EF*1.3), EF+=0.3
- EF=max(1.3, EF), nextReview=now+interval days

## Success criteria
- Backend build + test pass
- Frontend tsc --noEmit pass
- `GET /lessons/:id/contents` returns aggregate
- `POST /srs/review` updates mastery
- `GET /vocabularies?search=...` filters
- study-lesson-feature hiển thị real data

## Unresolved
- none
