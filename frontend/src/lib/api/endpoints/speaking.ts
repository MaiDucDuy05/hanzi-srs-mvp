import { apiFetch, unwrap } from '../client';
import type { Paginated, Single, SpeakingAttempt } from '../types';
import { toQuery } from './utils';

export const speakingApi = {
  /** Tải file audio lên, trả audioKey. */
  uploadAudio: async (file: Blob): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/v1/audio/upload', { method: 'POST', credentials: 'include', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error((body as { message?: string }).message ?? 'Upload thất bại');
    }
    const json = await res.json() as { data: { audioKey: string } };
    return json.data.audioKey;
  },

  list: (params: { userId?: string; status?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paginated<SpeakingAttempt>>(`/speaking-attempts${toQuery({ ...params, limit: params.limit ?? 100 })}`).then((r) => r.data),

  create: (data: { audioKey: string }) =>
    unwrap(apiFetch<Single<SpeakingAttempt>>('/speaking-attempts', { method: 'POST', body: JSON.stringify(data) })),

  grade: (id: string, data: { score?: number | null; feedback?: string | null }) =>
    unwrap(apiFetch<Single<SpeakingAttempt>>(`/speaking-attempts/${id}`, { method: 'PATCH', body: JSON.stringify(data) })),
};
