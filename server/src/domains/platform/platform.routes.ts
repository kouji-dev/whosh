import { Router } from 'express';
import { PlatformController } from './platform.controller';
import { authenticate } from '../../lib/middleware/auth.middleware';

const router = Router();
const controller = new PlatformController();

router.use(authenticate);

router.get('/', controller.getPlatforms.bind(controller));

export default router; 