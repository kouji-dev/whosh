import { Request, Response } from 'express';
import { PlatformService } from '../services/platform.service';
import { PlatformCode } from '../config/platforms';
import config from '../config';

interface Channel {
  id: string;
  platformId: string;
  accountName: string | null;
  platform: {
    name: string;
    icon: string;
    code: string;
  };
  isParentConnection?: boolean;
}

export class PlatformController {
  // Get list of available platform types and user's connected channels
  static async getChannels(req: Request, res: Response) {
    try {
      const { platformTypes, channels } = await PlatformService.getAvailableChannels(req.user!.id);
      res.json({ platformTypes, channels });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch channels' });
    }
  }

  // Get OAuth URL for channel connection
  static async getAuthUrl(req: Request, res: Response) {
    try {
      const { platform } = req.params as { platform: PlatformCode };
      const redirectUri = `${config.server.apiUrl}/api/platforms/channels/${platform}/callback`;
      const authUrl = PlatformService.getAuthUrl(platform, redirectUri, req.user!.id);
      console.log('authUrl', {authUrl});
      res.json({ authUrl });
    } catch (error) {
      res.status(400).json({ error: 'Invalid platform' });
    }
  }

  // Handle OAuth callback
  static async handleCallback(req: Request, res: Response) {
    try {
      const { platform } = req.params as { platform: PlatformCode };
      const { code, state } = req.query;
      const redirectUri = `${config.server.apiUrl}/api/platforms/channels/${platform}/callback`;

      if (!code || typeof code !== 'string') {
        return res.redirect(`${config.server.clientUrl}/dashboard/channels?error=invalid_code`);
      }

      // Decode the state to get the userId
      let userId: string | undefined;
      if (state && typeof state === 'string') {
        try {
          const stateObj = JSON.parse(Buffer.from(state, 'base64url').toString());
          userId = stateObj.userId;
        } catch (error) {
          console.error('Failed to decode state:', error);
        }
      }

      if (!userId) {
        return res.redirect(`${config.server.clientUrl}/dashboard/channels?error=invalid_state`);
      }

      const result = await PlatformService.handleCallback(
        platform,
        code,
        redirectUri,
        state as string,
        userId,
        config.server.clientUrl
      );

      if ('redirectUrl' in result) {
        res.redirect(result.redirectUrl);
      } else {
        res.redirect(`${config.server.clientUrl}/dashboard/channels?error=redirect_failed`);
      }
    } catch (error) {
      console.error('Callback error:', error);
      res.redirect(`${config.server.clientUrl}/dashboard/channels?error=callback_failed`);
    }
  }

  // Get user's connected channels
  static async getConnectedChannels(req: Request, res: Response) {
    try {
      const channels = await PlatformService.getConnectedChannels(req.user!.id);
      // Ensure the response is serializable
      res.json(channels.map(channel => ({
        id: channel.id,
        platformId: channel.platformId,
        accountName: channel.accountName,
        accountId: channel.accountId,
        platform: {
          name: channel.platform.name,
          icon: channel.platform.icon,
          code: channel.platform.code,
          color: channel.platform.color
        },
        lastSync: channel.lastSync,
        isValid: channel.isValid,
        isParentConnection: !(channel as any).parentConnectionId,
        avatarUrl: channel.profileImage || null
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch connected channels' });
    }
  }

  // Disconnect channel
  static async disconnectChannel(req: Request, res: Response) {
    try {
      const { channelId } = req.params;
      await PlatformService.disconnectChannel(channelId, req.user!.id);
      res.json({ message: 'Channel disconnected successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to disconnect channel' });
    }
  }

  // Get channel status
  static async getChannelStatus(req: Request, res: Response) {
    try {
      const { channelId } = req.params;
      const status = await PlatformService.getChannelStatus(req.user!.id, channelId);
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get channel status' });
    }
  }

  // Sync channel data
  static async syncChannelData(req: Request, res: Response) {
    try {
      const { channelId } = req.params;
      await PlatformService.syncChannelData(req.user!.id, channelId);
      res.json({ message: 'Channel data synced successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to sync channel data' });
    }
  }
} 