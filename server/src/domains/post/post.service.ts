import { PostRepository, IPostRepository } from './post.repository';
import { Post } from './post.types';
import { PostScheduleService, IPostScheduleService } from './post-schedule.service';
import { platforms, PlatformCode } from '../../config/platforms';
import { ChannelRepository, IChannelRepository } from '../channel/channel.repository';
import { AttachmentService } from '../attachment/attachment.service';
import { logger } from '../../infra/logger/pino-logger';
import { v4 as uuidv4 } from 'uuid';

export interface IPostService {
  schedulePost(data: {
    content: string;
    attachments: Express.Multer.File[];
    scheduledFor: Date;
    socialAccountId: string;
    userId: string;
  }): Promise<Post>;
  cancelPost(postId: string): Promise<void>;
  getScheduledPosts(userId: string, status?: string): Promise<Post[]>;
  validatePostForPlatforms(args: { content: string; media: any[]; channels: string[] }): Promise<Record<string, string[]>>;
}

export class PostService implements IPostService {
  private static instance: PostService;
  private postRepository: IPostRepository;
  private channelRepository: IChannelRepository;
  private scheduleService: IPostScheduleService;
  private attachmentService: AttachmentService;

  private constructor() {
    this.postRepository = PostRepository.getInstance();
    this.channelRepository = ChannelRepository.getInstance();
    this.scheduleService = PostScheduleService.getInstance();
    this.attachmentService = AttachmentService.getInstance();
  }

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  async schedulePost(data: {
    content: string;
    attachments: Express.Multer.File[];
    scheduledFor: Date;
    socialAccountId: string;
    userId: string;
  }): Promise<Post> {
    // 1. Validate post for each platform/channel
    const validationErrors = await this.validatePostForPlatforms({
      content: data.content,
      media: data.attachments,
      channels: [data.socialAccountId],
    });
    if (Object.keys(validationErrors).length > 0) {
      logger.error('Validation failed', validationErrors);
      throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
    }

    // 4. Create the post using repository
    let post: Post  = await this.postRepository.create({
      content: data.content,
      mediaUrls: [], // Will be filled after upload to platform
      scheduledFor: data.scheduledFor,
      status: 'scheduled',
      channelId: data.socialAccountId,
      userId: data.userId,
      publishedAt: null,
      error: null,
      retryCount: 0,
    });

    // 3. Save attachments and link to postId
    if (data.attachments && data.attachments.length > 0) {
      try {
        const files = data.attachments.map(file => ({
          id: uuidv4(),
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          userId: data.userId,
          postId: post.id,
        }));
        await this.attachmentService.saveBulk(files, data.userId, post.id);
      } catch (err) {
        logger.error('Failed to save attachments', err);
      }
    }

    try { 
      await this.scheduleService.schedulePost(post);
    } catch (err) {
      logger.error('Failed to create or schedule post', err);
      throw err;
    }

    return post;
  }

  async cancelPost(postId: string): Promise<void> {
    await this.scheduleService.cancelPost(postId);
  }

  async getScheduledPosts(userId: string, status?: string): Promise<Post[]> {
    return this.scheduleService.getScheduledPosts(userId, status);
  }

  async validatePostForPlatforms({ content, media, channels }: { content: string; media: any[]; channels: string[] }): Promise<Record<string, string[]>> {
    // TODO: Map channel IDs to platform codes/types
    // For now, assume channels is an array of platform codes
    const errors: Record<string, string[]> = {};
    for (const platformCode of channels) {
      const platform = platforms[platformCode as PlatformCode];
      if (!platform) continue;
      const platformErrors: string[] = [];
      // Text length
      if (content.length > platform.capabilities.maxTextLength) {
        platformErrors.push(`Text too long (max ${platform.capabilities.maxTextLength})`);
      }
      // Media type checks
      if (media && media.length > 0) {
        for (const file of media) {
          if (!platform.capabilities.allowedMedia.includes(file.type)) {
            platformErrors.push(`Media type '${file.type}' not allowed`);
          }
        }
      }
      // TikTok: requires video if present
      if (platformCode === 'tiktok' && (!media || !media.some(f => f.type === 'video'))) {
        platformErrors.push('TikTok requires a video attachment');
      }
      if (platformErrors.length > 0) errors[platformCode] = platformErrors;
    }
    return errors;
  }
}
