# Implementation Guide — Homepage Cute Panda Forest (Next.js)

Triển khai trong `frontend/` hiện tại. Giả định chọn **scope A (homepage-only theme)** theo `plan.md` — cần user xác nhận trước khi bắt đầu.

---

## 1. Hiện trạng codebase (liên quan)

| File | Trạng thái | Ghi chú |
|---|---|---|
| `src/app/page.tsx` | RSC, `getServerUser()`, hero + FEATURES grid | Sẽ viết lại thành composer các section |
| `src/app/layout.tsx` | `<AuthProvider><AppShell>` bọc toàn app, font Geist | AppShell là nguồn navbar/footer **đỏ** dùng chung |
| `src/components/layout/app-shell.tsx` | Navbar + main + Footer | Sẽ tách khỏi root layout |
| `src/app/globals.css` | `@theme inline` brand `#c8102e` + dark mode | Thêm token xanh, không xoá token cũ |
| `src/components/ui/*` | Button/Card/Badge/... | Tái dùng, thêm style mới qua className |
| `src/proxy.ts` | Route protection (cookie, role gate) | Không đổi — route URL giữ nguyên |

---

## 2. Chiến lược shell (quyết định kiến trúc)

**Vấn đề:** AppShell ở root layout bọc navbar/footer đỏ vào MỌI route, gồm cả `/`. Panda forest cần navbar pill riêng.

**Giải pháp đề xuất — route groups:**

```
src/app/
├── layout.tsx            # html/body + AuthProvider (bỏ AppShell)
├── (home)/
│   ├── layout.tsx        # HomeShell: HomeNavbar + main + HomeFooter
│   └── page.tsx          # Trang chủ panda (move từ src/app/page.tsx)
└── (app)/
    ├── layout.tsx        # AppShell (navbar/footer đỏ hiện tại)
    ├── learn/ practice/ games/ tests/ ...   # move 18 page hiện tại vào đây
    └── ... (proxy.ts giữ nguyên, URL không đổi vì route group không ảnh hưởng path)
```

- URL không đổi (route group `()` không vào path) → `proxy.ts` matcher, link nội bộ, SEO không bị ảnh hưởng.
- Homepage tự do dùng HomeNavbar panda + light-only; các trang trong app giữ nguyên theme đỏ + dark.
- **Rủi ro:** di chuyển nhiều file (mechanical, an toàn với git mv). Cần chạy full `next build` sau khi move.

**Fallback rủi ro thấp (nếu không muốn move files):** giữ AppShell + navbar đỏ trên `/`, chỉ restyle body bằng panda sections — KHÔNG đạt yêu cầu “rounded floating navbar” của brief.

---

## 3. Dữ liệu dashboard (đã đăng nhập)

| Thành phần | Nguồn dữ liệu | Ghi chú |
|---|---|---|
| Tên người dùng / role | `getServerUser()` (đã có) | RSC render thẳng |
| Tiếp tục học | Chưa có API “bài gần nhất” | MVP: link `/learn` + label chung, hoặc dùng `curriculumApi` nếu có `last-visited` |
| Ôn tập hôm nay (SRS) | Chưa có API schedule | MVP: **placeholder** (ví dụ “Chưa có dữ liệu — bắt đầu học nhé”) hoặc ẩn; không fake số |
| Tiến độ HSK / điểm / streak | Chưa có API (FR-18 pending) | MVP: ẩn hoặc hiển thị mẫu kèm nhãn “Xem trước” |
| Achievements | Chưa có API | Như trên: render mẫu rõ ràng là preview |
| Leaderboard | Chưa có API | Mock tạm kèm nhãn “Xem trước” hoặc ẩn hẳn |

> **Nguyên tắc (đúng project rules):** không dùng fake data chạy build/test. Phần thiếu API → render placeholder/ẩn, ghi rõ trong code comment + Open questions.

---

## 4. Các bước triển khai

### Phase 0 — Token & font
1. `globals.css`: thêm vào `@theme inline`:
   - `--color-forest: #5E7F26; --color-olive: #6E8B2D; --color-bamboo: #78993A;`
   - `--color-light-bamboo: #DDE8A6; --color-soft-lime: #EAF3C5; --color-pale-green: #F3F8D7; --color-mint-cream: #FAFCEC;`
   - `--color-accent-lime: #C7CF35; --color-accent-olive: #B8C533;`
   - `--color-off-white: #FBFBF8; --font-heading: ...;`
   - giữ nguyên token đỏ + dark block (không xoá — các trang khác dùng).
2. `layout.tsx`: thêm `next/font/google` `Poppins` (heading) + `Inter` (body) nếu chốt đổi font (xem Open questions); set `--font-heading`.

### Phase 1 — Refactor shell
3. `layout.tsx` root: bỏ `<AppShell>`, chỉ giữ `html/body/AuthProvider`.
4. Tạo `(app)/layout.tsx` → `<AppShell>`; dùng `git mv` đưa các thư mục route hiện tại (`learn, topics, practice, games, tests, teacher, admin, resources, contact, upgrade-vip, mistake-book, profile, login, register`) vào `(app)/`.
5. Tạo `(home)/layout.tsx` → `HomeShell` (chưa có components → Phase 2); `git mv src/app/page.tsx` → `(home)/page.tsx`.
6. **Checkpoint:** `npm run lint && npm run build && npm test` — 0 lỗi trước khi làm tiếp.

### Phase 2 — Components (`src/components/home/*`)
7. `panda-decoration.tsx` — SVG inline: panda cute, bamboo, leaf, grass, stone, flower, cloud, blob shape. Nhận `className` + màu theo token.
8. `floating-leaves.tsx` — overlay lá bay (CSS keyframes, ngẫu nhiên delay/position, `prefers-reduced-motion` no-op).
9. `home-navbar.tsx` — pill floating, nhận `user` prop từ RSC; logged-in hiện avatar + menu.
10. `hero-section.tsx`, `feature-grid.tsx`, `game-categories.tsx`, `dashboard-section.tsx`, `achievements-section.tsx`, `leaderboard-section.tsx`, `home-footer.tsx` — theo `02-layout-and-sections.md`.

### Phase 3 — Ghép trang chủ
11. `(home)/page.tsx`: RSC, `getServerUser()`, render các section theo trạng thái user (wireframe mục 1, `02-layout-and-sections.md`).
12. Style CTA pill: dùng `Button` hiện có + className `rounded-full bg-accent-lime text-white px-7 py-3.5 font-bold hover:scale-105 hover:bg-accent-olive transition` (không sửa `button.tsx` chung).

### Phase 4 — Verify
13. `npm run lint` · `npm run build` · `npm test` — 0 lỗi.
14. Smoke: guest → landing đủ sections; login → dashboard hiện; logout → về landing; `/learn` vẫn theme đỏ/dark như cũ; mobile navbar/hamburger hoạt động.
15. Delegate `code-reviewer` agent review (theo primary workflow) + cập nhật docs `frontend/README.md` nếu đổi cấu trúc.

---

## 5. Files

**Tạo mới**
```
src/app/(home)/layout.tsx
src/app/(home)/page.tsx            (move từ src/app/page.tsx)
src/app/(app)/layout.tsx
src/components/home/home-navbar.tsx
src/components/home/home-footer.tsx
src/components/home/hero-section.tsx
src/components/home/feature-grid.tsx
src/components/home/game-categories.tsx
src/components/home/dashboard-section.tsx
src/components/home/achievements-section.tsx
src/components/home/leaderboard-section.tsx
src/components/home/panda-decoration.tsx
src/components/home/floating-leaves.tsx
```

**Sửa**
```
src/app/layout.tsx                 (bỏ AppShell, thêm font)
src/app/globals.css                (thêm token panda)
frontend/README.md                 (cấu trúc mới)
```

**Không đổi**
```
src/proxy.ts · src/components/ui/* · src/lib/* (trừ khi cần) · các route trong (app)/
```

---

## 6. Risk & mitigation

| Risk | Mitigation |
|---|---|
| Move 18 page → vỡ import/link | `git mv`, chạy build ngay sau Phase 1; route group không đổi URL nên proxy/SEO an toàn |
| Contrast CTA trắng trên #C7CF35 thấp | Giữ theo brief; ghi chú accessibility; optional fallback text xanh đậm |
| Đổi font toàn app (nếu thêm Poppins/Inter global) | Chỉ set `--font-heading` dùng ở homepage; body app giữ nguyên nếu muốn |
| Dark mode homepage | Homepage dùng token light cố định (không theo `prefers-color-scheme`) |
| Illustration tốn công | MVP dùng SVG inline đơn giản (panda, bamboo, leaf) — đủ “premium, approachable”, không cần ảnh |
