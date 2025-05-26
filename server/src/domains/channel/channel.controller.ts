import { Request, Response } from 'express';
import { BaseController } from '../../lib/base.controller';
import { ChannelService, IChannelService } from './channel.service';
import { platforms, PlatformCode } from '../../config/platforms';
import config from '../../config';

export class ChannelController extends BaseController {
  private channelService: IChannelService;

  constructor() {
    super();
    this.channelService = ChannelService.getInstance();
  }

  async getChannels(req: Request, res: Response): Promise<void> {
    const channels = await this.channelService.getChannels(req.user!.id);
    this.ok(res, { channels });
  }

  async getChannel(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const channel = await this.channelService.getChannelById(id);
    
    if (!channel) {
      this.notFound(res, 'Channel not found');
      return;
    }

    this.ok(res, { channel });
  }

  async deleteChannel(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.channelService.deleteChannel(id);
    this.noContent(res);
  }

  async getChannelStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const status = await this.channelService.getChannelStatus(id);
    this.ok(res, status);
  }

  async syncChannelData(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await this.channelService.syncChannelData(id);
    this.noContent(res);
  }

  async connectChannel(req: Request, res: Response): Promise<void> {
    const { platform } = req.params;
    if (!Object.keys(platforms).includes(platform)) {
      this.clientError(res, 'Unsupported platform');
      return;
    }
    const redirectUri = `${config.server.apiUrl || config.server.clientUrl}/api/channels/${platform}/callback`;
    const url = await this.channelService.getAuthUrl(platform as PlatformCode, redirectUri, req.user!.id);
    this.ok(res, { url });
  }

  async handleCallback(req: Request, res: Response): Promise<void> {
    const { platform } = req.params;
    const { code, state } = req.query;
    if (!Object.keys(platforms).includes(platform)) {
      this.clientError(res, 'Unsupported platform');
      return;
    }
    const redirectUri = `${config.server.apiUrl || config.server.clientUrl}/api/channels/${platform}/callback`;
    const result = await this.channelService.handleCallback(
      platform as PlatformCode,
      code as string,
      redirectUri,
      state as string,
      req
    );
    res.redirect(result.redirectUrl);
  }
} 