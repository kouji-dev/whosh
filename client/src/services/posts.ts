import apiClient from '@/lib/axios';

export interface Attachment {
  id: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  userId: string;
  postId?: string | null;
  createdAt: string;
}

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  scheduledFor: string | null;
  publishedAt: string | null;
  error: string | null;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  channelId: string;
  attachments?: Attachment[];
}

export interface CreatePostData {
  content: string;
  scheduledFor: string;
  channelId: string;
  attachments?: File[];
}

export const postsService = {
  getScheduledPosts: async (status?: string): Promise<Post[]> => {
    const response = await apiClient.get<{ posts: Post[] }>('/api/posts', {
      params: { status },
    });
    return response.data.posts || [];
  },

  schedulePost: async (data: CreatePostData): Promise<Post> => {
    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('scheduledFor', data.scheduledFor);
    formData.append('channelId', data.channelId);
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