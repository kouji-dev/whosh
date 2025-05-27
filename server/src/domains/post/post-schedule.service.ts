import PgBoss from 'pg-boss';
import { dbClient } from '../../lib/db';
import { PlatformHandlerFactory } from '../channel/handlers/platform-handler.factory';
import { PlatformCode } from '../../config/platforms';
import config from '../../config';
import { eq } from 'drizzle-orm';
import { posts } from '../../db/schema';
import { Post } from './post.types';
import { loggerFactory } from '../../infra/logger/pino-logger';
import { AttachmentService } from '../attachment/attachment.service';

const logger = loggerFactory({ prefix: 'Post Scheduler' });
const POST_PUBLISH_QUEUE = 'post-publish';

export interface IPostScheduleService {
  start(): Promise<void>;
  schedulePost(post: Post): Promise<void>;
  cancelPost(postId: string): Promise<void>;
  getScheduledPosts(userId: string, status?: string): Promise<Post[]>;
}

export class PostScheduleService implements IPostScheduleService {
  private static instance: PostScheduleService;
  private boss: PgBoss;
  private attachmentService = AttachmentService.getInstance();

  private constructor() {
    if (!config.db.directUrl) {
      throw new Error('Database URL is not configured');
    }
    this.boss = new PgBoss({
      connectionString: config.db.directUrl
    });
    this.boss.on('error', (err) => {
      logger.error('PgBoss error', { err });
    });
  }

  static getInstance(): PostScheduleService {
    if (!PostScheduleService.instance) {
      PostScheduleService.instance = new PostScheduleService();
    }
    return PostScheduleService.instance;
  }

  async start() {
    try {
      logger.info('Post schedule service starting...');
      await this.boss.start();
      logger.info('PgBoss started');
      await this.setupWorkers();
      logger.info('Post schedule service started successfully');
    } catch (error) {
      logger.error('Failed to start post schedule service', error);
      throw error;
    }
  }

  private async setupWorkers() {
    logger.info('Setting up post-publish workers...');
    await this.boss.createQueue(POST_PUBLISH_QUEUE, {
      name: POST_PUBLISH_QUEUE,
      policy: 'standard',
      retryLimit: 1,
      retryDelay: 1000,
      retryBackoff: true
    });
    await this.boss.work(POST_PUBLISH_QUEUE, async (jobs: PgBoss.Job<{ postId: string }>[]) => {
      logger.info('Worker received jobs', { jobs });
      for (const job of jobs) {
        const postId = job.id
        logger.info('Worker received job for post', { postId });
        try {
          // Get the post with channel info
          const post = await dbClient.query.posts.findFirst({
            where: eq(posts.id, postId),
            with: {
              channel: {
                with: {
                  platform: true
                }
              }
            }
          });

          if (!post || !post.scheduledFor) {
            logger.error('Post not found or missing scheduledFor', { postId });
            throw new Error('Post not found');
          }

          // Get the platform handler
          const handler = PlatformHandlerFactory.getInstance().getHandler(post.channel.platform.code as PlatformCode);
          logger.info('Publishing post to platform', { postId, platform: post.channel.platform.code });
          // Publish the post using the platform handler
          await handler.publishPost({
            postId,
            content: post.content,
            mediaUrls: post.mediaUrls,
            accessToken: post.channel.accessToken
          });

          // Delete attachments after successful publish
          const attachments = await this.attachmentService.findByPostId(postId);
          if (attachments.length > 0) {
            await this.attachmentService.bulkDelete(attachments);
            logger.info('Bulk deleted attachments after publish', { postId, attachmentIds: attachments.map(a => a.id) });
          }

          // Update status
          await dbClient.update(posts)
            .set({ 
              status: 'published',
              publishedAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(posts.id, postId));
          logger.info('Post published and status updated', { postId });
        } catch (error) {
          logger.error('Error publishing post, will retry if possible', { postId, err: error });
          // Get current retry count
          const post = await dbClient.query.posts.findFirst({
            where: eq(posts.id, postId)
          });

          if (!post) {
            logger.error('Post not found during retry', { postId });
            throw new Error('Post not found during retry');
          }

          // Update status and error
          await dbClient.update(posts)
            .set({ 
              status: 'failed',
              error: error.message,
              retryCount: post.retryCount + 1,
              updatedAt: new Date()
            })
            .where(eq(posts.id, postId));
          logger.info('Post marked as failed and retry count incremented', { postId, retryCount: post.retryCount + 1 });
          // Retry logic with exponential backoff
          const retryCount = post.retryCount + 1;
          if (retryCount <= 3) {
            const backoffMs = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            logger.info('Retrying post publish with backoff', { postId, retryCount, backoffMs });
            await this.boss.send(
              POST_PUBLISH_QUEUE,
              { postId },
              {
                id: postId,
                retryLimit: 1,
                retryDelay: backoffMs
              }
            );
          } else {
            logger.error('Max retries reached, giving up', { postId });
          }
        }
      }
    });
  }

  async schedulePost(post: Post): Promise<void> {
    if (!post.scheduledFor) {
      logger.error('Scheduled date is required', { postId: post.id });
      throw new Error('Scheduled date is required');
    }
    // Schedule the job
    try {
      await this.boss.send(
        POST_PUBLISH_QUEUE,
        {},
        {
          id: post.id,
          startAfter: post.scheduledFor
        }
      );
    } catch (error) {
      logger.error('Failed to schedule post for publishing', { postId: post.id, err: error });
      throw error;
    }
    logger.info('Post scheduled for publishing', { postId: post.id });
  }

  async cancelPost(postId: string): Promise<void> {
    logger.info('Cancelling scheduled post', { postId });
    // Cancel the job
    await this.boss.cancel(POST_PUBLISH_QUEUE, postId);
    
    // Update status
    await dbClient.update(posts)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
    logger.info('Post cancelled and status updated', { postId });
  }

  async getScheduledPosts(userId: string, status?: string): Promise<Post[]> {
    const results = await dbClient.query.posts.findMany({
      where: eq(posts.userId, userId),
      with: {
        channel: {
          with: {
            platform: true
          }
        }
      },
      orderBy: (posts, { asc }) => [asc(posts.scheduledFor)]
    });

    return results
      .filter((result): result is typeof result & { scheduledFor: Date } => 
        result.scheduledFor !== null
      )
      .map(result => ({
        ...result,
        status: result.status as Post['status'],
        publishedAt: result.publishedAt || null,
        socialAccountId: result.channelId // For backward compatibility
      }));
  }
} 