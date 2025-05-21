"use client"
import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TIKK_TOKEN } from '@/lib/constants';
import { config } from '@/config/env';
import axios from '@/lib/axios';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (credentials: { email: string; password: string; rememberMe?: boolean }) => Promise<void>;
  signInWithGoogle: () => void;
  signOut: () => void;
  setUser: (user: User | null) => void;
  verifyUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const verifyUser = async () => {
    try {
      const token = localStorage.getItem(TIKK_TOKEN);
      if (!token) {
        setUser(null);
        return;
      }

      const { data } = await axios.get('/api/auth/me');
      if (data.user) {
        setUser(data.user);
        return data.user;
      } else {
        localStorage.removeItem(TIKK_TOKEN);
        setUser(null);
        return null;
      }
    } catch (error) {
      localStorage.removeItem(TIKK_TOKEN);
      setUser(null);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const signIn = async (credentials: { email: string; password: string; rememberMe?: boolean }) => {
    const { data } = await axios.post('/api/auth/login', credentials);
    localStorage.setItem(TIKK_TOKEN, data.token);
    setUser(data.user);
  };

  const signInWithGoogle = useCallback(() => {
    // Redirect to the Google auth endpoint
    window.location.href = `${config.apiUrl}/api/auth/google`;
  }, [config.apiUrl]);

  const signOut = () => {
    localStorage.removeItem(TIKK_TOKEN);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut, setUser, verifyUser }}>
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