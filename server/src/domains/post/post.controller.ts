import { Request, Response } from 'express';
import { BaseController } from '../../lib/base.controller';
import { PostService, IPostService } from './post.service';
import { createPostSchema, cancelPostSchema, getPostsSchema } from './post.types';

export class PostController extends BaseController {
  private postService: IPostService;

  constructor() {
    super();
    this.postService = PostService.getInstance();
  }

  async schedulePost(req: Request, res: Response) {
    const data = createPostSchema.parse(req.body);
    const post = await this.postService.schedulePost({
      ...data,
      mediaUrls: data.mediaUrls || [],
      scheduledFor: new Date(data.scheduledFor),
      userId: req.user!.id,
    });
    this.created(res, post);
  }

  async cancelPost(req: Request, res: Response) {
    const { postId } = cancelPostSchema.parse(req.params);
    await this.postService.cancelPost(postId);
    this.noContent(res);
  }

  async getScheduledPosts(req: Request, res: Response) {
    const { status } = getPostsSchema.parse(req.query);
    const posts = await this.postService.getScheduledPosts(req.user!.id, status);
    this.ok(res, { posts });
  }
} 