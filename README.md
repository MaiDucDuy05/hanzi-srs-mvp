# HSK Learning Platform (Hanzi SRS MVP)

Nền tảng học tiếng Trung và luyện thi HSK toàn diện, được thiết kế với kiến trúc hiện đại, tập trung vào việc học từ vựng, ngữ pháp và các kỹ năng thông qua hệ thống luyện tập tương tác (Gamification) và hệ thống lặp lại ngắt quãng (SRS).

Dự án này là phiên bản MVP (Minimum Viable Product) được tối ưu cho đội dự án nhỏ triển khai, với lộ trình rõ ràng từ thiết kế dữ liệu đến API và giao diện.

## 🚀 Công nghệ sử dụng (Tech Stack)

### Frontend
- **Framework:** Next.js (React)
- **Thư viện chính:** 
  - `hanzi-writer` (Hiển thị và kiểm tra nét chữ Hán)
  - DOM/CSS Animation cho các mini-game

### Backend
- **Framework:** NestJS
- **Database:** PostgreSQL
- **Storage/CDN:** AWS S3 & CloudFront (Lưu trữ audio, hình ảnh, JSON nét chữ Hán)

## 📦 Cấu trúc Module

Dự án được thiết kế xoay quanh 6 module nghiệp vụ chính:

1. **Curriculum (Chương trình học):** 
   - Quản lý kho từ vựng, ngữ pháp, bài học theo các cấp độ HSK.
2. **Test Engine (Kiểm tra & Luyện tập):** 
   - Bài kiểm tra do giáo viên tự tạo và quản lý.
   - Bài tập flashcard, điền chỗ trống, sắp xếp câu.
   - **Mini-games:** Game bắn bóng luyện Pinyin, Game Memory lật thẻ tìm cặp.
   - Luyện viết chữ Hán theo thứ tự nét.
3. **AI Generation:** Sinh dữ liệu bài tập và ví dụ tự động bằng AI.
4. **Progress Tracking:** Theo dõi tiến độ học tập và ôn tập.
5. **Teacher Tools:** Công cụ giao bài và quản lý học sinh dành cho giáo viên.
6. **Resources & Commerce (Subscription):** 
   - Quản lý phân quyền người dùng (Free, VIP, Teacher, Admin).
   - Kiểm soát giới hạn lượt luyện tập hàng ngày (Rate limiting).

## 📂 Tài liệu dự án (Documentation)

Toàn bộ đặc tả yêu cầu (BRD) và thiết kế chi tiết các chức năng (FR/PR) được viết bằng Markdown và lưu trữ tại thư mục `docs/`. Bạn có thể tra cứu nhanh:

- [Tài liệu tổng quan (BRD gốc)](./docs/docs.md)
- [Tài liệu các Module chi tiết](./docs/modules/)

*Lưu ý: Các file đặc tả quy định rõ cấu trúc Database, các API cần thiết và luồng hoạt động UI/UX.*

## ⚙️ Hướng dẫn cài đặt (Getting Started)

*(Phần này sẽ được cập nhật chi tiết khi khởi tạo bộ source code gốc)*

### Yêu cầu hệ thống cơ bản:
- Node.js (v18 trở lên)
- PostgreSQL (v14 trở lên)
- Package manager: `npm`, `yarn` hoặc `pnpm`

### Các bước dự kiến:
1. Clone repository.
2. Chạy `npm install` tại thư mục frontend và backend.
3. Thiết lập biến môi trường `.env` cho kết nối DB và các API keys (nếu có).
4. Chạy migration tạo bảng trong PostgreSQL.
5. Chạy `npm run dev` để khởi động môi trường phát triển.

## 📜 Giấy phép & Mã nguồn tham khảo

- Hệ thống có tham khảo mã nguồn **Wenbun** cho luồng luyện viết chữ Hán và quản lý phiên phía client.
- Dữ liệu nét chữ Hán lấy từ **hanzi-writer-data** (Arphic Public License).
- Quản lý hiển thị chữ Hán bằng **hanzi-writer** (MIT License).
