const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const viPath = path.join(__dirname, '../messages/vi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

Object.assign(en.Practice, {
  "errorLoadingMistakes": "Error loading mistake book",
  "preparingReview": "Preparing review session...",
  "noMistakes": "No mistakes!",
  "noMistakesDesc": "Great job, you don't have any mistakes to review right now.",
  "goBack": "Go back",
  "greatJob": "Great job! 🎉",
  "mistakeReviewCompleted": "Mistake Review Completed",
  "mistakeReviewTitle": "Mistake Review",
  "unsupportedQuestion": "This question type is not supported for review",
  "skip": "Skip",
  "correct": "Correct!",
  "wrongAnswer": "Wrong! Correct answer:"
});

Object.assign(vi.Practice, {
  "errorLoadingMistakes": "Lỗi khi tải sổ lỗi sai",
  "preparingReview": "Đang chuẩn bị ôn tập...",
  "noMistakes": "Không có lỗi sai nào!",
  "noMistakesDesc": "Tuyệt vời, bạn không có câu nào cần ôn tập lúc này.",
  "goBack": "Quay lại",
  "greatJob": "Tuyệt vời! 🎉",
  "mistakeReviewCompleted": "Hoàn thành Ôn tập Lỗi sai",
  "mistakeReviewTitle": "Ôn tập lỗi sai",
  "unsupportedQuestion": "Loại câu hỏi này chưa được hỗ trợ ôn tập",
  "skip": "Bỏ qua",
  "correct": "Chính xác!",
  "wrongAnswer": "Sai rồi! Đáp án đúng:"
});

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
console.log('I18n updated');
