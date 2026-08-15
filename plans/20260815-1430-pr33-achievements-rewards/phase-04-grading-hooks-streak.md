# Phase 04 — Grading Hooks + StreakService

> Spec: §4.1 luồng award, §2.2 earning. Dep: phase 03. Next: phase 05.

## Overview
Wire `ExpService` + `ActivityService` vào các submit/grading flow **trong cùng `em` transaction**. Refactor streak logic từ `StudentProgressService` sang `StreakService` + milestone award.

## Related code files
- Modify: `backend/src/modules/practice/fill-blank.controller.ts` (hook trong tx submit)
- Modify: `backend/src/modules/practice/sentence-ordering.controller.ts` (hook)
- Modify: `backend/src/modules/practice/practice.controller.ts` (submit hook)
- Modify: `backend/src/modules/practice/practice.module.ts` (import AchievementsModule)
- Modify: `backend/src/app.module.ts` (register AchievementsModule)
- Create: `backend/src/modules/achievements/streak.service.ts`
- Ref: `student/student-progress.service.ts` (`recordActivity`/`calculateStreak` hiện có)

## Implementation steps
1. `PracticeModule` import `AchievementsModule` (để inject ExpService/ActivityService).
2. `AchievementsModule` register trong `app.module.ts`.
3. `fill-blank.controller.ts` submit: trong `dataSource.transaction(emFnhb(em => { ... })`, sau `gradingService.gradeFillBlank` + `attemptService.submit`, thêm:
   ```typescript
   const exp = await this.expSvc.awardFromAttempt(em, userId, { correct: result.totalCorrect, total: result.totalQuestions, combo, refId: attemptId }, idempotencyKey);
   await this.activitySvc.log(em, userId, 'PLAYED_GAME', { game: 'fill_blank', score: result.score, correct: result.totalCorrect }, exp);
   await this.streakSvc.recordActivity(em, userId);
   ```
4. Tương tự `sentence-ordering.controller.ts` + `practice.controller.ts` submit + hanzi-writing submit.
5. Mistake-book review submit (PR-17): hook `award(EARN_MISTAKE_REVIEW, 15)` cho mỗi câu khắc phục + `activitySvc.log('REVIEWED_MISTAKES')`. (Cần mistake-book module import AchievementsModule.)
6. `StreakService.recordActivity(em, userId)`: move logic từ `StudentProgressService)Service.recordActivity` — update `users.currentStreak`/`lastActivityDate`. Sau khi update, check milestone 7/14/30: nếu `currentStreak` ∈ {7,14,30} → `expSvc.award(EARN_STREAK, chestAmount, 'streak_milestone', streakKey)` (idempotencyKey = `streak-${userId}-${milestone}` để không cộng 2 lần). Chest: 50/100/200.
7. `StudentProgressService` delegate `recordActivity` sang `StreakService` (hoặc giữ + gọi streak milestone). Tránh duplicate.

## Todo
- [ ] PracticeModule import AchievementsModule
- [ ] app.module register AchievementsModule
- [ ] Hook fill-blank submit (award + activity + streak)
- [ ] Hook sentence-ordering submit
- [ ] Hook practice submit + hanzi-writing submit
- [ ] Hook mistake-book review submit (+15 EXP)
- [ ] StreakService.recordActivity + milestone 7/14/30 (idempotent)
- [ ] `npm run build` pass

## Success criteria
- Nộp bài → `exp_transactions` + `user_activities` ghi trong cùng tx (rollback5 rollback grading → không có EXP/activity).
- Cùng attempt nộp 2 lần (idempotencyKey) → EXP không cộng lại.
- Streak 7 → +50 EXP đúng 1 lần; 14 → +100; 30 → +200.
- Ôn tập mistake thành công → +15 EXP.

## Risk
- Hook vào nhiều controller → quên 1 chỗ. Mitigation: checklist + integration test mỗi submit path.
- `StudentProgressService.recordActivity` duplicate với `StreakService` → refactor delegate, không chạy 2 lần.

## Security
- Tất cả hook server-side, client không kiểm soát amount. `awardFromAttempt` compute từ `result` đã grading.
