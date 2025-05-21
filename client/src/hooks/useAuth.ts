import { useQuery } from '@tanstack/react-query';
import { useAuth as useAuthContext } from '@/contexts/AuthContext';

export function useAuth() {
  const auth = useAuthContext();
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: auth.verifyUser,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: false,
  });

  return {
    ...auth,
    user: user || auth.user,
    isLoading: isLoading || auth.loading,
    error,
  };
} 