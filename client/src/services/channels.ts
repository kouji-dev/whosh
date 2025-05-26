import apiClient from '@/lib/axios';

export interface PlatformType {
  code: string;
  name: string;
  icon: string;
  color: string;
  supportsMultipleChannels: boolean;
}

// Match backend structure
export interface Channel {
  id: string;
  platformId: string;
  platformUserId: string;
  username: string;
  displayName?: string;
  profileImage?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpires?: string;
  scopes: string[];
  isActive: boolean;
  lastSync?: string;
  metadata?: Record<string, any>;
}

export interface ChannelsResponse {
  channels: Channel[];
}

export const channelsService = {
  async getChannels(): Promise<ChannelsResponse> {
    const response = await apiClient.get<ChannelsResponse>('/api/channels');
    return response.data;
  },

  async disconnectChannel(channelId: string): Promise<void> {
    await apiClient.delete(`/api/channels/${channelId}`);
  },

  async syncChannelData(channelId: string): Promise<void> {
    await apiClient.post(`/api/channels/${channelId}/sync`);
  },

  async getChannelStatus(channelId: string): Promise<{
    isValid: boolean;
    lastSync: string | null;
  }> {
    const response = await apiClient.get<{
      isValid: boolean;
      lastSync: string | null;
    }>(`/api/channels/${channelId}/status`);
    return response.data;
  },

  async connectChannel(platform: string): Promise<string> {
    const response = await apiClient.post<{ url: string }>(`/api/channels/${platform}/connect`);
    return response.data.url;
  },
}; 