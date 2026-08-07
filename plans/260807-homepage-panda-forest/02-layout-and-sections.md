# Layout & Sections — Homepage Cute Panda Forest

Trang chủ `/` — wireframe từng section, component, trạng thái logged-in/out, responsive.

---

## 1. Sơ đồ tổng thể (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│  ┌───────────────────────────┐ floating pill (sticky, cách lề 12px)
│  │ 🐼 Hán Tự HSK   Trang chủ·Học·Trò chơi·[Đăng ký]  │ ☰  │
│  └───────────────────────────┘                              │
├──────────────────────────────────────────────────────────────┤
│   HERO  (nền pale-green, blob + lá bay)                      │
│        🍃  H1: “Học tiếng Trung trong khu rừng tre”   🍃   │
│            sub: câu giới thiệu ngắn                          │
│            [Bắt đầu học ngay] [Xem trò chơi]         🐼🐼    │
│        (panda trái + phải, lá/tre/đá/hoa quanh)              │
├──────────────────────────────────────────────────────────────┤
│   FEATURE CARDS (6 card, nền white, rounded-3xl)             │
│   📚 Học theo cấp · 🗂️ Chủ đề · ✍️ Luyện tập                 │
│   🎮 Trò chơi · 📝 Kiểm tra · 📄 Tài liệu                    │
├──────────────────────────────────────────────────────────────┤
│   GAME CATEGORIES (4 tile lớn: hình + tên + CTA nhỏ)         │
│   Bắn bóng Pinyin · Memory · Luyện viết Hán tự · Nối từ      │
├──────────────────────────────────────────────────────────────┤
│   [ĐÃ ĐĂNG NHẬP]  DASHBOARD HỌC TẬP                         │
│   ┌ Chào, Minh! ── streak 🔥 5 ngày · ⭐ 120 điểm ┐          │
│   │ Tiếp tục học (bài gần nhất)   [Vào học]        │          │
│   │ Ôn tập hôm nay: 12 từ (SRS)    [Ôn ngay]        │          │
│   │ Tiến độ HSK 1: ▓▓▓▓▓░░░ 56%                     │          │
│   └────────────────────────────────────────────────┘          │
├──────────────────────────────────────────────────────────────┤
│   ACHIEVEMENT BADGES (huy hiệu: Nhập môn, Chuỗi 7 ngày, ...) │
├──────────────────────────────────────────────────────────────┤
│   LEADERBOARD PREVIEW (top 5 + CTA “Xem bảng xếp hạng”)      │
├──────────────────────────────────────────────────────────────┤
│   FOOTER (nền pale-green, bo trên 32px, lá/tre góc)          │
│   © 2026 Hán Tự HSK · Liên hệ · Tài liệu · Nâng cấp VIP      │
└──────────────────────────────────────────────────────────────┘
```

> Section thứ tự khi **chưa đăng nhập**: Hero → Features → Game Categories → Achievements (preview) → Leaderboard → CTA đăng ký → Footer. Dashboard section ẩn.

---

## 2. Chi tiết từng section

### 2.1 Navbar (sticky, rounded, floating)
- **Layout:** pill `rounded-full` nền `white/70 backdrop-blur`, `shadow-soft`, cách top 12px, container `max-w-6xl`.
- **Nội dung:** logo (🐼 + “Hán Tự HSK” font bold xanh) · links: Trang chủ / Học / Trò chơi / Kiểm tra · CTA pill (`#C7CF35`).
- **Logged-in:** thay CTA bằng avatar tròn + tên + menu nhỏ (Hồ sơ, Sổ lỗi sai, Thoát).
- **Mobile:** hamburger ☰ mở drawer bo tròn, đóng khi chọn link.

### 2.2 Hero
- **Nền:** `pale-green` → `mint-cream` (không gradient nặng — chuyển sắc cực nhẹ hoặc để phẳng), blob nền organic.
- **Nội dung (căn giữa):** badge “🐼 Khu rừng tre Hán Tự” → H1 đậm bo tròn → subtext 1 dòng → 2 CTA (primary pill + secondary outline).
- **Nhân vật:** gấu trúc 2 bên (trái phải), lá/tre/đá/hoa nhỏ phân bố quanh, lá bay nhẹ (floating-leaves overlay).
- **Copy gợi ý:**
  - H1: “Học tiếng Trung trong khu rừng tre”
  - Sub: “Từ vựng, trò chơi và bài kiểm tra HSK — vui như chơi, nhớ lâu như tre.”

### 2.3 Feature Cards
- 6 card (map từ `FEATURES` hiện tại trong `app/page.tsx`): Học theo cấp · Chủ đề · Luyện tập · Trò chơi · Kiểm tra · Tài liệu.
- Mỗi card: icon emoji trong vòng tròn `soft-lime` → title bold → desc xám; `rounded-3xl bg-white shadow-soft`, hover `-translate-y-1 shadow-lift`.
- Grid: `sm:grid-cols-2 lg:grid-cols-3 gap-6`.

### 2.4 Game Categories
- 4 tile lớn: **Bắn bóng Pinyin · Memory · Luyện viết Hán tự · Nối từ** (map từ `PRACTICE_TYPE_LABELS` / route `/games`, `/practice`).
- Layout: card ngang hoặc ô vuông 2×2, hình minh hoạ (SVG đơn giản) + tên + mũi tên “Chơi ngay”.
- Mỗi tile nền secondary khác nhau (`light-bamboo`/`soft-lime`/`pale-green`/`mint-cream`), bo `rounded-3xl`.

### 2.5 Dashboard Học tập (chỉ khi đăng nhập — ưu tiên chính)
- **Vị trí:** ngay sau Hero (thay vì Features) để người dùng quay lại tiếp tục học nhanh.
- **Thẻ chính (1 card lớn `rounded-3xl`):**
  - Header: “Chào, {fullName}! 👋” + badge streak 🔥 + điểm ⭐.
  - **Tiếp tục học:** bài/cấp gần nhất (từ `learn` route / API curriculum) + [Vào học] pill.
  - **Ôn tập hôm nay:** số từ do SRS lên lịch (placeholder tới khi có API — xem Open questions) + [Ôn ngay] → `/practice`.
  - **Tiến độ HSK:** thanh progress bo tròn `rounded-full` nền `light-bamboo`, fill `lime-green`; label “HSK 1 · 56%”.
  - Quick links nhỏ: Sổ lỗi sai · Hồ sơ · Nâng cấp VIP.
- **Nguồn dữ liệu:** `getServerUser()` (đã có) + `curriculumApi`/`practiceApi` hiện có; phần chưa có API → placeholder (ghi rõ).

### 2.6 Achievement Badges
- Hàng huy hiệu: vòng tròn `rounded-full` nền `pale-green`, icon 🎯/🔥/🌟; đã đạt thì nền `lime-green` + tick.
- Gợi ý: Nhập môn · Chuỗi 3 ngày · 100 từ · Chiến thắng đầu tiên.
- Dữ liệu: chưa có API FR-18 → render mẫu/placeholder hoặc ẩn nếu không có dữ liệu thật.

### 2.7 Leaderboard Preview
- Card: tiêu đề + top 5 (rank huy chương 🥇🥈🥉, avatar tròn, tên, điểm), highlight top 3.
- CTA phụ: “Xem bảng xếp hạng” → placeholder route (chưa có) hoặc ẩn.
- Dữ liệu: **mock tạm rõ ràng** (ghi “Xem trước”) — không fake như dữ liệu thật. Xem Open questions.

### 2.8 Footer
- Nền `off-white` hoặc `pale-green`, `rounded-t-[32px]`, lá/tre trang trí góc.
- Nội dung giữ nguyên link hiện tại (Liên hệ · Tài liệu · Nâng cấp VIP) + copyright.
- Cột bổ sung nếu muốn: Giới thiệu · Điều khoản (tùy chọn).

---

## 3. Component inventory (tạo mới)

Tất cả đặt trong `src/components/home/*`:

| File | Mô tả |
|---|---|
| `home-navbar.tsx` | Pill navbar floating, 2 trạng thái auth (nhận `user` prop từ RSC) |
| `home-footer.tsx` | Footer panda, bo trên 32px, decoration |
| `hero-section.tsx` | Hero + CTA + panda 2 bên + decorations |
| `feature-grid.tsx` | 6 feature card (tái dùng dữ liệu hiện có) |
| `game-categories.tsx` | 4 tile game |
| `dashboard-section.tsx` | Dashboard học tập (logged-in) |
| `achievements-section.tsx` | Badge hàng |
| `leaderboard-section.tsx` | Bảng xếp hạng preview |
| `panda-decoration.tsx` | SVG panda/bamboo/leaf/blob (dùng chung) |
| `floating-leaves.tsx` | Overlay lá bay (motion nhẹ) |

> Tái dùng `Button`/`Card`/`Badge` từ `src/components/ui/*`; nếu cần style mới (pill CTA xanh) thì thêm variant `home-cta` hoặc className override — **không sửa component ui chung** tránh vỡ trang trong app.

---

## 4. Responsive

- **Mobile (<md):** navbar thu gọn hamburger; hero 1 cột (panda nhỏ hơn, đặt 2 bên hoặc ẩn 1 bên); dashboard card xếp dọc; game tile 2 cột → 1 cột; leaderboard top 3.
- **Tablet/Desktop (≥md):** layout theo wireframe; hero 2 cột panda–text hoặc text giữa + panda 2 bên; grid 2→3 cột.
- Whitespace co lại trên mobile (`py-16` → `py-10`), radius giữ nguyên.
