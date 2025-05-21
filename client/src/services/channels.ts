import apiClient from '@/lib/axios';

export interface PlatformType {
  code: string;
  name: string;
  icon: string;
  color: string;
  supportsMultipleChannels: boolean;
}

export interface Channel {
  id: string;
  platformId: string;
  accountName: string;
  accountId: string;
  platform: {
    code: string;
    name: string;
    icon: string;
    color: string;
  };
  lastSync: string | null;
  isValid: boolean;
  isParentConnection: boolean;
}

export interface ChannelsResponse {
  platformTypes: PlatformType[];
  channels: Record<string, Channel[]>;
}

export const channelsService = {
  async getChannels(): Promise<ChannelsResponse> {
    const response = await apiClient.get<ChannelsResponse>('/api/platforms/channels');
    return response.data;
  },

  async getAuthUrl(platformCode: string): Promise<string> {
    const response = await apiClient.get<{ authUrl: string }>(`/api/platforms/channels/${platformCode}/auth`);
    return response.data.authUrl;
  },

  async disconnectChannel(channelId: string): Promise<void> {
    await apiClient.delete(`/api/platforms/channels/${channelId}`);
  },

  async syncChannelData(channelId: string): Promise<void> {
    await apiClient.post(`/api/platforms/channels/${channelId}/sync`);
  },

  async getChannelStatus(channelId: string): Promise<{
    isValid: boolean;
    lastSync: string | null;
  }> {
    const response = await apiClient.get<{
      isValid: boolean;
      lastSync: string | null;
    }>(`/api/platforms/channels/${channelId}/status`);
    return response.data;
  },
}; 