import { z } from 'zod';

// For new files (upload)
export const createAttachmentDto = z.object({
  file: z.any(), // Multer file object
  // Optionally: description, type, etc.
});
export type CreateAttachmentDto = z.infer<typeof createAttachmentDto>;

// For update: distinguish between new files and deleted IDs
export const updateAttachmentDto = z.object({
  newFiles: z.array(createAttachmentDto).optional(), // Array of createAttachmentDto
  deleted: z.array(z.string().uuid()).optional(), // IDs of attachments to delete
});
export type UpdateAttachmentDto = z.infer<typeof updateAttachmentDto>; 