import apiClient from '@/lib/axios';

export interface Post {
  id: string;
  content: string;
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed';
  socialAccountId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  scheduledFor: string;
  socialAccountId: string;
  attachments?: File[];
}

export const postsService = {
  getScheduledPosts: async (status?: string): Promise<Post[]> => {
    const response = await apiClient.get<Post[]>('/api/posts', {
      params: { status },
    });
    return response.data;
  },

  schedulePost: async (data: CreatePostData): Promise<Post> => {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('scheduledFor', data.scheduledFor);
    formData.append('socialAccountId', data.socialAccountId);
    if (data.attachments) {
      data.attachments.forEach((file) => formData.append('attachments', file));
    }
    const response = await apiClient.post<Post>('/api/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  cancelPost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}`);
  },
}; 