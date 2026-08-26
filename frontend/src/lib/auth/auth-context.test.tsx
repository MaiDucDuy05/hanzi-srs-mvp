import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('@/lib/api/endpoints', () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    requestRegisterOtp: vi.fn(),
    verifyRegisterOtp: vi.fn(),
    resetPassword: vi.fn(),
    updateMe: vi.fn(),
    changePassword: vi.fn(),
    requestForgotPasswordOtp: vi.fn(),
    verifyForgotPasswordOtp: vi.fn(),
  },
}));

import { authApi } from '@/lib/api/endpoints';
import { AuthProvider, useAuth } from './auth-context';

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('throw error nếu useAuth bên ngoài provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider',
    );
  });

  it('bắt đầu loading, sau đó set user khi me() thành công', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    (authApi.me as any).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.c', fullName: 'A', role: 'FREE', status: 'ACTIVE' },
      exp: future,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user?.id).toBe('u1');
  });

  it('set user=null khi me() thất bại', async () => {
    (authApi.me as any).mockRejectedValue(new Error('401'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('login() gọi authApi.login + setUser', async () => {
    (authApi.me as any).mockRejectedValue(new Error('401'));
    const future = Math.floor(Date.now() / 1000) + 3600;
    (authApi.login as any).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.c', fullName: 'A', role: 'FREE', status: 'ACTIVE' },
      exp: future,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      const user = await result.current.login('a@b.c', 'pw');
      expect(user.id).toBe('u1');
    });

    expect(result.current.user?.id).toBe('u1');
    expect(authApi.login).toHaveBeenCalledWith({ email: 'a@b.c', password: 'pw' });
  });

  it('logout() clearAuth + logout API + setUser=null', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    (authApi.me as any).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.c', fullName: 'A', role: 'FREE', status: 'ACTIVE' },
      exp: future,
    });
    (authApi.logout as any).mockResolvedValue({});

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe('u1'));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(authApi.logout).toHaveBeenCalled();
  });

  it('dispatch event hanzi:unauthorized khi token hết hạn', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    (authApi.me as any).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.c', fullName: 'A', role: 'FREE', status: 'ACTIVE' },
      exp: future,
    });
    (authApi.logout as any).mockResolvedValue({});

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe('u1'));

    const evt = new Event('hanzi:unauthorized');
    await act(async () => {
      window.dispatchEvent(evt);
    });

    await waitFor(() => expect(result.current.user).toBeNull());
  });

  it('refresh() bump tick', async () => {
    (authApi.me as any).mockResolvedValue({
      user: { id: 'u1', email: 'a@b.c', fullName: 'A', role: 'FREE', status: 'ACTIVE' },
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user?.id).toBe('u1'));

    const callCount = (authApi.me as any).mock.calls.length;

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => expect((authApi.me as any).mock.calls.length).toBeGreaterThan(callCount));
  });

  it('requestRegisterOtp gọi API và không setUser', async () => {
    (authApi.me as any).mockRejectedValue(new Error('401'));
    (authApi.requestRegisterOtp as any).mockResolvedValue({});

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.requestRegisterOtp('a@b.c', 'pw', 'A');
    });

    expect(authApi.requestRegisterOtp).toHaveBeenCalledWith({
      email: 'a@b.c',
      password: 'pw',
      fullName: 'A',
    });
  });

  it('verifyRegisterOtp setUser', async () => {
    (authApi.me as any).mockRejectedValue(new Error('401'));
    const future = Math.floor(Date.now() / 1000) + 3600;
    (authApi.verifyRegisterOtp as any).mockResolvedValue({
      user: { id: 'u2', email: 'a@b.c', fullName: 'A', role: 'FREE', status: 'ACTIVE' },
      exp: future,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.verifyRegisterOtp('a@b.c', '123456');
    });

    expect(result.current.user?.id).toBe('u2');
  });

  it('resetPassword setUser', async () => {
    (authApi.me as any).mockRejectedValue(new Error('401'));
    const future = Math.floor(Date.now() / 1000) + 3600;
    (authApi.resetPassword as any).mockResolvedValue({
      user: { id: 'u3', email: 'a@b.c', fullName: 'A', role: 'FREE', status: 'ACTIVE' },
      exp: future,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.resetPassword('a@b.c', '123456', 'newPw');
    });

    expect(result.current.user?.id).toBe('u3');
  });
});
