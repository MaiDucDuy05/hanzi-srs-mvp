'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/lib/api/endpoints';
import type { User } from '@/lib/api/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, fullName: string) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Provider toàn cục. Auth qua HttpOnly cookie (access_token): frontend không lưu
 * token — mỗi lần mount lấy profile từ GET /auth/me theo cookie; login/register
 * do server set cookie, logout do server clear cookie.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Lấy profile hiện tại theo cookie; 401/không có cookie → chưa đăng nhập.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    authApi
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  // Token hết hạn giữa phiên (401 từ apiFetch): xoá user để guard chuyển về /login.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('hanzi:unauthorized', onUnauthorized);
    return () => window.removeEventListener('hanzi:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const res = await authApi.register({ email, password, fullName });
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    // HttpOnly cookie — client không tự xoá được, phải nhờ server clear.
    await authApi.logout().catch(() => undefined);
    setUser(null);
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refresh }),
    [user, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
