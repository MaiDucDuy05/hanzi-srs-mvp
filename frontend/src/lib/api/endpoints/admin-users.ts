import { apiFetch, unwrap } from '../client';
import { User, Paginated, Single } from '../types';

function toQuery(params?: Record<string, string | number>) {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      searchParams.append(k, String(v));
    }
  }
  const q = searchParams.toString();
  return q ? `?${q}` : '';
}

export const adminUsersApi = {
  getAll: (params?: Record<string, string | number>) =>
    unwrap(apiFetch<Single<Paginated<User>>>(`/admin/users${toQuery(params)}`)),
  
  getAuditLogs: (params?: Record<string, string | number>) =>
    unwrap(apiFetch<Single<Paginated<any>>>(`/admin/users/audit-logs${toQuery(params)}`)),

  getById: (id: string) => 
    unwrap(apiFetch<Single<User>>(`/admin/users/${id}`)),

  changeRole: (id: string, role: string, vipDays?: number) =>
    unwrap(apiFetch<Single<User>>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, vipDays }),
    })),

  banUser: (id: string, reason: string) =>
    unwrap(apiFetch<Single<User>>(`/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })),

  unbanUser: (id: string) =>
    unwrap(apiFetch<Single<User>>(`/admin/users/${id}/unban`, {
      method: 'POST',
    })),
};
