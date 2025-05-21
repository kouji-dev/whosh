import { Request, Response } from 'express';
import { PlatformService } from '../services/platform.service';
import { PlatformCode } from '../config/platforms';
import config from '../config';

interface Channel {
  id: string;
  platformId: string;
  platformUsername: string;
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
      const redirectUri = `${config.server.apiUrl}/api/channels/${platform}/callback`;
      const authUrl = PlatformService.getAuthUrl(platform, redirectUri);
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
      const { code } = req.query;
      const redirectUri = `${config.server.apiUrl}/api/channels/${platform}/callback`;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Invalid authorization code' });
      }

      const tokens = await PlatformService.handleCallback(platform, code, redirectUri);
      
      // Get user info from platform
      const userInfo = await PlatformService.getPlatformUserInfo(platform, tokens.accessToken);
      
      // For Facebook, we need to handle pages
      if (platform === 'facebook') {
        // First save the parent connection (user account)
        const parentConnection = await PlatformService.saveConnectedChannel(
          req.user!.id,
          platform,
          tokens,
          userInfo.id,
          userInfo.username
        );

        // Get available pages
        const pages = await PlatformService.getFacebookPages(tokens.accessToken);

        // Save pages as channels
        await PlatformService.saveFacebookPages(req.user!.id, parentConnection.id, pages);

        // Redirect to frontend with success and pages info
        res.redirect(
          `${config.server.clientUrl}/settings/channels?success=true&platform=facebook&pages=${pages.length}`
        );
      } else {
        // For other platforms, just save the single connection
        await PlatformService.saveConnectedChannel(
          req.user!.id,
          platform,
          tokens,
          userInfo.id,
          userInfo.username
        );

        // Redirect to frontend with success
        res.redirect(`${config.server.clientUrl}/settings/channels?success=true`);
      }
    } catch (error) {
      console.error('Channel callback error:', error);
      res.redirect(`${config.server.clientUrl}/settings/channels?error=connection_failed`);
    }
  }

  // Get user's connected channels
  static async getConnectedChannels(req: Request, res: Response) {
    try {
      const channels = await PlatformService.getConnectedChannels(req.user!.id);
      // Ensure the response is serializable
      res.json(channels.map((channel: Channel) => ({
        id: channel.id,
        platformId: channel.platformId,
        platformUsername: channel.platformUsername,
        platform: {
          name: channel.platform.name,
          icon: channel.platform.icon,
          code: channel.platform.code
        },
        isParentConnection: channel.isParentConnection
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