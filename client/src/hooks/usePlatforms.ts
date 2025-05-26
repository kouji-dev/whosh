import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

interface Platform {
  name: string;
  code: string;
  icon: string;
  isConnected: boolean;
}

interface ConnectedAccount {
  id: string;
  platformId: string;
  platformUsername: string;
  platform: {
    name: string;
    icon: string;
  };
}

export function usePlatforms() {
  // Get available platforms
  const { data: platforms, isLoading: isLoadingPlatforms } = useQuery<Platform[]>({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data } = await apiClient.get('api/platforms');
      return data;
    },
  });

  return {
    platforms,
    isLoadingPlatforms
  };
} 