import { Router } from 'express';
import { PostController } from './post.controller';
import { authenticate } from '../../lib/middleware/auth.middleware';

const router = Router();
const postController = new PostController();

// Schedule a new post
router.post('/', authenticate, postController.schedulePost.bind(postController));

// Cancel a scheduled post
router.delete('/:postId', authenticate, postController.cancelPost.bind(postController));

// Get scheduled posts
router.get('/', authenticate, postController.getScheduledPosts.bind(postController));

export default router; 