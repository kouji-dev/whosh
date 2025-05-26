import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { postsService, Post, CreatePostData } from '@/services/posts';

export const useScheduledPosts = (status?: string) => {
  return useQuery<Post[]>({
    queryKey: ['posts', 'scheduled', status],
    queryFn: () => postsService.getScheduledPosts(status),
  });
};

export const useSchedulePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostData) => postsService.schedulePost(data),
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
    mutationFn: (postId: string) => postsService.cancelPost(postId),
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