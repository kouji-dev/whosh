import { Request, Response } from 'express';
import { BaseController } from '../../lib/base.controller';
import { PostService, IPostService } from './post.service';
import { cancelPostSchema, getPostsSchema } from './post.types';

export class PostController extends BaseController {
  private postService: IPostService;

  constructor() {
    super();
    this.postService = PostService.getInstance();
  }

  async schedulePost(req: Request, res: Response) {
    // If multipart/form-data, req.body fields are strings, req.files is array of files
    let data: any = { ...req.body };
    // Attachments from multer
    if (req.files && Array.isArray(req.files)) {
      data.attachments = req.files;
    }
    //data = createPostSchema.parse(data);
    const post = await this.postService.schedulePost({
      ...data,
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

  async validatePost(req: Request, res: Response) {
    const { content, media, channels } = req.body;
    const errors = await this.postService.validatePostForPlatforms({ content, media, channels });
    this.ok(res, { errors });
  }
} 