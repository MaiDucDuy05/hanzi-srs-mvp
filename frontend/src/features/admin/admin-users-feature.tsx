'use client';

import { useState } from 'react';
import { adminUsersApi } from '@/lib/api/endpoints';
import type { User } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { AdminUsersTable } from './components/admin-users-table';
import { AdminUsersFilter } from './components/admin-users-filter';
import { BanModal } from './components/modals/ban-modal';
import { RoleChangeModal } from './components/modals/role-change-modal';
import { UserDrawer } from './components/modals/user-drawer';
import { AddUserModal } from './components/modals/add-user-modal';
import { useApi } from '@/lib/hooks/use-api';

export function AdminUsersFeature() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [plan, setPlan] = useState('');

  // Modal states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<'NONE' | 'BAN' | 'ROLE' | 'DRAWER' | 'ADD_USER'>('NONE');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const { data, loading, error, refetch } = useApi(
    async () => {
      const response = await adminUsersApi.getAll({
        page,
        limit,
        ...(search ? { search } : {}),
        ...(role && role !== 'All Roles' ? { role: role.toUpperCase() } : {}),
        ...(status && status !== 'All Statuses' ? { status: status.toUpperCase() } : {}),
        ...(plan && plan !== 'All Plans' ? { plan: plan.toUpperCase() } : {}),
      });
      return response;
    },
    [page, limit, search, role, status, plan]
  );

  const handleBanConfirm = async (reason: string) => {
    if (!selectedUser) return;
    if (selectedUser.status === 'BANNED') {
      await adminUsersApi.unbanUser(selectedUser.id);
    } else {
      await adminUsersApi.banUser(selectedUser.id, reason);
    }
    await refetch();
  };

  const handleRoleConfirm = async (newRole: string, vipDays?: number) => {
    if (!selectedUser) return;
    await adminUsersApi.changeRole(selectedUser.id, newRole, vipDays);
    await refetch();
  };

  const handleAddUserConfirm = async (data: any) => {
    setIsAddingUser(true);
    try {
      await adminUsersApi.createUser(data);
      await refetch();
      closeModal();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tạo tài khoản');
    } finally {
      setIsAddingUser(false);
    }
  };

  const openModal = (user: User | null, type: 'BAN' | 'ROLE' | 'DRAWER' | 'ADD_USER') => {
    setSelectedUser(user);
    setModalType(type);
  };

  const closeModal = () => {
    setModalType('NONE');
    setTimeout(() => setSelectedUser(null), 300); // delay to clear data after transition
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      <AdminUsersFilter 
        total={data?.meta?.total || 0}
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
        plan={plan}
        onPlanChange={setPlan}
        onAddUser={() => openModal(null, 'ADD_USER')}
      />
      
      {loading && !data && <PageLoading />}
      {error && <ErrorState message="Failed to load users" onRetry={refetch} />}

      {!loading && !error && (
        <AdminUsersTable 
          users={data?.data || []}
          total={data?.meta?.total || 0}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onBan={(user) => openModal(user, 'BAN')}
          onChangeRole={(user) => openModal(user, 'ROLE')}
          onViewDetails={(user) => openModal(user, 'DRAWER')}
        />
      )}

      {modalType === 'BAN' && selectedUser && (
        <BanModal user={selectedUser} onClose={closeModal} onConfirm={handleBanConfirm} />
      )}
      
      {modalType === 'ROLE' && selectedUser && (
        <RoleChangeModal user={selectedUser} onClose={closeModal} onConfirm={handleRoleConfirm} />
      )}

      <UserDrawer 
        user={selectedUser as User} 
        isOpen={modalType === 'DRAWER'} 
        onClose={closeModal} 
      />

      <AddUserModal
        isOpen={modalType === 'ADD_USER'}
        onClose={closeModal}
        onSubmit={handleAddUserConfirm}
        loading={isAddingUser}
      />
    </div>
  );
}
