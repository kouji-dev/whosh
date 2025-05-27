import { eq, and } from 'drizzle-orm';
import { dbClient } from '../../lib/db';
import { posts } from '../../db/schema';
import { Post } from './post.types';

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findByUserId(userId: string, status?: string): Promise<Post[]>;
  create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post>;
  update(id: string, data: Partial<Post>): Promise<Post>;
  delete(id: string): Promise<void>;
  findWithChannelAndPlatformByUserId(userId: string, status?: string): Promise<any[]>;
}

export class PostRepository implements IPostRepository {
  private static instance: PostRepository;

  private constructor() {}

  public static getInstance(): PostRepository {
    if (!PostRepository.instance) {
      PostRepository.instance = new PostRepository();
    }
    return PostRepository.instance;
  }

  async findById(id: string): Promise<Post | null> {
    const result = await dbClient.query.posts.findFirst({
      where: eq(posts.id, id),
    });
    if (!result || !result.scheduledFor) return null;
    return {
      ...result,
      scheduledFor: result.scheduledFor,
      status: result.status as Post['status'],
      publishedAt: result.publishedAt || undefined,
    };
  }

  async findByUserId(userId: string, status?: string): Promise<Post[]> {
    const query = status
      ? and(eq(posts.userId, userId), eq(posts.status, status))
      : eq(posts.userId, userId);

    const results = await dbClient.query.posts.findMany({
      where: query,
      orderBy: (posts, { asc }) => [asc(posts.scheduledFor)],
    });

    return results
      .filter((result): result is typeof result & { scheduledFor: Date } => 
        result.scheduledFor !== null
      )
      .map(result => ({
        ...result,
        status: result.status as Post['status'],
        publishedAt: result.publishedAt || undefined,
      }));
  }

  async create(data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
    const [post] = await dbClient
      .insert(posts)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!post.scheduledFor) {
      throw new Error('Scheduled date is required');
    }

    return {
      ...post,
      scheduledFor: post.scheduledFor,
      status: post.status as Post['status'],
      publishedAt: post.publishedAt || undefined,
    };
  }

  async update(id: string, data: Partial<Post>): Promise<Post> {
    const [post] = await dbClient
      .update(posts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id))
      .returning();

    if (!post.scheduledFor) {
      throw new Error('Scheduled date is required');
    }

    return {
      ...post,
      scheduledFor: post.scheduledFor,
      status: post.status as Post['status'],
      publishedAt: post.publishedAt || undefined,
    };
  }

  async delete(id: string): Promise<void> {
    await dbClient.delete(posts).where(eq(posts.id, id));
  }

  async findWithChannelAndPlatformByUserId(userId: string, status?: string): Promise<any[]> {
    const query = status
      ? and(eq(posts.userId, userId), eq(posts.status, status))
      : eq(posts.userId, userId);

    return dbClient.query.posts.findMany({
      where: query,
      with: {
        channel: {
          with: {
            platform: true
          }
        }
      },
      orderBy: (posts, { asc }) => [asc(posts.scheduledFor)]
    });
  }
} 