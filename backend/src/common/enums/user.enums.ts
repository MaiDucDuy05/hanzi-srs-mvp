/**
 * Vai trò người dùng. VIP là trạng thái gói (subscription), không phải role.
 */
export enum Role {
  FREE = 'FREE',
  TEACHER = 'TEACHER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
}
