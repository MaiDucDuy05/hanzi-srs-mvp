# Module: AI Generation

## 1. Tổng quan Module
Sử dụng LLM (Large Language Model) như OpenAI/Gemini để tự động hóa việc tạo nội dung học tập và phân tích dữ liệu, giúp cá nhân hóa lộ trình học.

## 2. Chi tiết Nghiệp vụ & Tiêu chí nghiệm thu

### **FR-15: Tạo câu chuyện từ danh sách từ vựng (AI Story)**
**Mục đích:** Giúp người dùng ghi nhớ từ vựng qua ngữ cảnh (Storytelling).

**Nghiệp vụ chi tiết:**
* Người dùng (hoặc Giáo viên) chọn một tập hợp các từ vựng (ví dụ từ sổ lỗi sai, hoặc bài học hiện tại).
* Gửi prompt tới AI yêu cầu tạo một câu chuyện ngắn bằng tiếng Trung.
* Ngữ pháp và các từ đệm trong câu chuyện không được vượt quá độ khó của cấp HSK tương ứng (VD: từ vựng HSK3 thì AI chỉ dùng ngữ pháp <= HSK3).

**Tiêu chí nghiệm thu (AC):**
* Request/Response API phải thành công trả về text câu chuyện.
* Câu chuyện phải bôi đậm (highlight) những từ vựng được yêu cầu.
* Mức độ bao phủ: AI phải sử dụng thành công ít nhất 90% số lượng từ được yêu cầu trong input.
* Tính bất đồng bộ: Vì LLM có thể chậm, UI phải có skeleton/loading state (tối đa 15s).

---

### **FR-16: Gợi ý lộ trình học cho giáo viên**
**Mục đích:** Phân tích dữ liệu học sinh để đưa ra khuyến nghị giảng dạy.

**Nghiệp vụ chi tiết:**
* Dựa vào dữ liệu từ Sổ lỗi sai (tần suất làm sai một điểm ngữ pháp) và kết quả thi.
* Hệ thống tổng hợp thành báo cáo và dùng AI phân tích điểm yếu cốt lõi.

**Tiêu chí nghiệm thu (AC):**
* Giáo viên có một tab "AI Insights" trong dashboard lớp học.
* Gợi ý rõ ràng: "Lớp yếu kỹ năng X", "Nên ôn lại bài Y".
* Tự động đề xuất các bài tập từ ngân hàng câu hỏi phù hợp để vá lỗ hổng kiến thức.
