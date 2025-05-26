import { Router } from 'express';
import { sseHandler } from '../infra/sse/sse';

const router = Router();
router.get('/sse', sseHandler);
export default router; 