# Phase 8: teardown() DB cleanup trong scenarios

## Context
ARCHITECTURE §8 nói "cleanup trong teardown" — **không có teardown() trong scenario nào**. Sau soak 1h, DB đầy practice_attempt + srs_review rác. Không reset → test sau bị lệch (SRS due ngày hôm sau có data cũ).

## Requirements
- Mỗi scenario có teardown() gọi admin endpoint xóa data test
- Chỉ xóa data có prefix `loadtest_` (vocab created in Phase 5)
- Reset practice_attempts + srs_review của user trong pool
- Smoke/load/stress/spike/soak đều có teardown

## Architecture
- Thêm hàm `cleanupTestData(pool, baseUrl)` trong `lib/cleanup.js` (file mới < 100 dòng)
- Cần backend admin endpoint: `DELETE /admin/test-data?prefix=loadtest_`
- NẾU endpoint chưa có → dùng k6 lifecycle teardown() để xóa qua direct query (cần DB connection string qua env)

## Related Code Files
- NEW: `load-tests/lib/cleanup.js`
- UPDATE: tất cả `load-tests/scenarios/*.js`

## Implementation Steps
1. Kiểm tra backend có endpoint admin cleanup:
   - `DELETE /admin/test-data?prefix=loadtest_` (cần tạo nếu chưa có)
   - Hoặc dùng SQL TRUNCATE qua psql (env DB_URL)
2. Tạo `lib/cleanup.js`:
   - Hàm `teardownTestData(data, baseUrl)` — gọi admin endpoint xóa
   - Hàm `truncateViaSql(envDbUrl)` — fallback dùng `pg` package
3. Update mỗi scenario:
   ```js
   export function teardown(data) {
     cleanup.teardownTestData(data, __ENV.K6_BASE_URL);
   }
   ```
4. Document trong README

## Success Criteria
- [ ] lib/cleanup.js < 100 dòng
- [ ] Mọi scenario có teardown()
- [ ] Sau smoke, DB sạch vocab `loadtest_*`
- [ ] Có log rõ "cleanup done, X records deleted"

## Risk
- Backend chưa có admin cleanup endpoint → phải tạo (NestJS controller nhỏ)
- Hoặc: dùng psql CLI qua child_process (Node script trong k6 không khả thi — k6 là Go binary)
- Decision: dùng `exec` command `psql` trong teardown? Không — k6 không có shell access.
- Best option: **tạo admin endpoint mới** trong backend `AdminTestDataController` — chỉ enable khi `NODE_ENV !== 'production'`
- Fallback: dùng pg client từ Node helper script ngoài k6, chạy sau khi k6 xong (post-test hook)