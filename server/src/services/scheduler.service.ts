import PgBoss from 'pg-boss';
import { prisma } from '../lib/prisma';
import { PlatformHandlerFactory } from './platforms/PlatformHandlerFactory';
import { PlatformCode } from '../config/platforms';
import config from '../config';
import { PrismaClient } from '@prisma/client';

interface PostJob {
  postId: string;
}

export class SchedulerService {
  private static instance: SchedulerService;
  private boss: PgBoss;
  private prisma: PrismaClient;

  private constructor() {
    if (!config.db.url) {
      throw new Error('Database URL is not configured');
    }
    this.boss = new PgBoss(config.db.url);
    this.prisma = prisma;
  }

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  async start() {
    await this.boss.start();
    await this.setupWorkers();
  }

  private async setupWorkers() {
    await this.boss.work('post-publish', async (jobs) => {
      for (const job of jobs) {
        const { postId } = (job as unknown as PgBoss.Job<{ postId: string }>).data;
        
        try {
          // Get the post with platform info
          const post = await this.prisma.post.findUnique({
            where: { id: postId },
            include: { socialAccount: true }
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

          // Update status in bulk
          await this.prisma.post.updateMany({
            where: { id: postId },
            data: { 
              status: 'published',
              publishedAt: new Date(),
              updatedAt: new Date()
            }
          });

        } catch (error) {
          // Get current retry count
          const post = await this.prisma.post.findUnique({
            where: { id: postId }
          });

          if (!post) {
            throw new Error('Post not found during retry');
          }

          // Update status and error in bulk
          await this.prisma.post.updateMany({
            where: { id: postId },
            data: { 
              status: 'failed',
              error: error.message,
              retryCount: { increment: 1 },
              updatedAt: new Date()
            }
          });
          
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
    socialAccountId: string;
    userId: string;
  }) {
    // Save to database in bulk
    const [post] = await this.prisma.$transaction([
      this.prisma.post.create({
        data: {
          content: data.content,
          mediaUrls: data.mediaUrls,
          scheduledFor: data.scheduledFor,
          status: 'scheduled',
          socialAccountId: data.socialAccountId,
          userId: data.userId
        }
      })
    ]);

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
    
    // Update status in bulk
    await this.prisma.post.updateMany({
      where: { id: postId },
      data: { 
        status: 'cancelled',
        updatedAt: new Date()
      }
    });
  }

  async getScheduledPosts(userId: string, status?: string) {
    return this.prisma.post.findMany({
      where: {
        userId,
        ...(status && { status })
      },
      include: {
        socialAccount: true
      },
      orderBy: {
        scheduledFor: 'asc'
      }
    });
  }
} 