import { Router } from 'express';
import { PlatformController } from '../controllers/platform.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Legacy routes (for backward compatibility)
router.get('/', authenticate, PlatformController.getChannels);
router.get('/accounts', authenticate, PlatformController.getConnectedChannels);
router.delete('/accounts/:channelId', authenticate, PlatformController.disconnectChannel);

// New channel-centric routes
router.get('/channels', authenticate, PlatformController.getChannels);
router.get('/channels/:platform/auth', authenticate, PlatformController.getAuthUrl);
router.get('/channels/:platform/callback', PlatformController.handleCallback);
router.get('/channels/connected', authenticate, PlatformController.getConnectedChannels);
router.get('/channels/:channelId/status', authenticate, PlatformController.getChannelStatus);
router.delete('/channels/:channelId', authenticate, PlatformController.disconnectChannel);
router.post('/channels/:channelId/sync', authenticate, PlatformController.syncChannelData);

export default router; 