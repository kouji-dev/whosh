import { Request, Response } from 'express';
import { BaseController } from '../../lib/base.controller';
import { PlatformService } from './platform.service';

export class PlatformController extends BaseController {
  private platformService: PlatformService;

  constructor() {
    super();
    this.platformService = PlatformService.getInstance();
  }

  async getPlatforms(req: Request, res: Response): Promise<void> {
    const platforms = await this.platformService.getPlatforms();
    this.ok(res, platforms);
  }
} 