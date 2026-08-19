import { apiFetch, unwrap } from '../client';
import type { AuthResponse, Single, User } from '../types';

export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    unwrap(apiFetch<Single<AuthResponse>>('/auth/register', { method: 'POST', body: JSON.stringify(data), auth: false })),

  login: (data: { email: string; password: string }) =>
    unwrap(apiFetch<Single<AuthResponse>>('/auth/login', { method: 'POST', body: JSON.stringify(data), auth: false })),

  // Profile hiện tại theo HttpOnly cookie — thay cho user lưu localStorage.
  me: () => unwrap(apiFetch<Single<User>>('/auth/me')),

  // Student tự cập nhật profile của mình.
  updateMe: (data: { fullName?: string; dailyGoal?: number }) =>
    unwrap(apiFetch<Single<User>>('/auth/me', { method: 'PATCH', body: JSON.stringify(data) })),

  // Xoá cookie phía server (client không tự xoá được HttpOnly).
  logout: () => apiFetch('/auth/logout', { method: 'POST' }),
};
