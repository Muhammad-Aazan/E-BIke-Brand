import { api } from './client';
import { endpoints } from './endpoints';
import type { User } from './types';

export const register = async (body: { name: string; email: string; password: string; phone?: string }): Promise<User> => {
  const data: any = await api(endpoints.auth.register, { method: 'POST', body });
  if (data?.accessToken && typeof window !== 'undefined') {
    localStorage.setItem('user_token', data.accessToken);
  }
  return data?.user || data;
};

export const login = async (body: { email: string; password: string }): Promise<User> => {
  const data: any = await api(endpoints.auth.login, { method: 'POST', body });
  if (data?.accessToken && typeof window !== 'undefined') {
    localStorage.setItem('user_token', data.accessToken);
  }
  return data?.user || data;
};

export const logout = async () => {
  try {
    await api<void>(endpoints.auth.logout, { method: 'POST' });
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_token');
    }
  }
};

export const getMe = async (): Promise<User | null> => {
  try {
    const data = await api<{ user: User } | User>(endpoints.auth.me);
    return (data as any)?.user || data;
  } catch {
    return null;
  }
};

export const forgotPassword = (email: string) =>
  api<{ message: string }>('auth/forgot-password', { method: 'POST', body: { email } });

export const resetPassword = (token: string, password: string) =>
  api<{ message: string }>('auth/reset-password', { method: 'POST', body: { token, password } });
