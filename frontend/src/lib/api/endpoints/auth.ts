import { apiFetch, unwrap } from '../client';
import type { AuthResponse, Single, User } from '../types';

export const authApi = {
  requestRegisterOtp: (data: { email: string; password: string; fullName: string }) =>
    apiFetch('/auth/register/request-otp', { method: 'POST', body: JSON.stringify(data), auth: false }),

  verifyRegisterOtp: (data: { email: string; otp: string }) =>
    unwrap(apiFetch<Single<AuthResponse>>('/auth/register/verify-otp', { method: 'POST', body: JSON.stringify(data), auth: false })),

  login: (data: { email: string; password: string }) =>
    unwrap(apiFetch<Single<AuthResponse>>('/auth/login', { method: 'POST', body: JSON.stringify(data), auth: false })),

  requestForgotPasswordOtp: (data: { email: string }) =>
    apiFetch('/auth/forgot-password/request-otp', { method: 'POST', body: JSON.stringify(data), auth: false }),

  verifyForgotPasswordOtp: (data: { email: string; otp: string }) =>
    apiFetch('/auth/forgot-password/verify-otp', { method: 'POST', body: JSON.stringify(data), auth: false }),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    unwrap(apiFetch<Single<AuthResponse>>('/auth/forgot-password/reset', { method: 'POST', body: JSON.stringify(data), auth: false })),

  // Profile hiện tại theo HttpOnly cookie — thay cho user lưu localStorage.
  me: () => unwrap(apiFetch<Single<AuthResponse>>('/auth/me')),

  // Student tự cập nhật profile của mình. (Backend updateMe still returns just user, but I'll let it be User)
  updateMe: (data: { fullName?: string; dailyGoal?: number }) =>
    unwrap(apiFetch<Single<User>>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) })),

  // Xoá cookie phía server (client không tự xoá được HttpOnly).
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};
