# Phase 05 — Achievements Controller/Service (Dashboard)

> Spec: §2.1, §4.3. Dep: phase 04. Next: phase 06.

## Overview
Public read-only API: dashboard stats, activity timeline, streak heatmap, radar chart.

## Related code files
- Create: `backend/src/modules/achievements/achievements.controller.ts`
- Create: `backend/src/modules/achievements/achievements.service.ts`
- Ref: `student/student-progress.service.ts` (stats query pattern), `practice/entities/practice-attempt.entity.ts`

## Implementation steps
1. `AchievementsController` `@Controller('achievements')` + `@ApiTags('achievements')`:
   - `GET /` → dashboard (EXP, streak, tổng quan, radar, missbook stats).
   - `GET /timeline` → `@Query` range (week/month) + cursor pagination.
   - `GET /heatmap` → 365 ngày activity.
   - All `@CurrentUser('sub')` userId, JWT guard.
2. `AchievementsService`:
   - `getDashboard(userId)`: `expSvc.getBalance` + streak (query users) + tổng quan (count `practice_attempts` COMPLETED, count vocab mastered) + radar (aggregate score by skill type, 30 ngày) + missbook stats (count `mistake_books` by user, corrected vs remaining).
   - `getTimeline(userId, range, cursor)`: query `user_activities` `(user_id, created_at < cursor) ORDER BY created_at DESC LIMIT 20`. Return items + nextCursor.
   - `getHeatmap(userId)`: `SELECT date_trunc('day', created_at)::date d, count(*) FROM practice_attempts WHERE user_id AND created_at >= now()-365d GROUP BY d`. Return array `[{date, count}]`.
   - Radar: `SELECT practice_type, AVG(score) FROM practice_attempts WHERE user_id AND created_at >= now()-30d GROUP BY practice_type` → map sang Nghe/Viết/Ngữ pháp/Từ vựng.
3. Swagger decorators `@ApiOperation`, `@ApiResponse`.

## Todo
- [ ] Controller 3 endpoint + guards + Swagger
- [ ] getDashboard (balance + streak + tổng quan + radar + missbook)
- [ ] getTimeline (cursor pagination)
- [ ] getHeatmap (365d aggregate)
- [ ] Radar aggregate (30d group by type)
- [ ] `npm run build` + manual curl test

## Success criteria
- `GET /achievements` < 500ms, trả đủ fields.
- Timeline phân trang đúng (cursor), lọc week/month.
- Heatmap 365 phần tử.
- Radar 4 trục từ dữ liệu 30 ngày.

## Risk
- Dashboard query nặng (nhiều aggregate). Mitigation: bound 30 ngày, index `(user_id, created_at)`, cache nhẹ nếu cần (defer).
