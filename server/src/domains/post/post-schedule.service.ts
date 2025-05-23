import PgBoss from 'pg-boss';
import { dbClient } from '../../lib/db';
import { PlatformHandlerFactory } from '../channel/handlers/platform-handler.factory';
import { PlatformCode } from '../../config/platforms';
import config from '../../config';
import { eq } from 'drizzle-orm';
import { posts } from '../../db/schema';
import { Post } from './post.types';
import { logger } from '../../infra/logger/pino-logger';

export interface IPostScheduleService {
  start(): Promise<void>;
  schedulePost(data: {
    content: string;
    mediaUrls: string[];
    scheduledFor: Date;
    channelId: string;
    userId: string;
  }): Promise<Post>;
  cancelPost(postId: string): Promise<void>;
  getScheduledPosts(userId: string, status?: string): Promise<Post[]>;
}

export class PostScheduleService implements IPostScheduleService {
  private static instance: PostScheduleService;
  private boss: PgBoss;

  private constructor() {
    if (!config.db.directUrl) {
      throw new Error('Database URL is not configured');
    }
    this.boss = new PgBoss({
      connectionString: config.db.directUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    this.boss.on('error', console.error);
  }

  static getInstance(): PostScheduleService {
    if (!PostScheduleService.instance) {
      PostScheduleService.instance = new PostScheduleService();
    }
    return PostScheduleService.instance;
  }

  async start() {
    logger.info('Post schedule service starting...');
    await this.boss.start();
    await this.setupWorkers();
    logger.info('Post schedule service started successfully');
  }

  private async setupWorkers() {
    logger.info('Setting up post-publish workers...');
    await this.boss.work('post-publish', async (jobs) => {
      for (const job of jobs) {
        const { postId } = (job as unknown as PgBoss.Job<{ postId: string }>).data;
        
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
            throw new Error('Post not found');
          }

          // Get the platform handler
          const handler = PlatformHandlerFactory.getInstance().getHandler(post.channel.platform.code as PlatformCode);
          
          // Publish the post using the platform handler
          await handler.publishPost({
            content: post.content,
            mediaUrls: post.mediaUrls,
            accessToken: post.channel.accessToken
          });

          // Update status
          await dbClient.update(posts)
            .set({ 
              status: 'published',
              publishedAt: new Date(),
              updatedAt: new Date()
            })
            .where(eq(posts.id, postId));

        } catch (error) {
          // Get current retry count
          const post = await dbClient.query.posts.findFirst({
            where: eq(posts.id, postId)
          });

          if (!post) {
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
          
          // Retry logic with exponential backoff
          const retryCount = post.retryCount + 1;
          if (retryCount <= 3) {
            const backoffMs = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
            await this.boss.send(
              'post-publish',
              { postId },
              {
                id: postId,
                retryLimit: 1,
                retryDelay: backoffMs
              }
            );
          }
        }
      }
    });
  }

  async schedulePost(data: {
    content: string;
    mediaUrls: string[];
    scheduledFor: Date;
    channelId: string;
    userId: string;
  }): Promise<Post> {
    // Save to database
    const [post] = await dbClient.insert(posts)
      .values({
        content: data.content,
        mediaUrls: data.mediaUrls,
        scheduledFor: data.scheduledFor,
        status: 'scheduled',
        channelId: data.channelId,
        userId: data.userId
      })
      .returning();

    if (!post.scheduledFor) {
      throw new Error('Scheduled date is required');
    }

    // Schedule the job
    await this.boss.send(
      'post-publish',
      { postId: post.id },
      {
        id: post.id,
        startAfter: data.scheduledFor
      }
    );

    return {
      ...post,
      scheduledFor: post.scheduledFor,
      status: post.status as Post['status'],
      publishedAt: post.publishedAt || null,
      socialAccountId: post.channelId // For backward compatibility
    };
  }

  async cancelPost(postId: string): Promise<void> {
    // Cancel the job
    await this.boss.cancel('post-publish', postId);
    
    // Update status
    await dbClient.update(posts)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
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