const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const viPath = path.join(__dirname, '../messages/vi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

Object.assign(en.Practice, {
  "errorLoadChars": "Cannot load character list.",
  "errorStart": "Cannot start. Please try again.",
  "loadingChars": "Loading character list...",
  "initError": "Initialization error",
  "writingLobby": "Hanzi Writing Lobby",
  "starting": "Starting...",
  "practiceAll": "Practice All (Sequentially)",
  "noHanzi": "No Hanzi found in this lesson.",
  "lessonNotFound": "Lesson not found",
  "lessonNotFoundDesc": "Please select a lesson from the Dashboard to start practicing Hanzi writing.",
  "goToDashboard": "Go to Dashboard"
});

Object.assign(vi.Practice, {
  "errorLoadChars": "Không thể tải danh sách chữ.",
  "errorStart": "Không thể bắt đầu. Vui lòng thử lại.",
  "loadingChars": "Đang tải danh sách chữ...",
  "initError": "Lỗi khởi tạo",
  "writingLobby": "Sảnh chờ luyện chữ",
  "starting": "Đang bắt đầu...",
  "practiceAll": "Luyện toàn bộ (Lần lượt)",
  "noHanzi": "Không có chữ Hán nào trong bài học này.",
  "lessonNotFound": "Không tìm thấy bài học",
  "lessonNotFoundDesc": "Vui lòng chọn một bài học từ Bảng điều khiển để bắt đầu luyện viết chữ Hán.",
  "goToDashboard": "Về Bảng điều khiển"
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
console.log('I18n updated for Writing');
