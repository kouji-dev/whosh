import { Request, Response } from 'express';
import { PlatformService } from '../services/platform.service';
import { PlatformCode } from '../config/platforms';

interface ConnectedAccount {
  id: string;
  platformId: string;
  platformUsername: string;
  platform: {
    name: string;
    icon: string;
  };
}

export class PlatformController {
  // Get list of available platforms
  static async getPlatforms(req: Request, res: Response) {
    try {
      const platforms = await PlatformService.getAvailablePlatforms();
      // Ensure the response is serializable
      res.json(platforms.map(platform => ({
        name: platform.name,
        code: platform.code,
        icon: platform.icon,
        isConnected: platform.isConnected,
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch platforms' });
    }
  }

  // Get OAuth URL for platform connection
  static async getAuthUrl(req: Request, res: Response) {
    try {
      const { platform } = req.params as { platform: PlatformCode };
      const redirectUri = `${process.env.API_URL}/api/platforms/${platform}/callback`;
      const authUrl = PlatformService.getAuthUrl(platform, redirectUri);
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
      const redirectUri = `${process.env.API_URL}/api/platforms/${platform}/callback`;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Invalid authorization code' });
      }

      const tokens = await PlatformService.handleCallback(platform, code, redirectUri);
      
      // Get user info from platform
      const userInfo = await PlatformService.getPlatformUserInfo(platform, tokens.accessToken);
      
      // Save connected account
      const channel = await PlatformService.saveConnectedAccount(
        req.user!.id,
        platform,
        tokens,
        userInfo.id,
        userInfo.username
      );

      // Redirect to frontend with success
      res.redirect(`${process.env.CLIENT_URL}/settings/connections?success=true`);
    } catch (error) {
      console.error('Platform callback error:', error);
      res.redirect(`${process.env.CLIENT_URL}/settings/connections?error=connection_failed`);
    }
  }

  // Get user's connected accounts
  static async getConnectedAccounts(req: Request, res: Response) {
    try {
      const accounts = await PlatformService.getConnectedAccounts(req.user!.id);
      // Ensure the response is serializable
      res.json(accounts.map((account: ConnectedAccount) => ({
        id: account.id,
        platformId: account.platformId,
        platformUsername: account.platformUsername,
        platform: {
          name: account.platform.name,
          icon: account.platform.icon,
        },
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch connected accounts' });
    }
  }

  // Disconnect platform account
  static async disconnectAccount(req: Request, res: Response) {
    try {
      const { channelId } = req.params;
      await PlatformService.disconnectAccount(channelId, req.user!.id);
      res.json({ message: 'Account disconnected successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to disconnect account' });
    }
  }
} 