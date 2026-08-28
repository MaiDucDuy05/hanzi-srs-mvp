const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const viPath = path.join(__dirname, '../messages/vi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

en.Resources = {
  "downloadError": "Cannot download this document. Please try again later.",
  "loadError": "Error loading document",
  "title": "Reference Documents",
  "subtitle": "View and download documents, textbooks, and lectures",
  "searchPlaceholder": "Search documents...",
  "notFound": "No documents found",
  "notFoundDesc": "Try searching with a different keyword or come back later.",
  "defaultDesc": "Basic textbook for beginners."
};

vi.Resources = {
  "downloadError": "Không thể tải tài liệu này. Vui lòng thử lại sau.",
  "loadError": "Lỗi khi tải tài liệu",
  "title": "Tài liệu tham khảo",
  "subtitle": "Xem và tải các tài liệu, giáo trình, và bài giảng",
  "searchPlaceholder": "Tìm kiếm tài liệu...",
  "notFound": "Không tìm thấy tài liệu",
  "notFoundDesc": "Thử tìm kiếm với từ khóa khác hoặc quay lại sau.",
  "defaultDesc": "Sách giáo khoa cơ bản cho người mới bắt đầu."
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
console.log('I18n updated for Resources');
