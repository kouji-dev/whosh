import { Router } from 'express';
import { sseHandler } from './sse';

const router = Router();
router.get('/sse', sseHandler);
export default router; 