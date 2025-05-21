import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

interface DashboardStats {
  totalPosts: number;
  teamMembers: number;
  scheduledPosts: number;
  engagementRate: number;
}

interface Activity {
  id: number;
  type: 'post' | 'team' | 'analytics';
  content: string;
  time: string;
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/stats');
      return data;
    },
  });
}

export function useRecentActivity() {
  return useQuery<Activity[]>({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data } = await apiClient.get('/dashboard/activity');
      return data;
    },
  });
} 