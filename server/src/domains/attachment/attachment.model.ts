import { attachments } from '../../db/schema';
import { InferSelectModel } from 'drizzle-orm';

export type Attachment = InferSelectModel<typeof attachments>; 