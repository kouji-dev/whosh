'use client'
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function StatusPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const error = searchParams.get('error');

  useEffect(() => {
    const timer = setTimeout(() => {
      window.close();
    }, error ? 3000 : 1500);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      {status === 'success' && !error ? (
        <>
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Success!</h2>
          <p className="text-gray-600">You can close this window.</p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
          <p className="text-gray-600 break-all max-w-xs text-center">{decodeURIComponent(error || 'Unknown error')}</p>
        </>
      )}
    </div>
  );
} 