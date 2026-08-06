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
import {
  clearAuth,
  getStoredUser,
  getToken,
  setAuth,
} from '@/lib/api/client';
import type { User } from '@/lib/api/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, fullName: string) => Promise<User>;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Provider toàn cục: đọc token/user từ localStorage khi mount. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setUser(getStoredUser<User>());
    setToken(getToken());
    setLoading(false);
  }, [tick]);

  // Token hết hạn (401 từ apiFetch): đăng xuất tự động để guard chuyển về /login.
  useEffect(() => {
    const onUnauthorized = () => {
      clearAuth();
      setUser(null);
      setToken(null);
    };
    window.addEventListener('hanzi:unauthorized', onUnauthorized);
    return () => window.removeEventListener('hanzi:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setAuth(res.accessToken, res.user);
    setToken(res.accessToken);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string) => {
      const res = await authApi.register({ email, password, fullName });
      setAuth(res.accessToken, res.user);
      setToken(res.accessToken);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refresh }),
    [user, token, loading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
