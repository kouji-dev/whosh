import { PlatformCode } from '../../config/platforms';
import { PlatformHandler } from './PlatformHandler';
import { TikTokHandler } from './handlers/TikTokHandler';

export class PlatformHandlerFactory {
  private static handlers: Map<PlatformCode, PlatformHandler> = new Map();

  static getHandler(platform: PlatformCode): PlatformHandler {
    if (!this.handlers.has(platform)) {
      switch (platform) {
        case 'tiktok':
          this.handlers.set(platform, new TikTokHandler());
          break;
        // Add other platforms here as they are implemented
        default:
          throw new Error(`Platform handler for ${platform} is not implemented`);
      }
    }

    return this.handlers.get(platform)!;
  }
} 