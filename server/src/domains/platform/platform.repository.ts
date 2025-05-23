import { dbClient } from '../../lib/db';
import { platforms } from '../../db/schema';
import { Platform } from './platform.types';

export interface IPlatformRepository {
  findAll(): Promise<Platform[]>;
}

export class PlatformRepository implements IPlatformRepository {
  private static instance: PlatformRepository;

  private constructor() {}

  static getInstance(): PlatformRepository {
    if (!PlatformRepository.instance) {
      PlatformRepository.instance = new PlatformRepository();
    }
    return PlatformRepository.instance;
  }

  async findAll(): Promise<Platform[]> {
    const results = await dbClient.query.platforms.findMany();
    return results.map(this.mapToPlatform);
  }

  private mapToPlatform(data: typeof platforms.$inferSelect): Platform {
    return {
      ...data,
    };
  }
} 