import { Router } from 'express';
import { PostController } from './post.controller';
import { authenticate } from '../../lib/middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const postController = new PostController();
const upload = multer();

// Schedule a new post
router.post('/', authenticate, upload.any(), postController.schedulePost.bind(postController));

// Update a post
router.put('/:postId', authenticate, postController.updatePost.bind(postController));

// Cancel a post
router.delete('/:postId', authenticate, postController.cancelPost.bind(postController));

// Get scheduled posts
router.get('/', authenticate, postController.getScheduledPosts.bind(postController));

// Validate a post for platforms
router.post('/validate', authenticate, postController.validatePost.bind(postController));

export default router; 