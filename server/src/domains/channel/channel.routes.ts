import { Router } from 'express';
import { ChannelController } from './channel.controller';
import { authenticate } from '../../lib/middleware/auth.middleware';

const router = Router();
const controller = new ChannelController();

router.use(authenticate);

router.get('/', controller.getChannels.bind(controller));
router.get('/:id', controller.getChannel.bind(controller));
router.delete('/:id', controller.deleteChannel.bind(controller));
router.get('/:id/status', controller.getChannelStatus.bind(controller));
router.post('/:id/sync', controller.syncChannelData.bind(controller));

export default router; 