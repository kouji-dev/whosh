import axios from '@/lib/axios';

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

export const postsApi = {
  schedulePost: async (data: CreatePostData) => {
    const response = await axios.post<Post>('/posts/schedule', data);
    return response.data;
  },

  cancelPost: async (postId: string) => {
    const response = await axios.post(`/posts/${postId}/cancel`);
    return response.data;
  },

  getScheduledPosts: async (status?: string) => {
    const response = await axios.get<Post[]>('/posts/scheduled', {
      params: { status },
    });
    return response.data;
  },
}; 