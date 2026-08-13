'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api/endpoints';
import type { User } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { AdminUsersFilter } from './components/admin-users-filter';
import { AdminUsersTable } from './components/admin-users-table';

export function AdminUsersFeature() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getAll({
        page,
        limit,
        ...(search ? { search } : {}),
        ...(role && role !== 'All Roles' ? { role: role.toUpperCase() } : {}),
        ...(status && status !== 'All Statuses' ? { status: status.toUpperCase() } : {}),
      });
      setUsers(response.data || []);
      setTotal(response.meta?.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset page to 1 if search, role, or status changes
    setPage(1);
  }, [search, role, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search, role, status]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to lock/delete this user?')) return;
    try {
      await usersApi.delete(id);
      void load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error deleting user');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <AdminUsersFilter 
        total={total}
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={setRole}
        status={status}
        onStatusChange={setStatus}
      />

      {loading && <PageLoading label="Đang tải..." />}
      {error && <ErrorState message={error} onRetry={() => void load()} />}

      {!loading && !error && (
        <AdminUsersTable 
          users={users}
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
