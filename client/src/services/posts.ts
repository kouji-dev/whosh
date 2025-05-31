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

export interface CreatePostInfo {
  content: string;
  scheduledFor: string;
  channelId: string;
}

export interface CreatePostData {
  postInfo: CreatePostInfo;
  attachments?: File[];
}

export const postsService = {
  getScheduledPosts: async (status?: string): Promise<Post[]> => {
    const response = await apiClient.get<{ posts: Post[] }>('/api/posts', {
      params: { status },
    });
    return response.data.posts || [];
  },

  schedulePost: async (data: CreatePostData & { channelIds?: string[] }): Promise<Post | Post[]> => {
    // Support both single and multiple channels
    const channelIds = data.channelIds || (data.postInfo.channelId ? [data.postInfo.channelId] : []);
    if (channelIds.length > 1) {
      // Schedule for multiple channels
      const results: Post[] = [];
      for (const channelId of channelIds) {
        const formData = new FormData();
        formData.append('postInfo', JSON.stringify({
          ...data.postInfo,
          channelId,
        }));
        if (data.attachments) {
          data.attachments.forEach((file) => formData.append('attachments', file));
        }
        const response = await apiClient.post<Post>('/api/posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        results.push(response.data);
      }
      return results;
    } else {
      // Single channel (default)
      const formData = new FormData();
      formData.append('postInfo', JSON.stringify({
        ...data.postInfo,
        channelId: channelIds[0],
      }));
      if (data.attachments) {
        data.attachments.forEach((file) => formData.append('attachments', file));
      }
      const response = await apiClient.post<Post>('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
  },

  cancelPost: async (postId: string): Promise<void> => {
    await apiClient.delete(`/api/posts/${postId}`);
  },

  updatePost: async (postId: string, data: {
    content: string;
    scheduledFor: string;
    channelId: string;
    newFiles?: File[];
    deletedAttachmentIds?: string[];
  }): Promise<Post> => {
    const formData = new FormData();
    formData.append('postInfo', JSON.stringify({
      content: data.content,
      scheduledFor: data.scheduledFor,
      channelId: data.channelId,
    }));
    if (data.newFiles && data.newFiles.length > 0) {
      data.newFiles.forEach((file) => formData.append('attachments.newFiles', file));
    }
    if (data.deletedAttachmentIds && data.deletedAttachmentIds.length > 0) {
      formData.append('attachments.deleted', JSON.stringify(data.deletedAttachmentIds));
    }
    const response = await apiClient.put<Post>(`/api/posts/${postId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
}; 