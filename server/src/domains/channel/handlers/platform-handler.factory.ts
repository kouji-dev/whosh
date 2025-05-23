import { PlatformCode } from '../../../config/platforms';
import { BasePlatformHandler } from './platform-handler.base';
import { TikTokHandler } from './tiktok.handler';

export class PlatformHandlerFactory {
  private static instance: PlatformHandlerFactory;
  private handlers: Map<PlatformCode, BasePlatformHandler>;

  private constructor() {
    this.handlers = new Map();
    this.initializeHandlers();
  }

  static getInstance(): PlatformHandlerFactory {
    if (!PlatformHandlerFactory.instance) {
      PlatformHandlerFactory.instance = new PlatformHandlerFactory();
    }
    return PlatformHandlerFactory.instance;
  }

  private initializeHandlers() {
    this.handlers.set('tiktok', TikTokHandler.getInstance());
    // Add other platform handlers here
  }

  getHandler(platformCode: PlatformCode): BasePlatformHandler {
    const handler = this.handlers.get(platformCode);
    if (!handler) {
      throw new Error(`No handler found for platform: ${platformCode}`);
    }
    return handler;
  }
} 