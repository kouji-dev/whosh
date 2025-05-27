import { PostRepository, IPostRepository } from './post.repository';
import { Post } from './post.types';
import { PostScheduleService, IPostScheduleService } from './post-schedule.service';
import { platforms, PlatformCode } from '../../config/platforms';
import { ChannelRepository, IChannelRepository } from '../channel/channel.repository';
import { AttachmentService } from '../attachment/attachment.service';
import { logger } from '../../infra/logger/pino-logger';
import { v4 as uuidv4 } from 'uuid';
import { CreatePostDto, UpdatePostDto } from './post.dtos';

export interface IPostService {
  schedulePost(dto: CreatePostDto & { userId: string }): Promise<Post>;
  updatePost(dto: UpdatePostDto & { postId: string; userId: string }): Promise<Post>;
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

  async schedulePost(dto: CreatePostDto & { userId: string }): Promise<Post> {
    const { postInfo, attachments } = dto;
    // 1. Validate post for each platform/channel
    const validationErrors = await this.validatePostForPlatforms({
      content: postInfo.content,
      media: attachments ? attachments.map(a => a.file) : [],
      channels: [postInfo.channelId],
    });
    if (Object.keys(validationErrors).length > 0) {
      logger.error('Validation failed', validationErrors);
      throw new Error(`Validation failed: ${JSON.stringify(validationErrors)}`);
    }

    // 4. Create the post using repository
    let post: Post  = await this.postRepository.create({
      content: postInfo.content,
      mediaUrls: [], // Will be filled after upload to platform
      scheduledFor: new Date(postInfo.scheduledFor),
      status: 'scheduled',
      channelId: postInfo.channelId,
      userId: dto.userId,
      publishedAt: null,
      error: null,
      retryCount: 0,
    });

    // 3. Save attachments and link to postId
    if (attachments && attachments.length > 0) {
      try {
        const files = attachments.map(a => ({
          id: uuidv4(),
          buffer: a.file.buffer,
          originalname: a.file.originalname,
          mimetype: a.file.mimetype,
          size: a.file.size,
          userId: dto.userId,
          postId: post.id,
        }));
        await this.attachmentService.saveBulk(files, dto.userId, post.id);
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

  async updatePost(dto: UpdatePostDto & { postId: string; userId: string }): Promise<Post> {
    const { postInfo, attachments, postId, userId } = dto;
    // Fetch the post and ensure it is not published
    const postToUpdate = await this.postRepository.findById(postId);
    if (!postToUpdate) throw new Error('Post not found');
    if (postToUpdate.status === 'published') throw new Error('Cannot update a published post');
    // Delete only attachments specified in attachments.deleted
    if (attachments && attachments.deleted && attachments.deleted.length > 0) {
      const toDelete = await this.attachmentService.findByIds(attachments.deleted);
      if (toDelete.length > 0) {
        await this.attachmentService.bulkDelete(toDelete);
      }
    }
    // Save new attachments
    if (attachments && attachments.newFiles && attachments.newFiles.length > 0) {
      const files = attachments.newFiles.map(a => ({
        id: uuidv4(),
        buffer: a.file.buffer,
        originalname: a.file.originalname,
        mimetype: a.file.mimetype,
        size: a.file.size,
        userId,
        postId,
      }));
      await this.attachmentService.saveBulk(files, userId, postId);
    }
    // Update the post
    const post = await this.postRepository.update(postId, {
      content: postInfo.content,
      scheduledFor: new Date(postInfo.scheduledFor),
      channelId: postInfo.channelId,
      userId,
      updatedAt: new Date(),
    });
    return post;
  }

  async cancelPost(postId: string): Promise<void> {
    // Fetch the post and ensure it is not published
    const postToCancel = await this.postRepository.findById(postId);
    if (!postToCancel) throw new Error('Post not found');
    if (postToCancel.status === 'published') throw new Error('Cannot cancel a published post');
    await this.scheduleService.cancelPost(postId);
  }

  async getScheduledPosts(userId: string, status?: string): Promise<Post[]> {
    // Fetch posts with channel and platform info
    const results = await this.postRepository.findWithChannelAndPlatformByUserId(userId, status);

    // Fetch attachments for each post
    const postsWithAttachments = await Promise.all(results
      .filter((result: any): result is typeof result & { scheduledFor: Date } => 
        result.scheduledFor !== null
      )
      .map(async (result: any) => {
        const attachments = await this.attachmentService.findByPostId(result.id);
        return {
          ...result,
          status: result.status as Post['status'],
          publishedAt: result.publishedAt || null,
          channelId: result.channelId, // For backward compatibility
          attachments,
        };
      }));
    return postsWithAttachments;
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
