# Module: Nội dung học (Curriculum)

## 1. Tổng quan Module
Module này chịu trách nhiệm quản lý, phân loại và hiển thị toàn bộ nội dung học tập chính (từ vựng, ngữ pháp) của hệ thống. Nội dung được số hóa dựa trên giáo trình HSK tiêu chuẩn và các chủ đề mở rộng.

## 2. Chi tiết Nghiệp vụ & Tiêu chí nghiệm thu

### **FR-01: Danh mục từ vựng/ngữ pháp theo cấp độ HSK**
**Actor:** All (Free, VIP, Teacher, Admin)
**Mục đích:** Cung cấp lộ trình học theo từng cấp HSK (1 đến 9).

**Nghiệp vụ chi tiết:**
* Dữ liệu được chia cấp bậc: Cấp HSK -> Bài học (Lesson) -> Từ vựng/Ngữ pháp.
* Mỗi từ vựng có cấu trúc chuẩn: Chữ Hán (giản thể), Pinyin, Âm Hán Việt, Nghĩa tiếng Việt, Từ loại, Câu ví dụ và Audio phát âm.
* Ngữ pháp bao gồm: Tên cấu trúc, Công thức, Ý nghĩa, Cách dùng và Ví dụ minh họa.

**Tiêu chí nghiệm thu (AC):**
* Giao diện hiển thị dạng danh sách (List/Grid) các khóa học HSK 1-9.
* Khi click vào một cấp, hiển thị danh sách các bài học. Bài nào đã hoàn thành sẽ có checkmark xanh.
* Trang chi tiết từ vựng cho phép click để nghe audio phát âm.
* Có tính năng phân trang (Pagination) hoặc Lazy load nếu số lượng từ vựng trong bài quá dài (ví dụ > 50 từ).

---

### **FR-02: Học theo chủ đề (Thematic Learning)**
**Actor:** All (Ưu tiên thiết kế phù hợp với trẻ em)
**Mục đích:** Học tiếng Trung qua các chủ đề gần gũi trong đời sống, không gò bó theo cấp HSK.

**Nghiệp vụ chi tiết:**
* Từ vựng được gom nhóm theo chủ đề: Động vật, Đồ ăn, Giao thông, Gia đình, v.v.
* Nội dung học ở phần này sẽ ưu tiên hiển thị hình ảnh minh họa (Flashcard có hình) và âm thanh sống động.

**Tiêu chí nghiệm thu (AC):**
* Trang chủ có mục riêng biệt "Học theo chủ đề".
* Mỗi chủ đề có cover image thu hút.
* Từ vựng trong phần chủ đề bắt buộc phải có trường `image_url` minh họa.
* Giao diện bài học chủ đề có gam màu và thiết kế (UI) vui nhộn, nút bấm lớn dễ thao tác hơn trang học HSK tiêu chuẩn.
