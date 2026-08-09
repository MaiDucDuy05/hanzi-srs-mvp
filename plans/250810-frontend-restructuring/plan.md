# Frontend Folder Restructure - COMPLETED

## Cấu trúc mới

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Route group: auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (student)/               # Route group: student pages
│   │   ├── layout.tsx           # AuthGuard
│   │   ├── dashboard/
│   │   ├── games/
│   │   ├── practice/
│   │   ├── study/
│   │   └── profile/
│   │
│   ├── admin/                   # /admin/*
│   │   └── layout.tsx           # AdminGuard
│   │
│   ├── teacher/                 # /teacher/*
│   │   └── layout.tsx           # TeacherGuard
│   │
│   ├── topics/
│   ├── tests/
│   ├── contact/
│   ├── resources/
│   ├── mistake-book/
│   └── upgrade-vip/
│
├── features/                    # Tất cả components, hooks, page features
│   ├── ui/
│   │   └── components/          # Shared UI: Button, Card, Modal, etc.
│   │
│   ├── layout/
│   │   └── components/          # AuthGuard, AdminGuard, Navbar, Footer
│   │
│   ├── auth/
│   │   ├── components/          # LoginForm, RegisterForm
│   │   └── page-features/       # Auth page logic
│   │
│   ├── admin/
│   │   ├── components/          # EntityManager
│   │   ├── hooks/               # Admin hooks
│   │   └── page-features/       # AdminCurriculumFeature, etc.
│   │
│   ├── teacher/
│   │   ├── components/
│   │   └── page-features/       # TeacherDashboardFeature, etc.
│   │
│   ├── games/
│   │   └── components/          # BalloonMode, MemoryMode, WritingMode, etc.
│   │
│   ├── practice/
│   │   └── components/          # Session, FlashcardMode, etc.
│   │
│   ├── tests/
│   │   └── components/          # TestQuestionForm, TestResultCard, etc.
│   │
│   ├── background/
│   │   └── components/         # ForestBackground, etc.
│   │
│   ├── contact/
│   │   └── components/         # ContactForm
│   │
│   └── home/
│       └── components/          # HeroSection, PandaDecoration
│
├── lib/                         # Utilities, API, hooks
│   ├── api/
│   ├── auth/
│   ├── utils/
│   └── hooks/
│
└── assets/
```

## Quy tắc
- **Pages** chỉ export `default Page` component
- **Logic** đặt trong `features/{domain}/page-features/` hoặc `features/{domain}/`
- **Components** đặt trong `features/{domain}/components/`
- **Hooks** đặt trong `features/{domain}/hooks/`

## Build Status: ✅ PASSED (32 routes)
