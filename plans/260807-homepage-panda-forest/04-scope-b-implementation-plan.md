# Scope-B Implementation Plan — App-wide Panda Forest Theme

**Date:** 2026-08-07
**Decision:** Scope B (App-wide): brand → forest green, rounded font, light-only, toàn app.

---

## Architecture Impact

Scope B simplifies the architecture vs the original plan:
- **NO route groups needed** — AppShell stays single shell, just panda-restyled
- **CSS variable trick**: All components use `--brand`, `--brand-dark`, `--brand-light` — changing VALUES in globals.css auto-updates every component. Minimal component changes.
- **Dark mode removed globally** — must strip `dark:` classes from all `.tsx` files

---

## Phases

### Phase 0: Design Tokens & Fonts (2 files)

**0.1 globals.css** — Replace token values, add panda tokens, remove dark mode block

```
:root {
  --background: #FAFCEC;     /* was #fafafa → mint-cream */
  --foreground: #4a5a3a;    /* was #171717 → soft dark green */
  --brand: #5E7F26;          /* was #c8102e → forest-green */
  --brand-dark: #4a6520;     /* was #a10d26 → darker forest */
  --brand-light: #F3F8D7;    /* was #fdeaea → pale-green */

  /* New panda tokens */
  --color-forest: #5E7F26;
  --color-olive: #6E8B2D;
  --color-bamboo: #78993A;
  --color-light-bamboo: #DDE8A6;
  --color-soft-lime: #EAF3C5;
  --color-pale-green: #F3F8D7;
  --color-mint-cream: #FAFCEC;
  --color-accent-lime: #C7CF35;
  --color-accent-olive: #B8C533;
  --color-off-white: #FBFBF8;
}
```

Add to `@theme inline`:
```
--color-forest: var(--color-forest);
--color-olive: var(--color-olive);
... (all new tokens)
--font-heading: var(--font-poppins), ...;
--radius-3xl: 24px;      /* new */
--radius-4xl: 32px;      /* new */
--shadow-soft: 0 8px 24px rgba(94, 127, 38, 0.08);
--shadow-lift: 0 12px 32px rgba(94, 127, 38, 0.12);
```

Remove: `@media (prefers-color-scheme: dark) { :root { ... } }` block entirely.

**0.2 src/app/layout.tsx** — Add Poppins + Inter global fonts
- Import Poppins (weights: 400,500,600,700,800) + Inter
- Set CSS variables: `--font-poppins`, `--font-inter`
- Update `--font-heading` reference in globals.css

---

### Phase 1: Shell Restyle (3 files)

**1.1 navbar.tsx** — Floating pill panda navbar
- Replace `border-b bg-white/90` with `rounded-full bg-white/70 backdrop-blur shadow-soft` + top margin
- Logo: 🐼 emoji + "Hán Tự HSK" in forest-green bold
- Links: replace `text-brand` / `bg-brand-light` / `dark:` variants with forest tones
- Auth area: pill CTA (non-logged-in), panda-styled avatar+menu (logged-in)
- Mobile: hamburger → rounded drawer
- **Remove ALL `dark:` prefixed classes**

**1.2 footer.tsx** — Panda footer
- Replace `border-t border-gray-200` with `rounded-t-[32px] bg-off-white`
- Add leaf/bamboo SVG decoration (inline)
- Replace `hover:text-brand` → `hover:text-forest`
- Remove dark classes

**1.3 app-shell.tsx** — Minimal change if any
- Already just wraps `<Navbar><main><Footer>` — theme passes through automatically

---

### Phase 2: UI Components Dark Mode Removal (8 files + search)

All UI components have `dark:` variants that must be removed. Since `--brand` values changed, the light-theme colors will naturally match the panda palette.

**2.1 card.tsx** — Remove dark classes, add panda radius
- `rounded-3xl` (was `rounded-xl`)
- Replace `shadow-sm` with `shadow-[0_8px_24px_rgba(94,127,38,0.08)]`
- Remove `dark:border-gray-800 dark:bg-gray-900` 
- CardHeader: remove `dark:border-gray-800`, update title to `text-foreground`

**2.2 badge.tsx** — Remove dark classes, update tones
- Remove all `dark:bg-*-900/40 dark:text-*-300` pairs
- Update tones to use forest-adjacent colors: green → soft-lime, red → red-200/700

**2.3 form.tsx** — Remove dark classes
- Input/Select/Textarea: remove `dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100`
- Field: remove `dark:text-gray-300`

**2.4 button.tsx** — Remove dark, add panda variant
- Remove `disabled:bg-gray-300 disabled:text-gray-500` from primary (panda contrast)
- Primary already uses `--brand` → auto green. Good.
- Add optional `rounded="full"` prop for pill CTAs

**2.5-2.8** spinner.tsx, modal.tsx, tabs.tsx, pagination.tsx, empty-state.tsx, error-state.tsx, audio-button.tsx
- Remove `dark:` classes from each

**2.9 Global dark-mode sweep**: Grep all `.tsx` files for `dark:` class strings and remove them. Key files:
- All pages under `src/app/*/page.tsx`
- All layout files
- All component files

---

### Phase 3: Homepage Components (10 new files)

All in `src/components/home/*`:

**3.1 panda-decoration.tsx** — SVG illustrations
- Panda (black-white with pink cheeks), bamboo stalk, leaves, grass, stone, flower, cloud, blob shape
- Accept `className` prop, use forest tokens for coloring
- Flat 2D vector style, no realistic rendering

**3.2 floating-leaves.tsx** — Leaf animation overlay
- CSS keyframes: translateY ±16px + rotate ±8°, 8-12s loop, random delay
- Respect `prefers-reduced-motion` (existing rule in globals.css)

**3.3 hero-section.tsx** — Homepage hero
- Background: pale-green/mint-cream, organic blob decoration
- Center: 🐼 badge → H1 (bold, heading font) → subtitle → 2 CTAs
- Left/right: panda + bamboo decorations
- Floating leaves overlay
- Props: `user: User | null` for CTA differentiation

**3.4 feature-grid.tsx** — 6 feature cards
- Map existing FEATURES array
- Card: white, rounded-3xl, shadow-soft, hover: -translate-y-1
- Icon emoji in soft-lime circle → title → description

**3.5 game-categories.tsx** — 4 game tiles
- Bắn bóng Pinyin · Memory · Luyện viết Hán tự · Nối từ
- Each with different background (light-bamboo/soft-lime/pale-green/mint-cream)
- SVG illustration + name + "Chơi ngay" arrow

**3.6 dashboard-section.tsx** — Learning dashboard (logged-in only)
- Welcome card: greeting + streak 🔥 + points ⭐
- "Tiếp tục học" pill → /learn
- "Ôn tập hôm nay" → placeholder text (no fake data)
- HSK progress bar → placeholder
- Quick links: Sổ lỗi sai · Hồ sơ · Nâng cấp VIP
- Data source notes in code comments

**3.7 achievements-section.tsx** — Badge row
- Rounded circles, pale-green bg, got-it = lime-green + check
- Preview badges: Nhập môn · Chuỗi 3 ngày · 100 từ · Chiến thắng đầu tiên
- All marked as "Xem trước" (no real data)

**3.8 leaderboard-section.tsx** — Leaderboard preview
- Top 5 rows with medals 🥇🥈🥉, avatar circle, name, points
- Labeled "Xem trước" (mock data, clearly marked)
- CTA "Xem bảng xếp hạng" → placeholder route or hidden

**3.9 cta-section.tsx** — Bottom CTA (guest only)
- "Sẵn sàng bắt đầu?" heading + "Đăng ký miễn phí" CTA pill
- Organic blob decoration

**3.10 home-footer.tsx** — Panda footer
- Alternative: update existing footer.tsx directly (see Phase 1.2)

---

### Phase 4: Homepage Integration (1 file)

**4.1 src/app/page.tsx** — Rewrite as panda homepage composer
- RSC with `getServerUser()` for auth state
- Section order per auth:
  - **Guest:** Hero → Features → Game Categories → Achievements → Leaderboard → CTA
  - **Logged-in:** Hero (compact) → Dashboard → Features (smaller) → Game Categories → Achievements → Leaderboard
- SEO metadata updated

---

### Phase 5: Global Dark Mode Cleanup

**5.1** Run grep for `dark:` across all `.tsx` files in `src/`
**5.2** Remove all `dark:` prefixed Tailwind utility classes
**5.3** Verify no dark mode references remain in globals.css

---

### Phase 6: Verify

| Check | Command |
|---|---|
| Lint | `npm run lint` |
| Build | `npm run build` |
| Test | `npm test` |
| Smoke guest | / renders landing with panda theme |
| Smoke user | Login → dashboard shows; logout → landing |
| Smoke app pages | /learn, /practice, /games still themed forest-green |
| Smoke mobile | Responsive navbar hamburger works |

---

## Files Summary

### Create (10)
```
src/components/home/panda-decoration.tsx
src/components/home/floating-leaves.tsx
src/components/home/hero-section.tsx
src/components/home/feature-grid.tsx
src/components/home/game-categories.tsx
src/components/home/dashboard-section.tsx
src/components/home/achievements-section.tsx
src/components/home/leaderboard-section.tsx
src/components/home/cta-section.tsx
```

### Modify (~25+)
```
src/app/globals.css           — tokens, remove dark mode
src/app/layout.tsx              — fonts
src/app/page.tsx                — homepage rewrite
src/components/layout/navbar.tsx — panda pill
src/components/layout/footer.tsx — panda footer
src/components/ui/card.tsx      — rounded-3xl, no dark
src/components/ui/badge.tsx     — no dark, panda tones
src/components/ui/button.tsx    — rounded-full option
src/components/ui/form.tsx      — no dark
src/components/ui/spinner.tsx   — no dark
src/components/ui/modal.tsx     — no dark
src/components/ui/tabs.tsx      — no dark
src/components/ui/pagination.tsx — no dark
src/components/ui/empty-state.tsx — no dark
src/components/ui/error-state.tsx — no dark
src/components/ui/audio-button.tsx — no dark
Plus all page files with dark: classes
```

### No change
```
src/proxy.ts
src/lib/* (auth, api, utils)
All route handlers
```

---

## Success Criteria
- `/` renders 2 states (guest/user) per wireframe
- Design tokens match brief: exact hex, rounded corners, forest CTA pill
- No dark mode remaining — zero `dark:` classes, zero `prefers-color-scheme` in CSS
- Light-only, soft shadows, organic rounded corners, ample whitespace
- Motion: leaf float, panda idle, fade, hover scale — respects `prefers-reduced-motion`
- `npm run lint` · `npm run build` · `npm test` all pass
- Components in `src/components/home/*`, reuse `src/components/ui/*`
