'use client';

import { Suspense } from 'react';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TIKK_TOKEN } from '@/lib/constants';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    console.log('Callback Debug:', {
      token,
      error
    });

    if (error) {
      router.replace(`/login?error=${error}`);
      return;
    }

    if (token) {
      // Store token and verify user
      localStorage.setItem(TIKK_TOKEN, token);
      verifyUser().then(() => {
        router.replace('/dashboard');
      });
    } else {
      router.replace('/login?error=oauth_failed');
    }
  }, [router, searchParams, verifyUser]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-lg text-muted-foreground">Signing you in...</div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 