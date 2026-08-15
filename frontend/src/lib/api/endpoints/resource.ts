import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, Resource, MistakeBookEntry, VipUpgradeRequest, AiJob, User } from '../types';
import { toQuery } from './utils';

export const resourceApi = {
  list: (params: { tier?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<Resource>>(`/resources${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  get: (id: string) => unwrap(apiFetch<Single<Resource>>(`/resources/${id}`)),

  create: (data: Partial<Resource>) =>
    unwrap(apiFetch<Single<Resource>>('/resources', { method: 'POST', body: JSON.stringify(data) })),

  createContact: (data: { name: string; email: string; phone?: string; message: string }) =>
    unwrap(apiFetch<Single<{ id: string }>>('/contact-requests', { method: 'POST', body: JSON.stringify(data), auth: false })),

  listMistakes: (params: { userId?: string; since?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<MistakeBookEntry>>(`/mistake-book${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createMistake: (data: Partial<MistakeBookEntry>) =>
    unwrap(apiFetch<Single<MistakeBookEntry>>('/mistake-book', { method: 'POST', body: JSON.stringify(data) })),

  deleteMistake: (id: string) => apiFetch(`/mistake-book/${id}`, { method: 'DELETE' }),

  startMistakeReview: (filter?: string) =>
    unwrap(apiFetch<Single<MistakeBookEntry[]>>('/mistake-book/review/start', { method: 'POST', body: JSON.stringify({ filter }) })),

  submitMistakeReview: (id: string, isCorrect: boolean) =>
    unwrap(apiFetch<Single<any>>(`/mistake-book/review/${id}/submit`, { method: 'POST', body: JSON.stringify({ isCorrect }) })),

  listVipRequests: (params: { userId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<VipUpgradeRequest>>(`/vip-upgrade-requests${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createVipRequest: (data: { userId: string; note?: string }) =>
    unwrap(apiFetch<Single<VipUpgradeRequest>>('/vip-upgrade-requests', { method: 'POST', body: JSON.stringify(data) })),

  reviewVipRequest: (id: string, data: { status: 'APPROVED' | 'REJECTED'; note?: string }) =>
    unwrap(apiFetch<Single<VipUpgradeRequest>>(`/vip-upgrade-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),

  listAiJobs: (params: { userId?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<AiJob>>(`/ai-jobs${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  createAiJob: (data: { userId: string; jobType: string; inputData: Record<string, unknown> }) =>
    unwrap(apiFetch<Single<AiJob>>('/ai-jobs', { method: 'POST', body: JSON.stringify(data) })),

  // users (admin)
  listUsers: (params: { page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<User>>(`/users${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  // Admin-only — returns 403 for non-admin users.
  updateUser: (id: string, data: Partial<User>) =>
    unwrap(apiFetch<Single<User>>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),
};
