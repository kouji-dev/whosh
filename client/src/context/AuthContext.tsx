"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import { MAGNET_TOKEN } from '@/lib/constants';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for token in localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem(MAGNET_TOKEN) : null;
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    // Fetch current user if token exists
    api.get('/api/auth/me')
      .then(res => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const res = await api.post('/api/auth/login', { email, password });
    setUser(res.user || res.data?.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MAGNET_TOKEN, res.token);
    }
    setLoading(false);
    router.push('/dashboard');
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    const res = await api.post('/api/auth/register', { name, email, password });
    setUser(res.user || res.data?.user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MAGNET_TOKEN, res.token);
    }
    setLoading(false);
    router.push('/dashboard');
  };

  const logout = () => {
    api.post('/api/auth/logout');
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(MAGNET_TOKEN);
    }
    router.push('/login');
  };

  const loginWithGoogle = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}; 