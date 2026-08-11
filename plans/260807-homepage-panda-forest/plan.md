# Plan: Trang chủ “Cute Panda Forest” — Design & MVP

**Ngày:** 2026-08-07
**Folder code:** `frontend/` (Next.js 16 App Router, React 19, Tailwind v4, TS strict)
**Nguồn yêu cầu:** `/ui-designer` + design brief khách hàng (theme Cute Panda Forest)
**Trạng thái:** ✅ **ĐÃ IMPLEMENT** (scope B — app-wide, theo `04-scope-b-implementation-plan.md`)

---

## 1. Mục tiêu

Thiết kế lại trang chủ `/` theo theme **Cute Panda Forest** — eco minimalism, khu rừng tre, gấu trúc dễ thương, pastel, whitespace rộng, phù hợp trẻ em/học sinh/học viên casual nhưng vẫn premium & hiện đại.

Trang chủ phục vụ **2 trạng thái** (đã chốt ưu tiên “Dashboard học tập”):

| Trạng thái | Nội dung chính |
|---|---|
| **Khách (chưa đăng nhập)** | Landing marketing: hero + tính năng + game categories + CTA đăng ký |
| **Đã đăng nhập** | **Dashboard học tập**: chào + tiếp tục học + ôn tập hôm nay (SRS) + streak + tiến độ HSK + thành tích + leaderboard; các section marketing thu gọn/xuống dưới |

---

## 2. Deliverables (folder này)

| File | Nội dung |
|---|---|
| `plan.md` | Tổng quan + quyết định scope + success criteria (file này) |
| `01-design-system.md` | Design tokens: màu, typography, spacing, radius, shadow, motion, illustration |
| `02-layout-and-sections.md` | Wireframe từng section + component + trạng thái logged-in/out + responsive |
| `03-implementation-guide.md` | Bước implement trong Next.js hiện tại + verification + risk |

---

## 3. Quyết định scope (ĐÃ CHỐT 2026-08-07 — người dùng xác nhận)

1. **Phạm vi theme — B. App-wide:** đổi `--brand` sang xanh rừng `#5E7F26` + font rounded + light-only TOÀN app (~20 trang). Dark mode bị bỏ toàn bộ. Token đỏ cũ `#c8102e` đã thay, không giữ lại.
2. **Dark mode:** loại bỏ hoàn toàn — xoá block `prefers-color-scheme: dark` + mọi class `dark:` trong toàn app.
3. **Brand conflict:** `--brand` chuyển sang xanh rừng; thêm token mới `--color-forest-*`, `--color-accent-*`.
4. **CTA contrast:** text **xanh đậm** trên nền `#C7CF35` (accessibility — bỏ "text trắng" của brief).
5. **Font:** Poppins (heading) + Inter (body) load GLOBAL qua `next/font/google`.
6. **Dashboard dữ liệu thiếu API:** render **placeholder rõ ràng + ghi chú**, không fake số liệu.

---

## 4. Success criteria

- `/` render đúng 2 trạng thái theo wireframe `02-layout-and-sections.md`.
- Design tokens khớp brief: hex chính xác, radius 16–32px, CTA pill `#C7CF35` text trắng, font heading bo tròn.
- Trang chủ: không dark, không gradient nặng, không cạnh sắc — mọi thành phần bo góc, whitespace rộng.
- Motion nhẹ: lá bay, panda idle, fade, hover scale — tôn trọng `prefers-reduced-motion`.
- `npm run lint` pass · `npm run build` 0 lỗi type · `npm test` pass · smoke 2 trạng thái guest/user.
- Component đặt trong `src/components/home/*`, tái dùng `src/components/ui/*` (Button/Card/Badge) tối đa.

---

## 5. Open questions (đã giải quyết 2026-08-07)

- ~~**Phạm vi theme A hay B?**~~ → **B (App-wide)** — người dùng chốt. Xem `04-scope-b-implementation-plan.md`.
- ~~**Nguồn illustration:**~~ → **SVG inline** (`panda-decoration.tsx`) — flat 2D, không dependency.
- ~~**Leaderboard:**~~ → **Mock tạm nhãn rõ "Xem trước"** (`leaderboard-section.tsx`), thay bằng API khi có (FR-18).
- ~~**Dữ liệu dashboard:**~~ → **Placeholder + ghi chú** — tên/role thật từ `getServerUser()`, streak/SRS/HSK tiến độ hiển thị mẫu "Xem trước" hoặc placeholder rõ ràng.
- ~~**Font:**~~ → **Global** — Poppins (heading) + Inter (body) qua `next/font/google` ở `layout.tsx`.
- ~~**Contrast CTA:**~~ → **Text xanh đậm** trên `#C7CF35` (accessibility, lệch brief có chủ đích).

## 6. Kết quả verify (2026-08-07)

- `npm run lint` — 0 errors (12 warnings có sẵn từ trước, không do thay đổi này).
- `npm run build` — 0 lỗi, 23 route compile.
- `npm test` — 29/29 pass.
- Smoke: `/` guest render đủ Hero/Features/Games/Achievements/Leaderboard/CTA; navbar pill panda + footer bo tròn; font Poppins load; route auth-gated redirect hoạt động (`/learn` → `/login`); các trang public (login/register/contact) mang theme forest.
