import apiClient from '@/lib/axios';

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
  socialAccountId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  mediaUrls: string[];
  scheduledFor: string;
  socialAccountId: string;
}

export const postsService = {
  getScheduledPosts: async (status?: string): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/api/posts', {
      params: { status },
    });
    return response.data;
  },

  schedulePost: async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post<Post>('/api/posts', data);
    return response.data;
  },

  cancelPost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}`);
  },
}; 