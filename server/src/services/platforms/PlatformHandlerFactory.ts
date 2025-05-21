import { PlatformHandler } from './PlatformHandler';
import { TikTokHandler } from './handlers/TikTokHandler';

export class PlatformHandlerFactory {
  private static handlers: Map<string, PlatformHandler> = new Map();

  static getHandler(platformCode: string): PlatformHandler {
    if (!this.handlers.has(platformCode)) {
      let handler: PlatformHandler;

      switch (platformCode) {
        case 'tiktok':
          handler = new TikTokHandler();
          break;
        // Add other platform handlers here
        default:
          throw new Error(`Unsupported platform: ${platformCode}`);
      }

      this.handlers.set(platformCode, handler);
    }

    return this.handlers.get(platformCode)!;
  }
} 