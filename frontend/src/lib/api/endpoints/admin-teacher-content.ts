import { apiFetch } from '../client';

export const adminTeacherContentApi = {
  getContents: (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiFetch(`/v1/admin/teacher-content?${query.toString()}`);
  },

  hideContent: (type: string, id: string, reason: string) =>
    apiFetch(`/v1/admin/teacher-content/${type}/${id}/hide`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  unhideContent: (type: string, id: string) =>
    apiFetch(`/v1/admin/teacher-content/${type}/${id}/unhide`, {
      method: 'POST',
    }),
    
  deleteContent: (type: string, id: string) =>
    apiFetch(`/v1/admin/teacher-content/${type}/${id}/delete`, {
      method: 'POST', // Using POST for soft delete to avoid payload issues
    }),
    
  getContentDetail: (type: string, id: string) =>
    apiFetch(`/v1/admin/teacher-content/${type}/${id}`),
};
