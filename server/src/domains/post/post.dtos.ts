import { z } from 'zod';
import { createAttachmentDto, updateAttachmentDto } from '../attachment/attachment.dtos';

// Info for creating a post (excluding attachments)
export const createPostInfoDto = z.object({
  content: z.string().min(1),
  scheduledFor: z.string().datetime(),
  channelId: z.string().uuid(),
});
export type CreatePostInfoDto = z.infer<typeof createPostInfoDto>;

// Full create post DTO
export const createPostDto = z.object({
  postInfo: createPostInfoDto,
  attachments: z.array(createAttachmentDto).optional(),
});
export type CreatePostDto = z.infer<typeof createPostDto>;

// Info for updating a post (excluding attachments)
export const updatePostInfoDto = z.object({
  content: z.string().min(1),
  scheduledFor: z.string().datetime(),
  channelId: z.string().uuid(),
});
export type UpdatePostInfoDto = z.infer<typeof updatePostInfoDto>;

// Full update post DTO
export const updatePostDto = z.object({
  postInfo: updatePostInfoDto,
  attachments: updateAttachmentDto.optional(),
});
export type UpdatePostDto = z.infer<typeof updatePostDto>; 