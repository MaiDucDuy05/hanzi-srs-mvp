import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, User } from '../types';

export const usersApi = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString();
    return apiFetch<Paginated<User>>(`/users${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => 
    unwrap(apiFetch<Single<User>>(`/users/${id}`)),

  create: (data: Partial<User>) => 
    unwrap(apiFetch<Single<User>>('/users', { method: 'POST', body: JSON.stringify(data) })),

  update: (id: string, data: Partial<User>) =>
    unwrap(apiFetch<Single<User>>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  delete: (id: string) =>
    apiFetch(`/users/${id}`, { method: 'DELETE' }),
};
