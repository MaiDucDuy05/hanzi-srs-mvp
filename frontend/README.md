# Hán Tự HSK — Frontend (Next.js)

Frontend cho nền tảng học tiếng Trung và luyện thi HSK (Hanzi SRS MVP). App kết nối backend NestJS tại `http://localhost:8000/api/v1` (có thể đổi qua biến môi trường `NEXT_PUBLIC_API_URL`).

## Công nghệ

- **Next.js 16 (App Router)** + React 19 + TypeScript strict
- **Tailwind CSS v4** — theme màu thương hiệu đỏ Trung Hoa (`--brand: #c8102e`)
- **hanzi-writer** + **hanzi-writer-data** — luyện viết chữ Hán theo thứ tự nét (PR-13)
- **Vitest** — unit test cho logic thuần

## Bắt đầu

```bash
npm install
npm run dev        # http://localhost:5000
```

Các script:

| Script | Chức năng |
| :--- | :--- |
| `npm run dev` | Dev server cổng 5000 |
| `npm run build` | Build production (kèm type-check) |
| `npm start` | Chạy bản build cổng 5000 |
| `npm run lint` | ESLint |
| `npm test` | Chạy unit test (Vitest) |

Yêu cầu backend NestJS đang chạy ở `http://localhost:8000` (xem `../backend`).

## Cấu trúc

```
src/
├── app/                    # Routes (App Router)
│   ├── learn/              #   Học theo cấp/bài (FR-01)
│   ├── topics/             #   Học theo chủ đề (FR-02)
│   ├── practice/           #   Luyện tập (PR-03/04/09/10/14)
│   ├── games/              #   Mini-game (PR-11/12/13)
│   ├── tests/              #   Bài kiểm tra (PR-05)
│   ├── teacher/            #   Công cụ giáo viên
│   ├── admin/              #   Quản trị nội dung/người dùng
│   ├── resources/          #   Thư viện tài liệu (FR-24)
│   ├── contact/            #   Liên hệ tư vấn (FR-25)
│   ├── upgrade-vip/        #   Đăng ký VIP (FR-26)
│   ├── mistake-book/       #   Sổ lỗi sai (FR-17)
│   └── profile/            #   Hồ sơ & thống kê
├── components/
│   ├── layout/             # Navbar, footer, AuthGuard/TeacherGuard/AdminGuard
│   ├── practice/           #   practice-engine (dùng chung), source-picker, các mode
│   ├── games/              #   HanziWriterCanvas, balloon/memory/writing mode
│   ├── tests/              #   TestQuestionForm
│   ├── admin/              #   EntityManager CRUD dùng chung
│   └── ui/                 #   Button, Card, Modal, Form, Spinner, Tabs, ...
├── lib/
│   ├── api/                # client.ts (fetch + JWT + envelope), endpoints, types
│   ├── auth/               # AuthProvider, useAuth, AuthGuard
│   ├── hooks/use-api.ts    # Hook fetch dữ liệu cho client components
│   ├── hanzi/              # char-data-loader (tải JSON nét chữ theo ký tự)
│   └── utils/              # cn, format, pinyin, constants, storage
└── public/hanzi-data/      # 228 file JSON nét chữ đã chọn (941KB, xem scripts/)
```

## Kiến trúc chính

- **Client Components cho trang dữ liệu**: JWT lưu trong `localStorage` nên mọi trang đọc dữ liệu người dùng là client component (`'use client'`); server components chỉ dùng cho layout/tĩnh.
- **API layer** (`lib/api`): `apiFetch` tự gắn `Authorization: Bearer` từ localStorage, giải nén envelope `{ data, message }`, ném `ApiError` với message tiếng Việt thân thiện.
- **Engine luyện tập dùng chung** (`components/practice/practice-engine.ts`): khôi phục phiên từ `sessionStorage` (không mất tiến độ khi refresh — theo đặc tả), kiểm tra giới hạn lượt PR-14 qua `daily-usage/checkLimit` (pure peek, không tăng lượt), gọi `practice/start` với idempotency key (backend chốt lượt atomic trong transaction, hết lượt trả 429 → hiện màn giới hạn), đếm thời gian, submit kết quả. Cả PracticeSession và GameSession tái sử dụng engine này.
- **Chấm điểm server-side (PR-05)**: backend tự chấm câu (`gradeQuestion`) khi nhận đáp án và tính `score` tổng lúc nộp bài; frontend không còn nhìn thấy `correctAnswer` (chỉ TEACHER/ADMIN được trả). Trang thi thử chỉ hiển thị kết quả do server trả về; `showScoreImmediately=false` thì ẩn điểm ở màn kết thúc.
- **Giới hạn lượt (PR-14)**: Free 3 lượt/bài/ngày theo `activityKey = practiceType:sourceType:sourceId`; VIP/Teacher/Admin không giới hạn. `checkLimit` chỉ xem trước (không tăng lượt) — lượt được chốt atomic lúc `start`; hết lượt hiển thị modal mời nâng cấp VIP.
- **Hanzi writing (PR-13)**: dynamic import `hanzi-writer` trong `useEffect` (an toàn SSR); dữ liệu nét chữ tự host tại `public/hanzi-data/<char>.json`, tải runtime qua `charDataLoader`.

## Triển khai theo đặc tả

| Mã | Tính năng | Trạng thái |
| :--- | :--- | :--- |
| FR-01 | Học theo cấp/bài học | ✅ `/learn`, admin CRUD |
| FR-02 | Học theo chủ đề | ✅ `/topics`, admin quản lý |
| PR-03 | Nối Trung–Pinyin–Việt | ✅ `practice?type=WORD_MATCHING` |
| PR-04 | Flashcard | ✅ `practice?type=FLASHCARD` |
| PR-05 | Bài kiểm tra giáo viên | ✅ `/tests/join`, `/teacher/tests`, chấm server + ẩn đáp án học viên |
| PR-09 | Điền chỗ trống | ✅ `practice?type=FILL_BLANK` |
| PR-10 | Sắp xếp câu | ✅ `practice?type=SENTENCE_ORDERING` |
| PR-11 | Bắn bóng Pinyin | ✅ `games?game=PINYIN_BALLOON` |
| PR-12 | Memory lật thẻ | ✅ `games?game=MEMORY` |
| PR-13 | Luyện viết chữ Hán | ✅ `games?game=WRITING` |
| PR-14 | Giới hạn lượt Free/VIP | ✅ checkLimit (peek) + start atomic + modal nâng cấp |
| FR-01 | Phát audio | ✅ `/api/audio/*` rewrite → backend `GET /api/v1/audio/:key` |
| FR-17 | Sổ lỗi sai | ✅ `/mistake-book` |
| FR-24/25/26 | Tài liệu, liên hệ, VIP | ✅ `/resources`, `/contact`, `/upgrade-vip` |

## Dữ liệu nét chữ (PR-13)

- Script `scripts/copy-hanzi-data.mjs` sao chép 228 ký tự đã chọn từ `node_modules/hanzi-writer-data` sang `public/hanzi-data/` (tránh tải toàn bộ ~49MB của package).
- Muốn mở rộng danh sách ký tự: thêm vào mảng `CHARS` trong script rồi chạy lại `node scripts/copy-hanzi-data.mjs`.

## Lưu ý

- Tài khoản seed của backend dùng scrypt trong khi `auth.service.ts` dùng bcrypt — một số tài khoản seed có thể không đăng nhập được qua API; đăng ký tài khoản mới là được.
- Backend phải chạy riêng (`npm run start:dev` trong `../backend`) để test tích hợp; chỉ PostgreSQL đang lắng nghe ở cổng 5433 là chưa đủ.
