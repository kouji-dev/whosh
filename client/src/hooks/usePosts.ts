import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { postsService, Post, CreatePostData } from '@/services/posts';
import apiClient from '@/lib/axios';

export interface ValidatePostInput {
  content: string;
  media: { type: string }[];
  channels: string[];
}

export interface ValidatePostResult {
  errors: Record<string, string[]>;
}

export const usePosts = (status?: string) => {
  return useQuery<Post[]>({
    queryKey: ['posts', 'scheduled', status],
    queryFn: () => postsService.getScheduledPosts(status),
  });
};

export function useSchedulePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      return postsService.schedulePost(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post scheduled successfully');
    },
    onError: (error) => {
      console.error('Failed to schedule post:', error);
      toast.error('Failed to schedule post');
    },
  });
}

export function useValidatePost() {
  return useMutation<ValidatePostResult, Error, ValidatePostInput>({
    mutationFn: async (data) => {
      const res = await apiClient.post('/api/posts/validate', data);
      return res.data;
    },
  });
}

export function useCancelPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      await apiClient.delete(`/api/posts/${postId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post cancelled successfully');
    },
    onError: (error) => {
      console.error('Failed to cancel post:', error);
      toast.error('Failed to cancel post');
    },
  });
} 