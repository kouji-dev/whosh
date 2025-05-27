import { AttachmentRepository } from './attachment.repository';
import { LocalStorageService, IStorageService, File } from '../../infra/storage/storage.service';
import { Attachment } from './attachment.model';

export interface IAttachmentService {
  saveBulk(files: File[], userId: string, postId: string | null, callback: () => Promise<any>): Promise<Attachment[]>;
  update(id: string, data: Partial<Attachment>): Promise<Attachment>;
  delete(id: string): Promise<void>;
  findByPostId(postId: string): Promise<Attachment[]>;
  findByUserId(userId: string): Promise<Attachment[]>;
  findByIds(ids: string[]): Promise<Attachment[]>;
  bulkDelete(
    attachments: Attachment[],
    callback: (attachment: Attachment) => Promise<void>
  ): Promise<void>;
}

export class AttachmentService implements IAttachmentService {
  private static instance: AttachmentService;
  private repository = AttachmentRepository.getInstance();
  private storage: IStorageService;

  private constructor() {
    this.storage = LocalStorageService.getInstance();
  }

  static getInstance(): AttachmentService {
    if (!AttachmentService.instance) {
      AttachmentService.instance = new AttachmentService();
    }
    return AttachmentService.instance;
  }

  async saveBulk(files: File[], userId: string, postId: string | null): Promise<Attachment[]> {
    // Use provided callback or default to storage.saveFile
    const saveFiles = async () => {
      await Promise.all(files.map(file => this.storage.saveFile(file)));
    };
    const attachments: any[] = files.map(file => ({
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: this.storage.getFilePath(file),
      userId,
      postId,
      createdAt: new Date()
    }));  
    return this.repository.bulkInsert(attachments, saveFiles);
  }

  async update(id: string, data: Partial<Attachment>): Promise<Attachment> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<void> {
    // Optionally, delete the file from storage here
    await this.repository.delete(id);
  }

  async findByPostId(postId: string): Promise<Attachment[]> {
    return this.repository.findByPostId(postId);
  }

  async findByUserId(userId: string): Promise<Attachment[]> {
    return this.repository.findByUserId(userId);
  }

  async findByIds(ids: string[]): Promise<Attachment[]> {
    return this.repository.findByIds(ids);
  }

  async bulkDelete(
    attachments: Attachment[]
  ): Promise<void> {
    if (!attachments.length) return;
    const ids = attachments.map(att => att.id);
    const deleteFiles = async () => {
      await Promise.all(attachments.map(att => this.storage.deleteFile(att.path)));
    };
    await this.repository.bulkDelete(ids, deleteFiles);
  }
}