import { PlatformRepository, IPlatformRepository } from './platform.repository';
import { Platform } from './platform.types';

export interface IPlatformService {
  getPlatforms(): Promise<Platform[]>;
}

export class PlatformService implements IPlatformService {
  private static instance: PlatformService;
  private platformRepository: IPlatformRepository;

  private constructor() {
    this.platformRepository = PlatformRepository.getInstance();
  }

  static getInstance(): PlatformService {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  async getPlatforms(): Promise<Platform[]> {
    return this.platformRepository.findAll();
  }
} 