import { apiFetch } from '../client';

export interface VipStats {
  totalVipUsers: number;
  pendingRequests: number;
  monthlyRevenue: number;
  expiringSoon: {
    user_id: string;
    name: string;
    expires_at: string;
  }[];
}

export interface VipRequest {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  plan: string;
  amount: number;
  transferNote?: string;
  status: string;
  note?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export const adminSubscriptionsApi = {
  getStats: () => {
    return apiFetch<{ data: VipStats }>('/admin/subscriptions/stats', {
      method: 'GET',
    });
  },

  getRequests: (params: Record<string, any> = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const queryString = searchParams.toString();
    const url = `/admin/subscriptions/requests${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<{ data: VipRequest[], meta: any }>(url, {
      method: 'GET',
    });
  },

  approveRequest: (id: string) => {
    return apiFetch(`/admin/subscriptions/requests/${id}/approve`, {
      method: 'POST',
    });
  },

  rejectRequest: (id: string, note: string) => {
    return apiFetch(`/admin/subscriptions/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ status: 'REJECTED', note }),
    });
  },

  extendSubscription: (userId: string, days: number, note?: string) => {
    return apiFetch(`/admin/subscriptions/${userId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ days, note }),
    });
  },

  cancelSubscription: (userId: string, note?: string) => {
    return apiFetch(`/admin/subscriptions/${userId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }
};
