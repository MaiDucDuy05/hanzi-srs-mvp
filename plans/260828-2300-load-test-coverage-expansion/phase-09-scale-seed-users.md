# Phase 9: Scale seed users 8 → 100+

## Context
Pool 8 user → stress 1000 VU share 8 token = mỗi user ~125 VU đồng thời → **session contamination**: rating AGAIN của VU A ảnh hưởng SRS due của VU B. Test không phản ánh user thật.

## Requirements
- Seed thêm `hocvien6@hanzi.dev` đến `hocvien100@hanzi.dev` (95 user FREE mới)
- Update `load-tests/config/environments.js` SEED_USERS array
- Update `backend/src/database/seeds/seed-users.ts` USERS array

## Architecture
- Sửa 2 file (theo CLAUDE.md "update existing files directly")
- Pattern seed: loop generate email + role, idempotent upsert

## Related Code Files
- UPDATE: `load-tests/config/environments.js`
- UPDATE: `backend/src/database/seeds/seed-users.ts`

## Implementation Steps
1. Sửa `seed-users.ts`: thêm hàm `generateBulkUsers(count)` tạo hocvien6-100, không có VIP (toàn FREE để test quota), name ngẫu nhiên
2. Update `environments.js` SEED_USERS:
   - Import hocvien6-100 vào array (giữ admin + 5 cũ + 2 teacher + 95 mới = 103 user)
   - Round-robin pool size ~100 → stress 1000 VU = 10 VU/user (acceptable)
3. Update README để document pool size mới

## Success Criteria
- [ ] seed-users.ts chạy OK, tạo 95 user mới
- [ ] environments.js SEED_USERS có 103 entry
- [ ] Pool login trong setup() không bị throttle (103 user * 0.2s sleep = ~21s, OK)
- [ ] Smoke pass

## Risk
- 103 login liên tiếp trong setup() → có thể hit login throttle 10/min/IP
- Mitigation: stagger sleep 0.6s (đủ cho 10 req/min ~ 6s spacing) → 103 * 0.6 = 62s setup time
- Tăng sleep hoặc batch login song song — chọn stagger để đơn giản
- Hoặc: chỉ login 1 subset (top 20 user) mỗi lần, refresh pool giữa test run