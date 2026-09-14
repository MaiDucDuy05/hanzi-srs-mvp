import { AdminRewardsFeature } from '@/features/admin/admin-rewards-feature';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Quản lý phần thưởng | Cute Panda',
};

export default function AdminRewardsPage() {
  return <AdminRewardsFeature />;
}
