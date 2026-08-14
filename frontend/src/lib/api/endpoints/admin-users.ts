import { apiFetch } from '../client';
import { User, Paginated, Single } from '../types';
import { toQuery } from './utils';

export const adminUsersApi = {
  getAll: (params?: Record<string, string | number>) =>
    apiFetch<Paginated<User>>(`/admin/users${params ? toQuery(params) : ''}`),
  
  getAuditLogs: (params?: Record<string, string | number>) =>
    apiFetch<Paginated<any>>(`/admin/users/audit-logs${params ? toQuery(params) : ''}`),

  createUser: (data: { email: string; fullName: string; password?: string; role: string; vipDays?: number }) =>
    apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUser: (id: string) => apiFetch(`/admin/users/${id}`),

  getById: (id: string) => 
    apiFetch<Single<User>>(`/admin/users/${id}`),

  changeRole: (id: string, role: string, vipDays?: number) =>
    apiFetch<Single<User>>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, vipDays }),
    }),

  banUser: (id: string, reason: string) =>
    apiFetch<Single<User>>(`/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unbanUser: (id: string) =>
    apiFetch<Single<User>>(`/admin/users/${id}/unban`, {
      method: 'POST',
    }),
};
