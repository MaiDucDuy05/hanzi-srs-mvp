const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const viPath = path.join(__dirname, '../messages/vi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

en.Practice = {
  "title": "Practice",
  "subtitle": "Select vocabulary source and practice mode to start.",
  "step1": "1. Select vocabulary source",
  "step2": "2. Select mode",
  "start": "Start Practice",
  "pleaseSelect": "Please select source and mode.",
  "loading": "Loading practice...",
  "gamesWarning": "This mode is in the",
  "gamesLink": "Games section",
  "lesson": "Lesson",
  "topic": "Topic",
  "level": "Level",
  "matchTitle": "Word Matching",
  "matchDesc": "Match characters with meaning & pinyin",
  "flashcardTitle": "Flashcard",
  "flashcardDesc": "Flip cards for quick review",
  "fillTitle": "Fill in the Blank",
  "fillDesc": "Type characters by pinyin & meaning",
  "orderTitle": "Sentence Ordering",
  "orderDesc": "Arrange characters into correct words"
};

vi.Practice = {
  "title": "Luyện tập",
  "subtitle": "Chọn nguồn từ vựng và chế độ luyện tập để bắt đầu.",
  "step1": "1. Chọn nguồn từ vựng",
  "step2": "2. Chọn chế độ",
  "start": "Bắt đầu luyện tập",
  "pleaseSelect": "Vui lòng chọn nguồn và chế độ.",
  "loading": "Đang tải luyện tập...",
  "gamesWarning": "Chế độ này nằm trong mục",
  "gamesLink": "Trò chơi",
  "lesson": "Bài học",
  "topic": "Chủ đề",
  "level": "Cấp độ",
  "matchTitle": "Nối từ",
  "matchDesc": "Nối chữ Hán với nghĩa & pinyin",
  "flashcardTitle": "Flashcard",
  "flashcardDesc": "Lật thẻ ôn từ vựng nhanh",
  "fillTitle": "Điền chỗ trống",
  "fillDesc": "Gõ chữ Hán theo pinyin & nghĩa",
  "orderTitle": "Sắp xếp câu",
  "orderDesc": "Ghép các chữ thành từ đúng"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
console.log('I18n updated');
