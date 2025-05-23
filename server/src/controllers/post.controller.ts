import { Request, Response } from 'express';
import { SchedulerService } from '../services/scheduler.service';

const schedulerService = SchedulerService.getInstance();

export const postController = {
  schedulePost: async (req: Request, res: Response) => {
    try {
      const { content, mediaUrls, scheduledFor, socialAccountId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const post = await schedulerService.schedulePost({
        content,
        mediaUrls,
        scheduledFor: new Date(scheduledFor),
        socialAccountId,
        userId
      });

      res.json(post);
    } catch (error) {
      console.error('Failed to schedule post:', error);
      res.status(500).json({ error: 'Failed to schedule post' });
    }
  },

  cancelPost: async (req: Request, res: Response) => {
    try {
      const { postId } = req.params;
      await schedulerService.cancelPost(postId);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to cancel post:', error);
      res.status(500).json({ error: 'Failed to cancel post' });
    }
  },

  getScheduledPosts: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { status } = req.query;
      const posts = await schedulerService.getScheduledPosts(userId, status as string);
      res.json(posts);
    } catch (error) {
      console.error('Failed to get scheduled posts:', error);
      res.status(500).json({ error: 'Failed to get scheduled posts' });
    }
  }
}; 