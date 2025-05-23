import { Router } from 'express';
import { PlatformController } from './platform.controller';

const router = Router();
const controller = new PlatformController();

router.get('/', controller.getPlatforms.bind(controller));

export default router; 