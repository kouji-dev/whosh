import { PlatformRepository, IPlatformRepository } from './platform.repository';
import { Platform } from './platform.types';
import { platforms } from '../../config/platforms';

export interface IPlatformService {
  getPlatforms(): Promise<Platform[]>;
  getCapabilities(): Promise<any[]>;
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

  async getCapabilities(): Promise<any[]> {
    return Object.entries(platforms).map(([code, platform]) => ({
      code,
      ...platform.capabilities,
    }));
  }
} 