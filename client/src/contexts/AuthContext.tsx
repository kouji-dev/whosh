"use client"
import React, { createContext, useCallback, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TIKK_TOKEN } from '@/lib/constants';
import { config } from '@/config/env';
import axios from '@/lib/axios';
import { openPopupFlow } from '@/utils/popup';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isLoading: boolean;
  isLogged: boolean;
  error: any;
  signIn: (user: User, token: string) => void;
  signInWithPassword: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  signInWithGoogle: (clientId?: string) => void;
  signOut: () => void;
  setUser: (user: User | null) => void;
  refetchUser: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let setUserOn401: ((user: User | null) => void) | null = null;

export function setSetUserOn401(fn: (user: User | null) => void) {
  setUserOn401 = fn;
}

async function fetchUserFn(): Promise<User | null> {
  const token = localStorage.getItem(TIKK_TOKEN);
  if (!token) return null;
  const { data } = await axios.get('/api/auth/me');
  return data.user || null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading: loading, error, refetch } = useQuery({
    queryKey: ['user'],
    queryFn: fetchUserFn,
    staleTime: 1000 * 60 * 5,
    retry: false
  });

  const setUser = (user: User | null) => {
    queryClient.setQueryData(['user'], user);
  };

  const signInWithPassword = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const { data } = await axios.post('/api/auth/login', credentials);
    const user = data.user;
    const token = data.token;
    signIn(user, token);
  };

  const signIn = (user: User, token: string) => {
    localStorage.setItem(TIKK_TOKEN, token);
    setUser(user);
  };

  const signInWithGoogle = useCallback(async (clientId?: string) => {
    try {
      const url = clientId
        ? `${config.apiUrl}/api/auth/google?clientId=${encodeURIComponent(clientId)}`
        : `${config.apiUrl}/api/auth/google`;
      await openPopupFlow(url);
    } catch (err) {
      console.error('Google sign-in popup failed', err);
    }
  }, [config.apiUrl]);

  const signOut = () => {
    localStorage.removeItem(TIKK_TOKEN);
    setUser(null);
    router.push('/login');
  };

  const isLogged = !!user;

  useEffect(() => {
    setSetUserOn401(setUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user: user ?? null, loading, isLoading: loading, isLogged, error, signIn, signInWithPassword, signInWithGoogle, signOut, setUser, refetchUser: refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { setUserOn401 }; 