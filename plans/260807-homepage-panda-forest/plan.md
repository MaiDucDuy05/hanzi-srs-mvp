# Plan: Trang chủ “Cute Panda Forest” — Design & MVP

**Ngày:** 2026-08-07
**Folder code:** `frontend/` (Next.js 16 App Router, React 19, Tailwind v4, TS strict)
**Nguồn yêu cầu:** `/ui-designer` + design brief khách hàng (theme Cute Panda Forest)
**Trạng thái:** Design doc — chưa implement.

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

## 3. Quyết định scope (cần xác nhận trước khi implement)

1. **Phạm vi theme** — quyết định lớn nhất:
   - **A. Homepage-only (đề xuất MVP):** `/` dùng shell riêng (HomeNavbar/HomeFooter panda), tự thêm token màu xanh — KHÔNG đụng các trang trong app (vẫn đỏ #c8102e hiện tại). Rủi ro thấp, không rà toàn app.
   - **B. App-wide:** đổi `--brand` sang xanh rừng + font rounded + light-only toàn app → đụng ~20 trang, bỏ dark mode, rủi ro cao.
2. **Dark mode:** brief yêu cầu *No dark theme* → trang chủ light-only. Nếu chọn A, các trang khác giữ dark như hiện tại.
3. **Brand conflict:** hiện `--brand: #c8102e` (đỏ Trung Hoa). Panda dùng xanh `#5E7F26…`. Nếu chọn A: thêm token mới `--color-forest-*`, giữ token cũ.

---

## 4. Success criteria

- `/` render đúng 2 trạng thái theo wireframe `02-layout-and-sections.md`.
- Design tokens khớp brief: hex chính xác, radius 16–32px, CTA pill `#C7CF35` text trắng, font heading bo tròn.
- Trang chủ: không dark, không gradient nặng, không cạnh sắc — mọi thành phần bo góc, whitespace rộng.
- Motion nhẹ: lá bay, panda idle, fade, hover scale — tôn trọng `prefers-reduced-motion`.
- `npm run lint` pass · `npm run build` 0 lỗi type · `npm test` pass · smoke 2 trạng thái guest/user.
- Component đặt trong `src/components/home/*`, tái dùng `src/components/ui/*` (Button/Card/Badge) tối đa.

---

## 5. Open questions (chưa giải quyết — ghi cuối mọi báo cáo)

- **Phạm vi theme A hay B?** (ảnh hưởng rà soát toàn app — cần user chốt).
- **Nguồn illustration panda/bamboo:** tự vẽ SVG inline đơn giản (đề xuất MVP) hay dùng thư viện flat-2D? Không có ảnh thật/realistic.
- **Leaderboard:** backend chưa có API xếp hạng → dùng mock tạm, placeholder, hay ẩn tới khi có API (FR-18)?
- **Dữ liệu dashboard:** “tiếp tục học / ôn tập hôm nay” cần nguồn dữ liệu — hiện backend chưa có SRS schedule API; dùng gì làm nguồn thật? (xem `03-implementation-guide.md` §3)
- **Font:** thêm Nunito/Inter qua `next/font` ở `layout.tsx` (toàn app) — chấp nhận load font global hay chỉ dùng system rounded stack cho homepage?
- **Contrast CTA:** text trắng trên `#C7CF35` contrast thấp (~1.6:1, WCAG fail) — brief chỉ định rõ “White text”; giữ đúng brief hay đổi thành text xanh đậm cho accessibility?
