import { dbClient } from '../../lib/db';
import { attachments } from '../../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { Attachment } from './attachment.model';

export interface IAttachmentRepository {
  create(data: Omit<Attachment, 'id' | 'createdAt'>): Promise<Attachment>;
  update(id: string, data: Partial<Attachment>): Promise<Attachment>;
  delete(id: string): Promise<void>;
  findByPostId(postId: string): Promise<Attachment[]>;
  findByUserId(userId: string): Promise<Attachment[]>;
  findByIds(ids: string[]): Promise<Attachment[]>;
  bulkInsert(
    attachments: any[],
    callback: () => Promise<void>
  ): Promise<Attachment[]>;
  bulkDelete(
    ids: string[],
    callback: () => Promise<void>
  ): Promise<void>;
}

export class AttachmentRepository implements IAttachmentRepository {
  private static instance: AttachmentRepository;

  private constructor() {}

  static getInstance(): AttachmentRepository {
    if (!AttachmentRepository.instance) {
      AttachmentRepository.instance = new AttachmentRepository();
    }
    return AttachmentRepository.instance;
  }

  async create(data: Omit<Attachment, 'id' | 'createdAt'>): Promise<Attachment> {
    const [result] = await dbClient.insert(attachments)
      .values({ ...data, createdAt: new Date() })
      .returning();
    return result;
  }

  async update(id: string, data: Partial<Attachment>): Promise<Attachment> {
    const [result] = await dbClient.update(attachments)
      .set({ ...data })
      .where(eq(attachments.id, id))
      .returning();
    return result;
  }

  async delete(id: string): Promise<void> {
    await dbClient.delete(attachments).where(eq(attachments.id, id));
  }

  async findByPostId(postId: string): Promise<Attachment[]> {
    return dbClient.query.attachments.findMany({ where: eq(attachments.postId, postId) });
  }

  async findByUserId(userId: string): Promise<Attachment[]> {
    return dbClient.query.attachments.findMany({ where: eq(attachments.userId, userId) });
  }

  async findByIds(ids: string[]): Promise<Attachment[]> {
    if (ids.length === 0) return [];
    return dbClient.query.attachments.findMany({ where: inArray(attachments.id, ids) });
  }

  async bulkInsert(
    data: Attachment[],
    callback: () => Promise<void>
  ): Promise<Attachment[]> {
    if (!data.length) return [];
    return await dbClient.transaction(async (tx) => {
      // Insert all records in a transaction
      await tx.insert(attachments).values(data).execute();
      callback();
      return data;
    });
  }

  async bulkDelete(
    ids: string[],
    callback: () => Promise<void>
  ): Promise<void> {
    if (!ids.length) return;
    await dbClient.transaction(async (tx) => {
      // Delete all records in a transaction
      await tx.delete(attachments).where(inArray(attachments.id, ids));
      // Call the callback for each attachment (side effect, e.g., delete file)
      await callback();
    });
  }
} 