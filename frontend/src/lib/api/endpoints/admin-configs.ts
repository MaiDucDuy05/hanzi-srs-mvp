import { apiFetch, unwrap } from '../client';

export interface SystemConfig {
  key: string;
  value: string;
  valueType: 'INT' | 'STRING' | 'BOOLEAN' | 'JSON';
  group: string;
  description: string;
  updatedBy?: string;
  updatedByUser?: { fullName: string; email: string };
  updatedAt?: string;
}

export type GroupedConfigs = Record<string, SystemConfig[]>;

export const adminConfigsApi = {
  /**
   * Get all system configurations grouped by their logical groups
   */
  getConfigs: async (): Promise<GroupedConfigs> => {
    return unwrap(apiFetch('/admin/configs'));
  },

  /**
   * Update multiple configurations at once
   */
  updateConfigsBulk: async (updates: { key: string; value: string }[]): Promise<{ message: string }> => {
    return apiFetch('/admin/configs/bulk', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
};
