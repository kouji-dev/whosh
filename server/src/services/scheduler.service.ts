import PgBoss from 'pg-boss';
import { dbClient } from '../lib/db';
import { PlatformHandlerFactory } from './platforms/PlatformHandlerFactory';
import { PlatformCode } from '../config/platforms';
import config from '../config';
import { eq } from 'drizzle-orm';
import { posts } from '../db/schema';

export class SchedulerService {
  private static instance: SchedulerService;
  private boss: PgBoss;

  private constructor() {
    if (!config.db.url) {
      throw new Error('Database URL is not configured');
    }
    this.boss = new PgBoss({
      connectionString: config.db.url,
      ssl: {
        rejectUnauthorized: false
      }
    });
    this.boss.on('error', console.error);
  }

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  async start() {
    console.log('Scheduler service starting...');
    await this.boss.start();
    await this.setupWorkers();
    console.log('Scheduler service started successfully');
  }

  private async setupWorkers() {
    console.log('Setting up post-publish workers...');
    await this.boss.work('post-publish', async (jobs) => {
      for (const job of jobs) {
        const { postId } = (job as unknown as PgBoss.Job<{ postId: string }>).data;
        
        try {
          // Get the post with platform info
          const post = await dbClient.query.posts.findFirst({
            where: eq(posts.id, postId),
            with: {
              socialAccount: true
            }
          });

          if (!post) {
            throw new Error('Post not found');
          }

          // Get the platform handler
          const handler = PlatformHandlerFactory.getHandler(post.socialAccount.platform as PlatformCode);
          
          // Publish the post using the platform handler
          await handler.publishPost({
            content: post.content,
            mediaUrls: post.mediaUrls,
            accessToken: post.socialAccount.accessToken
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
    console.log('Post-publish workers setup completed');
  }

  async schedulePost(data: {
    content: string;
    mediaUrls: string[];
    scheduledFor: Date;
    socialAccountId: string;
    userId: string;
  }) {
    // Save to database
    const [post] = await dbClient.insert(posts)
      .values({
        content: data.content,
        mediaUrls: data.mediaUrls,
        scheduledFor: data.scheduledFor,
        status: 'scheduled',
        socialAccountId: data.socialAccountId,
        userId: data.userId
      })
      .returning();

    // Schedule the job
    await this.boss.send(
      'post-publish',
      { postId: post.id },
      {
        id: post.id,
        startAfter: data.scheduledFor
      }
    );

    return post;
  }

  async cancelPost(postId: string) {
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

  async getScheduledPosts(userId: string, status?: string) {
    return dbClient.query.posts.findMany({
      where: eq(posts.userId, userId),
      with: {
        socialAccount: true
      },
      orderBy: (posts, { asc }) => [asc(posts.scheduledFor)]
    });
  }
} 