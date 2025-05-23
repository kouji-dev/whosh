import { Request, Response } from 'express';
import { BaseController } from '../../lib/base.controller';
import { ChannelService, IChannelService } from './channel.service';

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
} 