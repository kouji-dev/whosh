import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { postController } from '../controllers/post.controller';

const router = express.Router();

// Schedule a new post
router.post('/schedule', authenticate, postController.schedulePost);

// Cancel a scheduled post
router.post('/:postId/cancel', authenticate, postController.cancelPost);

// Get scheduled posts
router.get('/scheduled', authenticate, postController.getScheduledPosts);

export default router; 