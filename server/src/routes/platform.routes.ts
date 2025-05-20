import { Router } from 'express';
import { PlatformController } from '../controllers/platform.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get available platforms
router.get('/', authenticate, PlatformController.getPlatforms);

// Get OAuth URL for platform connection
router.get('/:platform/auth', authenticate, PlatformController.getAuthUrl);

// Handle OAuth callback
router.get('/:platform/callback', PlatformController.handleCallback);

// Get user's connected accounts
router.get('/accounts', authenticate, PlatformController.getConnectedAccounts);

// Disconnect platform account
router.delete('/accounts/:channelId', authenticate, PlatformController.disconnectAccount);

export default router; 