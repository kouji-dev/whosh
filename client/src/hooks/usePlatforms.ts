import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

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
  const queryClient = useQueryClient();

  // Get available platforms
  const { data: platforms, isLoading: isLoadingPlatforms } = useQuery<Platform[]>({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data } = await apiClient.get('/platforms');
      return data;
    },
  });

  // Get connected accounts
  const { data: connectedAccounts, isLoading: isLoadingAccounts } = useQuery<ConnectedAccount[]>({
    queryKey: ['connectedAccounts'],
    queryFn: async () => {
      const { data } = await apiClient.get('/platforms/accounts');
      return data;
    },
  });

  // Get OAuth URL for platform connection
  const { mutateAsync: getAuthUrl } = useMutation({
    mutationFn: async (platform: string) => {
      const { data } = await apiClient.get(`/platforms/${platform}/auth`);
      return data.authUrl;
    },
  });

  // Disconnect platform account
  const { mutateAsync: disconnectAccount } = useMutation({
    mutationFn: async (channelId: string) => {
      await apiClient.delete(`/platforms/accounts/${channelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connectedAccounts'] });
    },
  });

  return {
    platforms,
    connectedAccounts,
    isLoadingPlatforms,
    isLoadingAccounts,
    getAuthUrl,
    disconnectAccount,
  };
} 