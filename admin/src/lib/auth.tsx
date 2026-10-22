'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { adminApi } from './api';

export interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: 'admin' | 'support' | 'customer';
  createdAt?: string;
  lastLoginAt?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAdmin = useCallback(async () => {
    try {
      // If token not yet saved in localStorage, acquire from cookie via refresh
      if (typeof window !== 'undefined' && !localStorage.getItem('admin_token')) {
        try {
          const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
          const res = await fetch(`${BASE.replace(/\/$/, '')}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          });
          if (res.ok) {
            const json = await res.json();
            const token = json?.data?.accessToken;
            if (token) {
              localStorage.setItem('admin_token', token);
            }
          }
        } catch {
          // ignore
        }
      }

      const data = await adminApi<{ user: AdminUser }>('auth/me');
      const user = data?.user || (data as any);
      if (user && user.role === 'admin') {
        setAdmin(user);
      } else {
        setAdmin(null);
      }
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAdmin();
  }, [refreshAdmin]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await adminApi<{ user: AdminUser; accessToken?: string }>('auth/login', {
      method: 'POST',
      body: { email, password },
    });
    const user = data?.user || (data as any);
    if (user.role !== 'admin') {
      throw new Error('Access denied. Admin privileges required.');
    }
    const token = data?.accessToken || (data as any)?.accessToken;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi('auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, loading, login, logout, refreshAdmin }),
    [admin, loading, login, logout, refreshAdmin]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
