# Design System — Cute Panda Forest (Homepage `/`)

Eco minimalism · fresh nature · panda forest · soft organic · playful-clean.
Không dark · không gradient nặng · không cạnh sắc · không illustration realistic.

---

## 1. Màu sắc (Color Palette)

### Primary
| Token | Hex | Vai trò |
|---|---|---|
| `forest-green` | `#5E7F26` | Màu chính (heading, link, text nhấn) |
| `olive-green` | `#6E8B2D` | Biến thể primary (hover, icon) |
| `bamboo-green` | `#78993A` | Biến thể nhạt hơn (border, divider, nhấn phụ) |

### Secondary (nền pastel)
| Token | Hex | Vai trò |
|---|---|---|
| `light-bamboo` | `#DDE8A6` | Nền section, nhấn nhẹ |
| `soft-lime` | `#EAF3C5` | Nền card/highlight |
| `pale-green` | `#F3F8D7` | Nền panel rộng, feature |
| `mint-cream` | `#FAFCEC` | Nền trang chủ tổng thể |

### Accent (CTA)
| Token | Hex | Vai trò |
|---|---|---|
| `lime-green` | `#C7CF35` | Nút CTA chính (pill, text trắng) |
| `fresh-olive` | `#B8C533` | Hover của CTA, accent nhỏ |

### Neutral
| Token | Hex | Vai trò |
|---|---|---|
| `white` | `#FFFFFF` | Card, navbar |
| `off-white` | `#FBFBF8` | Nền phụ, nền footer |

> **Ghi chú:** brief chỉ định text trắng trên CTA `#C7CF35` (contrast thấp — xem Open questions plan.md). Text thân nên dùng `forest-green` tối hoặc xám `#4a5a3a` để đọc rõ trên nền pastel.

---

## 2. Typography

- **Heading:** bo tròn, dày, dễ thương → `Poppins` / `Nunito` / `Fredoka` / `Baloo 2` (chọn 1).
- **Body:** sạch, dễ đọc → `Inter` / `Quicksand`.

### Type scale (gợi ý)
| Style | Size | Weight | Line-height |
|---|---|---|---|
| Display (hero) | 48–56px (text-5xl/6xl) | 700–800 | 1.1 |
| H1 | 36–44px (text-4xl/5xl) | 700 | 1.15 |
| H2 (section) | 28–32px (text-3xl/4xl) | 700 | 1.2 |
| H3 (card) | 20–24px (text-xl/2xl) | 700 | 1.25 |
| Body | 16px (text-base) | 400–500 | 1.6 |
| Small / caption | 14 / 12px | 500 | 1.5 |

> Triển khai: `next/font/google` (Poppins heading + Inter body) hoặc fallback system rounded stack. Xem `03-implementation-guide.md`.

---

## 3. Spacing & Layout

- Thang cơ bản 4px (Tailwind default) — nhưng **generous whitespace**:
  - Section padding: `py-16`–`py-24` (64–96px).
  - Container: `max-w-6xl`–`max-w-7xl`, `px-4/6`.
  - Gap giữa card: 24–32px (`gap-6/8`).
- Bố cục thoáng, ít yếu tố trên 1 dòng, nhiều khoảng trắng giữa các section.

---

## 4. Radius & Shadow

### Radius (bo mọi nơi, không cạnh sắc)
| Token | Value | Dùng cho |
|---|---|---|
| `rounded-lg` | 12px | icon nhỏ, badge |
| `rounded-2xl` | 16px | card nhỏ, input |
| `rounded-3xl` | 24px | card lớn, panel, navbar |
| `rounded-[32px]` | 32px | hero panel, section lớn |
| `rounded-full` (pill) | 9999px | **CTA button**, badge, avatar |

### Shadow (rất nhẹ)
```
shadow-soft: 0 8px 24px rgba(94, 127, 38, 0.08);
shadow-lift: 0 12px 32px rgba(94, 127, 38, 0.12);  /* hover */
```

---

## 5. Motion & Animation (calm, relaxing)

| Motion | Spec |
|---|---|
| Lá bay (floating leaves) | translateY ±16px + rotate ±8°, loop 8–12s, `ease-in-out`, ngẫu nhiên delay |
| Panda idle | bob nhẹ translateY ±6px, 2–2.5s loop |
| Fade transition | opacity 0→1 + translateY 8px, 300–450ms, `ease-out` |
| Button hover | `scale(1.03)` + shadow nhẹ, 150–200ms |
| Button click | `scale(0.97)` bounce nhẹ |
| Card hover | translateY -4px + shadow-lift, 200ms |

**Bắt buộc:** tôn trọng `prefers-reduced-motion` (đã có sẵn trong `globals.css`).

---

## 6. Illustration & Decoration (flat 2D)

- **Nhân vật:** gấu trúc cute (đen-trắng, má hồng), dáng ngồi/đứng/bọc tre — 2D phẳng, không realistic.
- **Thiên nhiên:** tre (bamboo), lá, cỏ, đá nhỏ, hoa nhỏ, mây — dùng làm decoration trải quanh page.
- **Hình khối hữu cơ:** blob shapes (bo cong bất quy tắc) cho nền section, không góc vuông.
- **Không:** gradient nặng, outline sắc, bóng đổ mạnh, ảnh thật.
- Nguồn MVP: SVG inline thủ công (`components/home/panda-decoration.tsx`) — nhẹ, không thêm dependency, dễ chỉnh màu theo token.

---

## 7. Component Tokens

| Component | Spec |
|---|---|
| **CTA Button (pill)** | `bg #C7CF35`, text trắng, `rounded-full`, padding `px-7 py-3.5`, `text-base font-bold`, hover `scale(1.03)` + `bg #B8C533`; secondary = outline viền `bamboo-green` text `forest-green` |
| **Card** | nền `white`, `rounded-3xl`, `shadow-soft`, padding `p-6/8`, hover `-translate-y-1 + shadow-lift` |
| **Navbar (sticky, rounded)** | sticky top, `rounded-full`, nền `white/70 backdrop-blur`, cách lề trên 12px (floating pill), logo 🐼 + tên, links, CTA |
| **Badge / chip** | `rounded-full`, nền `soft-lime` text `forest-green`, `px-3 py-1 text-sm font-semibold` |
| **Section heading** | badge nhỏ phía trên + H2 đậm + subtext xám nhẹ, căn giữa hoặc trái |
| **Achievement badge** | vòng tròn `rounded-full` nền `pale-green`, icon +ngôi sao, nhận-được thì nổi màu `lime-green` |
| **Leaderboard row** | card hàng: rank (huy chương 🥇🥈🥉), avatar tròn, tên, điểm — highlight top 3 |
| **Footer** | nền `off-white` hoặc `pale-green`, bo trên `rounded-t-[32px]`, lá/tre trang trí góc, links |

---

## 8. Do / Don't checklist

- ✅ Bo góc 16–32px mọi nơi · ✅ shadow rất nhẹ · ✅ flat 2D · ✅ pastel · ✅ whitespace rộng
- ✅ nút pill 32px · ✅ animation nhẹ, thư giãn · ✅ decoration lá/tre/panda
- ❌ dark theme · ❌ gradient nặng · ❌ cạnh sắc · ❌ illustration realistic · ❌ màu chói/neon
