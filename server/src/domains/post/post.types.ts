import { z } from 'zod';
import { posts } from '../../db/schema';
import { InferSelectModel } from 'drizzle-orm';

export type Post = InferSelectModel<typeof posts>;

// Validation schemas
export const createPostSchema = z.object({
  content: z.string().min(1),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledFor: z.string().datetime(),
  socialAccountId: z.string().uuid(),
});

export const cancelPostSchema = z.object({
  postId: z.string().uuid(),
});

export const getPostsSchema = z.object({
  status: z.enum(['scheduled', 'published', 'failed', 'cancelled']).optional(),
}); 