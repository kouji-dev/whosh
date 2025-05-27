import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '../../infra/logger/pino-logger';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export interface File {
  id: string;
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  userId: string;
  postId?: string | null;
}

export interface SavedFile {
  id: string;
  path: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface IStorageService {
  saveFile(params: File): Promise<SavedFile>;
  getFile(filePath: string): Promise<Buffer>;
  deleteFile(filePath: string): Promise<void>;
  getFilePath(file: File): string;
}

export class LocalStorageService implements IStorageService {
  private static instance: LocalStorageService;

  private constructor() {}

  static getInstance(): LocalStorageService {
    if (!LocalStorageService.instance) {
      LocalStorageService.instance = new LocalStorageService();
    }
    return LocalStorageService.instance;
  }

  async saveFile(file: File): Promise<SavedFile> {
    const { id, buffer, originalname, mimetype, size, userId } = file;
    const userDir = path.join(UPLOADS_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });
    const filename = id;
    const filePath = this.getFilePath(file);
    await fs.writeFile(filePath, buffer);
    logger.info('File saved', { filePath, filename, userId });
    return {
      id,
      path: filePath,
      filename,
      mimetype,
      size,
    };
  }

  async getFile(filePath: string): Promise<Buffer> {
    return fs.readFile(filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(filePath);
  }

  getFilePath(file: File): string {
    const { id, userId } = file;
    const userDir = path.join(UPLOADS_DIR, userId);
    //add extension to id
    const filename = `${id}.${file.mimetype.split('/')[1]}`;
    return path.join(userDir, filename);
  }
}