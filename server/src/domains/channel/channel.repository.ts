import { dbClient } from '../../lib/db';
import { socialChannels } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { Channel, CreateChannelDto, UpdateChannelDto } from './channel.types';

export interface IChannelRepository {
  findById(id: string): Promise<Channel | null>;
  findByUserId(userId: string): Promise<Channel[]>;
  findByPlatformAndUserId(platformId: string, platformUserId: string): Promise<Channel | null>;
  create(data: CreateChannelDto): Promise<Channel>;
  update(id: string, data: UpdateChannelDto): Promise<Channel>;
  delete(id: string): Promise<void>;
}

export class ChannelRepository implements IChannelRepository {
  private static instance: ChannelRepository;

  private constructor() {}

  static getInstance(): ChannelRepository {
    if (!ChannelRepository.instance) {
      ChannelRepository.instance = new ChannelRepository();
    }
    return ChannelRepository.instance;
  }

  async findById(id: string): Promise<Channel | null> {
    const result = await dbClient.query.socialChannels.findFirst({
      where: eq(socialChannels.id, id),
    });
    return result ? this.mapToChannel(result) : null;
  }

  async findByUserId(userId: string): Promise<Channel[]> {
    const results = await dbClient.query.socialChannels.findMany({
      where: eq(socialChannels.userId, userId),
    });
    return results.map(this.mapToChannel);
  }

  async findByPlatformAndUserId(platformId: string, platformUserId: string): Promise<Channel | null> {
    const result = await dbClient.query.socialChannels.findFirst({
      where: and(
        eq(socialChannels.platformId, platformId),
        eq(socialChannels.platformUserId, platformUserId)
      ),
    });
    return result ? this.mapToChannel(result) : null;
  }

  async create(data: CreateChannelDto): Promise<Channel> {
    const [result] = await dbClient.insert(socialChannels)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return this.mapToChannel(result);
  }

  async update(id: string, data: UpdateChannelDto): Promise<Channel> {
    const [result] = await dbClient.update(socialChannels)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(socialChannels.id, id))
      .returning();
    return this.mapToChannel(result);
  }

  async delete(id: string): Promise<void> {
    await dbClient.delete(socialChannels)
      .where(eq(socialChannels.id, id));
  }

  private mapToChannel(data: typeof socialChannels.$inferSelect): Channel {
    return {
      ...data,
      displayName: data.displayName || undefined,
      profileImage: data.profileImage || undefined,
      refreshToken: data.refreshToken || undefined,
      tokenExpires: data.tokenExpires || undefined,
      lastSync: data.lastSync || undefined,
      metadata: data.metadata || {},
    };
  }
} 