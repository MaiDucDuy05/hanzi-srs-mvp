# Phase 5: admin-curriculum.js — write operations

## Context
Admin journey hiện chỉ GET 6 endpoints read-only. Write operations là write-heavy path (DB contention, transaction, slow query) — chưa từng test dưới tải. Cần phát hiện bottleneck khi nhiều admin đồng thời CRUD.

## Requirements
- POST /admin/vocabularies — tạo vocab mới
- PATCH /admin/vocabularies/:id — update vocab
- POST /admin/topics — tạo topic
- DELETE /admin/vocabularies/:id — xóa vocab (cleanup)
- Counter `admin_writes_total{op}` (POST/PATCH/DELETE)

## Architecture
- Sửa file hiện tại (theo CLAUDE.md)
- Chia thành 2 hàm: `adminCurriculumReadJourney()` (cũ) và `adminCurriculumWriteJourney()` (mới)
- File vẫn < 200 dòng — chia nhỏ nếu cần

## Related Code Files
- UPDATE: `load-tests/journeys/admin-curriculum.js`
- Có thể tách file nếu > 200 dòng

## Implementation Steps
1. Rename hàm cũ → `adminCurriculumReadJourney(data)` (backward compat)
2. Thêm hàm `adminCurriculumWriteJourney(data)`:
   - Lấy admin token
   - POST /admin/vocabularies {hanzi: `loadtest_${randomUUID()}`, pinyin: '...', meaning: '...', hskLevel: 1, topicId}
   - Nếu 2xx → lưu vocabId, PATCH /admin/vocabularies/:vocabId
   - Counter increment theo op
3. Xóa tạm thời không cần — teardown sẽ xóa (Phase 8)
4. Update scenarios dùng cả 2 hàm

## Success Criteria
- [ ] File < 200 dòng (split nếu cần)
- [ ] Admin read + write journey đều chạy được
- [ ] Counter `admin_writes_total{op}` có data trong report
- [ ] Smoke pass (chỉ test 1-2 write ops, không stress)

## Risk
- Tạo vocab rác → DB pollution → cần teardown Phase 8
- TopicId cần tồn tại → check null trước khi POST
- Admin token cần ADMIN role — đã có trong pool