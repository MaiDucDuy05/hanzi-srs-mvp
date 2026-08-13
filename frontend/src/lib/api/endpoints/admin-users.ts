import { apiFetch } from '../client';
import { User, PaginatedResponse, ApiResponse } from '../types';

export const adminUsersApi = {
  getAll: (params?: Record<string, string | number>) =>
    apiFetch<PaginatedResponse<User>>('/admin/users', { params }),
  
  getAuditLogs: (params?: Record<string, string | number>) =>
    apiFetch<PaginatedResponse<any>>('/admin/users/audit-logs', { params }),

  getById: (id: string) => 
    apiFetch<ApiResponse<User>>(`/admin/users/${id}`),

  changeRole: (id: string, role: string, vipDays?: number) =>
    apiFetch<ApiResponse<User>>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, vipDays }),
    }),

  banUser: (id: string, reason: string) =>
    apiFetch<ApiResponse<User>>(`/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unbanUser: (id: string) =>
    apiFetch<ApiResponse<User>>(`/admin/users/${id}/unban`, {
      method: 'POST',
    }),
};
