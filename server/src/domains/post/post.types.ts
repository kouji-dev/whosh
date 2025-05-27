import { z } from 'zod';
import { posts } from '../../db/schema';
import { InferSelectModel } from 'drizzle-orm';
import type { Attachment } from '../attachment/attachment.model';

export type Post = InferSelectModel<typeof posts> & {
  attachments?: Attachment[];
};

// Validation schemas
export const createPostSchema = z.object({
  content: z.string().min(1),
  scheduledFor: z.string().datetime(),
  channelId: z.string().uuid(),
  attachments: z.any().optional(), // Accepts files from FormData
});

export const cancelPostSchema = z.object({
  postId: z.string().uuid(),
});

export const getPostsSchema = z.object({
  status: z.enum(['scheduled', 'published', 'failed', 'cancelled']).optional(),
}); 