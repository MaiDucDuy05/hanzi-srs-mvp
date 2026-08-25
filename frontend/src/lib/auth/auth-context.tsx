'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { authApi } from '@/lib/api/endpoints';
import type { User, AuthResponse } from '@/lib/api/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  requestRegisterOtp: (email: string, password: string, fullName: string) => Promise<void>;
  verifyRegisterOtp: (email: string, otp: string) => Promise<User>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<User>;
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAuthTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const setupAuthTimer = useCallback((exp: number) => {
    clearAuthTimer();
    const timeout = (exp * 1000) - Date.now();
    if (timeout <= 0) {
      window.dispatchEvent(new Event('hanzi:unauthorized'));
    } else {
      timerRef.current = setTimeout(() => {
        window.dispatchEvent(new Event('hanzi:unauthorized'));
      }, timeout);
    }
  }, [clearAuthTimer]);

  const handleAuthSuccess = useCallback((res: AuthResponse) => {
    setUser(res.user);
    if (res.exp) {
      setupAuthTimer(res.exp);
    }
  }, [setupAuthTimer]);

  // Lấy profile hiện tại theo cookie; 401/không có cookie → chưa đăng nhập.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    authApi
      .me()
      .then((res) => {
        if (!cancelled) handleAuthSuccess(res);
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
  }, [tick, handleAuthSuccess]);

  // Token hết hạn giữa phiên (401 từ apiFetch hoặc từ timeout): xoá user để guard chuyển về /login.
  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      clearAuthTimer();
      // Bắn api logout để clear cookie phía server luôn cho an toàn.
      authApi.logout().catch(() => {});
    };
    window.addEventListener('hanzi:unauthorized', onUnauthorized);
    return () => window.removeEventListener('hanzi:unauthorized', onUnauthorized);
  }, [clearAuthTimer]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    handleAuthSuccess(res);
    return res.user;
  }, [handleAuthSuccess]);

  const requestRegisterOtp = useCallback(
    async (email: string, password: string, fullName: string) => {
      await authApi.requestRegisterOtp({ email, password, fullName });
    },
    [],
  );

  const verifyRegisterOtp = useCallback(
    async (email: string, otp: string) => {
      const res = await authApi.verifyRegisterOtp({ email, otp });
      handleAuthSuccess(res);
      return res.user;
    },
    [handleAuthSuccess],
  );

  const resetPassword = useCallback(
    async (email: string, otp: string, newPassword: string) => {
      const res = await authApi.resetPassword({ email, otp, newPassword });
      handleAuthSuccess(res);
      return res.user;
    },
    [handleAuthSuccess],
  );

  const logout = useCallback(async () => {
    clearAuthTimer();
    // HttpOnly cookie — client không tự xoá được, phải nhờ server clear.
    await authApi.logout().catch(() => undefined);
    setUser(null);
  }, [clearAuthTimer]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const value = useMemo(
    () => ({ user, loading, login, requestRegisterOtp, verifyRegisterOtp, resetPassword, logout, refresh }),
    [user, loading, login, requestRegisterOtp, verifyRegisterOtp, resetPassword, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
