const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const viPath = path.join(__dirname, '../messages/vi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

en.Exams = {
  "startConfirm": "Start exam: {name}?",
  "startError": "Cannot start exam.",
  "loading": "Loading exams list...",
  "subtitle": "My Exams & Assessments",
  "title": "My Exams",
  "filterAll": "All ({count})",
  "filterPending": "Pending ({count})",
  "filterSubmitted": "Submitted ({count})",
  "filterCompleted": "Completed ({count})",
  "searchPlaceholder": "Search exams...",
  "badgePending": "Pending",
  "badgeCompleted": "Completed",
  "badgeSubmitted": "Submitted",
  "badgeExpiring": "Expiring Soon",
  "badgeUpcoming": "Upcoming",
  "unnamedExam": "Unnamed Exam",
  "noDescription": "No description for this exam.",
  "minutes": "Minutes",
  "due": "Due:",
  "attempts": "Attempts",
  "notOpenedYet": "Not opened yet",
  "continueExam": "Continue exam",
  "viewResults": "View results",
  "btnSubmitted": "Submitted",
  "btnExpired": "Expired",
  "startExam": "Start exam",
  "noExams": "No exams available",
  "noExamsDesc": "You currently have no exams in this category. Relax and practice more!"
};

vi.Exams = {
  "startConfirm": "Bắt đầu làm bài: {name}?",
  "startError": "Không thể bắt đầu làm bài.",
  "loading": "Đang tải danh sách bài kiểm tra...",
  "subtitle": "My Exams & Assessments",
  "title": "Bài kiểm tra của tôi",
  "filterAll": "Tất cả ({count})",
  "filterPending": "Đang chờ làm ({count})",
  "filterSubmitted": "Đang chờ chấm ({count})",
  "filterCompleted": "Đã hoàn thành ({count})",
  "searchPlaceholder": "Tìm kiếm bài thi...",
  "badgePending": "Pending",
  "badgeCompleted": "Completed",
  "badgeSubmitted": "Submitted",
  "badgeExpiring": "Expiring Soon",
  "badgeUpcoming": "Upcoming",
  "unnamedExam": "Bài kiểm tra không tên",
  "noDescription": "Không có mô tả cho bài kiểm tra này.",
  "minutes": "Phút",
  "due": "Hạn chót:",
  "attempts": "Lượt làm",
  "notOpenedYet": "Chưa tới giờ mở đề",
  "continueExam": "Tiếp tục làm bài",
  "viewResults": "Xem kết quả",
  "btnSubmitted": "Đã nộp",
  "btnExpired": "Đã hết hạn",
  "startExam": "Bắt đầu làm bài",
  "noExams": "Không có bài kiểm tra nào",
  "noExamsDesc": "Bạn hiện không có bài kiểm tra nào trong danh mục này. Hãy thư giãn và luyện tập thêm nhé!"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
console.log('I18n updated for Exams');
