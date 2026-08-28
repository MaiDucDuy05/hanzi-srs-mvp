const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '../messages/en.json');
const viPath = path.join(__dirname, '../messages/vi.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const vi = JSON.parse(fs.readFileSync(viPath, 'utf8'));

en.Settings = {
  "profile": "Profile",
  "profileDesc": "Display name, personal info.",
  "learning": "Learning",
  "learningDesc": "Daily goals, review configuration.",
  "account": "Account",
  "accountDesc": "Change password, security.",
  "nameRequired": "Name cannot be empty.",
  "profileSaved": "Profile saved.",
  "saveFailed": "Failed to save. Please try again.",
  "goalInvalid": "Goal must be between 1 and 10000 XP.",
  "learningSaved": "Learning configuration saved.",
  "currPwdRequired": "Please enter current password.",
  "newPwdLength": "New password must be at least 8 characters.",
  "pwdNotMatch": "Password confirmation does not match.",
  "pwdChanged": "Password changed.",
  "errorOccurred": "An error occurred, please try again.",
  "settingsTitle": "Settings",
  "settingsSubtitle": "Customize your personal account.",
  "logout": "Logout",
  "profileTitle": "Personal Profile",
  "profileSubtitle": "Update display name and account info.",
  "avatar": "Avatar",
  "avatarDesc": "Generated from the first letter of your name.",
  "fullName": "Full Name",
  "email": "Email",
  "emailFixed": "Email cannot be changed.",
  "learningTitle": "Learning Configuration",
  "learningSubtitle": "Daily goals and notification preferences.",
  "dailyGoal": "Daily XP Goal",
  "xpPerDay": "XP / day",
  "goalHint": "Hint: Beginners should start with 20-50 XP. Increase to 80-100 XP later.",
  "securityTitle": "Account Security",
  "securitySubtitle": "Change your password to secure your account.",
  "currPwd": "Current Password",
  "forgotPwd": "Forgot password?",
  "enterCurrPwd": "Enter current password",
  "newPwd": "New Password",
  "atLeast8": "At least 8 characters",
  "pwdHint": "Must have at least 8 characters, including uppercase, lowercase, numbers, and special characters.",
  "confirmPwd": "Confirm New Password",
  "reEnterNewPwd": "Re-enter new password",
  "saving": "Saving...",
  "saveChanges": "Save Changes"
};

vi.Settings = {
  "profile": "Hồ sơ",
  "profileDesc": "Tên hiển thị, thông tin cá nhân.",
  "learning": "Học tập",
  "learningDesc": "Mục tiêu hàng ngày, cấu hình ôn tập.",
  "account": "Tài khoản",
  "accountDesc": "Đổi mật khẩu, bảo mật.",
  "nameRequired": "Tên không được để trống.",
  "profileSaved": "Hồ sơ đã được lưu.",
  "saveFailed": "Lưu thất bại. Vui lòng thử lại.",
  "goalInvalid": "Mục tiêu phải từ 1 đến 10000 XP.",
  "learningSaved": "Cấu hình học tập đã được lưu.",
  "currPwdRequired": "Vui lòng nhập mật khẩu hiện tại.",
  "newPwdLength": "Mật khẩu mới phải có ít nhất 8 ký tự.",
  "pwdNotMatch": "Mật khẩu xác nhận không khớp.",
  "pwdChanged": "Mật khẩu đã được thay đổi.",
  "errorOccurred": "Có lỗi xảy ra, vui lòng thử lại.",
  "settingsTitle": "Cài đặt",
  "settingsSubtitle": "Tùy chỉnh tài khoản cá nhân.",
  "logout": "Đăng xuất",
  "profileTitle": "Hồ sơ cá nhân",
  "profileSubtitle": "Cập nhật tên hiển thị và thông tin tài khoản.",
  "avatar": "Ảnh đại diện",
  "avatarDesc": "Được tạo từ chữ cái đầu của tên.",
  "fullName": "Họ tên",
  "email": "Email",
  "emailFixed": "Email không thể thay đổi.",
  "learningTitle": "Cấu hình Học tập",
  "learningSubtitle": "Mục tiêu hàng ngày và tùy chọn thông báo.",
  "dailyGoal": "Mục tiêu XP hàng ngày",
  "xpPerDay": "XP / ngày",
  "goalHint": "Gợi ý: Người mới nên bắt đầu 20–50 XP. Khi quen dần, tăng lên 80–100 XP.",
  "securityTitle": "Bảo mật tài khoản",
  "securitySubtitle": "Thay đổi mật khẩu để bảo vệ tài khoản.",
  "currPwd": "Mật khẩu hiện tại",
  "forgotPwd": "Quên mật khẩu?",
  "enterCurrPwd": "Nhập mật khẩu hiện tại",
  "newPwd": "Mật khẩu mới",
  "atLeast8": "Ít nhất 8 ký tự",
  "pwdHint": "Phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
  "confirmPwd": "Xác nhận mật khẩu mới",
  "reEnterNewPwd": "Nhập lại mật khẩu mới",
  "saving": "Đang lưu...",
  "saveChanges": "Lưu Thay đổi"
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(viPath, JSON.stringify(vi, null, 2));
console.log('I18n updated for Settings');
