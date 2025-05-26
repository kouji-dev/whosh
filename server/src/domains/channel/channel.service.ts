import { ChannelRepository, IChannelRepository } from './channel.repository';
import { Channel, CreateChannelDto, UpdateChannelDto, ConnectionResult } from './channel.types';
import { PlatformHandlerFactory } from './handlers/platform-handler.factory';
import { PlatformCode } from '../../config/platforms';
import config from '../../config';
import { sendSseEventToUserId } from '../../infra/sse/sse';

export interface IChannelService {
  // Channel Management
  getChannels(userId: string): Promise<Channel[]>;
  getChannelById(id: string): Promise<Channel | null>;
  createChannel(data: CreateChannelDto): Promise<Channel>;
  updateChannel(id: string, data: UpdateChannelDto): Promise<Channel>;
  deleteChannel(id: string): Promise<void>;
  getChannelStatus(id: string): Promise<{ isValid: boolean; lastSync?: Date }>;
  syncChannelData(id: string): Promise<void>;

  // Platform Connection
  getAuthUrl(platform: PlatformCode, redirectUri: string, userId: string): Promise<string>;
  handleCallback(platform: PlatformCode, code: string, redirectUri: string, state: string, req: any): Promise<ConnectionResult>;
}

export class ChannelService implements IChannelService {
  private static instance: ChannelService;
  private channelRepository: IChannelRepository;

  private constructor() {
    this.channelRepository = ChannelRepository.getInstance();
  }

  static getInstance(): ChannelService {
    if (!ChannelService.instance) {
      ChannelService.instance = new ChannelService();
    }
    return ChannelService.instance;
  }

  // Channel Management Methods
  async getChannels(userId: string): Promise<Channel[]> {
    return this.channelRepository.findByUserId(userId);
  }

  async getChannelById(id: string): Promise<Channel | null> {
    return this.channelRepository.findById(id);
  }

  async createChannel(data: CreateChannelDto): Promise<Channel> {
    return this.channelRepository.create(data);
  }

  async updateChannel(id: string, data: UpdateChannelDto): Promise<Channel> {
    return this.channelRepository.update(id, data);
  }

  async deleteChannel(id: string): Promise<void> {
    await this.channelRepository.delete(id);
  }

  async getChannelStatus(id: string): Promise<{ isValid: boolean; lastSync?: Date }> {
    const channel = await this.channelRepository.findById(id);
    if (!channel) {
      throw new Error('Channel not found');
    }

    return {
      isValid: channel.isActive && (!channel.tokenExpires || channel.tokenExpires > new Date()),
      lastSync: channel.lastSync || undefined,
    };
  }

  async syncChannelData(id: string): Promise<void> {
    const channel = await this.channelRepository.findById(id);
    if (!channel) {
      throw new Error('Channel not found');
    }

    const handler = PlatformHandlerFactory.getInstance().getHandler(channel.platformId as PlatformCode);
    const userInfo = await handler.getUserInfo(channel.accessToken);

    await this.channelRepository.update(id, {
      username: userInfo.username,
      displayName: userInfo.displayName,
      profileImage: userInfo.avatarUrl,
      lastSync: new Date(),
    });
  }

  // Platform Connection Methods
  async getAuthUrl(platform: PlatformCode, redirectUri: string, userId: string): Promise<string> {
    const handler = PlatformHandlerFactory.getInstance().getHandler(platform);
    return handler.getAuthUrl(redirectUri, userId);
  }

  async handleCallback(platform: PlatformCode, code: string, redirectUri: string, state: string, req: any): Promise<ConnectionResult> {
    try {
      const handler = PlatformHandlerFactory.getInstance().getHandler(platform);
      const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());
      const tokens = await handler.handleCallback(code, redirectUri, state);
      const userInfo = await handler.getUserInfo(tokens.accessToken);
      // Check if channel already exists
      const existingChannel = await this.channelRepository.findByPlatformAndUserId(platform, userInfo.id);
      if (existingChannel) {
        // Update existing channel
        await this.channelRepository.update(existingChannel.id, {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || undefined,
          tokenExpires: new Date(Date.now() + tokens.expiresIn * 1000),
          username: userInfo.username,
          displayName: userInfo.displayName || undefined,
          profileImage: userInfo.avatarUrl || undefined,
        });
      } else {
        // Create new channel
        await this.channelRepository.create({
          userId,
          platformId: platform,
          platformUserId: userInfo.id,
          username: userInfo.username,
          displayName: userInfo.displayName || undefined,
          profileImage: userInfo.avatarUrl || undefined,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || undefined,
          tokenExpires: new Date(Date.now() + tokens.expiresIn * 1000),
          scopes: [],
          isActive: true,
          metadata: {},
        });
      }
      // Notify client via SSE using client id from cookie
      sendSseEventToUserId(userId, 'platform-connected', { platform });
      // Redirect to the generic status page for the popup
      return {
        success: true,
        redirectUrl: `${config.server.clientUrl}/status?status=success`,
      };
    } catch (error) {
      const errorMsg = encodeURIComponent(error.message || 'Unknown error');
      return {
        success: false,
        redirectUrl: `${config.server.clientUrl}/status?status=error&error=${errorMsg}`,
        error: error.message,
      };
    }
  }
} 