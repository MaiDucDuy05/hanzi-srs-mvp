import { apiFetch, unwrap } from '../client';
import type { 
  Reward, 
  CreateRewardDto, 
  UpdateRewardDto 
} from '../types';

export const adminRewardsApi = {
  /** Get all rewards (Admin) */
  getAll: async (): Promise<Reward[]> => {
    // Controller returns ok(await this.svc.findAll(), ...) -> { data: Reward[], message: ... }
    const res = await apiFetch<{ data: Reward[] }>('/admin/rewards');
    return res.data; 
  },

  /** Create a new reward */
  create: async (data: CreateRewardDto): Promise<Reward> => {
    return unwrap(apiFetch<{ data: Reward }>('/admin/rewards', {
      method: 'POST',
      body: JSON.stringify(data)
    }));
  },

  /** Update an existing reward */
  update: async (id: string, data: UpdateRewardDto): Promise<Reward> => {
    return unwrap(apiFetch<{ data: Reward }>(`/admin/rewards/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }));
  },

  /** Toggle reward active status */
  toggleActive: async (id: string): Promise<Reward> => {
    return unwrap(apiFetch<{ data: Reward }>(`/admin/rewards/${id}/toggle`, {
      method: 'PATCH'
    }));
  },

  /** Delete a reward */
  remove: async (id: string): Promise<void> => {
    await apiFetch(`/admin/rewards/${id}`, { method: 'DELETE' });
  }
};
