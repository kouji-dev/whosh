import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postsApi, type CreatePostData, type Post } from '@/api/posts';
import { toast } from 'sonner';

export const useScheduledPosts = (status?: string) => {
  return useQuery({
    queryKey: ['posts', 'scheduled', status],
    queryFn: () => postsApi.getScheduledPosts(status),
  });
};

export const useSchedulePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => postsApi.schedulePost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post scheduled successfully');
    },
    onError: (error) => {
      console.error('Failed to schedule post:', error);
      toast.error('Failed to schedule post');
    },
  });
};

export const useCancelPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.cancelPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Post cancelled successfully');
    },
    onError: (error) => {
      console.error('Failed to cancel post:', error);
      toast.error('Failed to cancel post');
    },
  });
}; 