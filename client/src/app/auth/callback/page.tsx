'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MAGNET_TOKEN } from '@/lib/constants';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Store token in localStorage
      localStorage.setItem(MAGNET_TOKEN, token);
      // Optionally: You can also trigger a user fetch here if you want
      router.replace('/dashboard'); // Redirect to dashboard or home
    } else {
      // If no token, redirect to login with error
      router.replace('/login?error=oauth_failed');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-lg text-brown">Signing you in...</div>
    </div>
  );
} 