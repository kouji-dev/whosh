import { Request, Response } from 'express';
import { BaseController } from '../../lib/base.controller';
import { PostService, IPostService } from './post.service';
import { cancelPostSchema, getPostsSchema } from './post.types';
import { createPostDto, updatePostDto } from './post.dtos';

export class PostController extends BaseController {
  private postService: IPostService;

  constructor() {
    super();
    this.postService = PostService.getInstance();
  }

  async schedulePost(req: Request, res: Response) {
    // If files are uploaded, inject them into the correct place
    let dtoInput = {
      postInfo: req.body.postInfo,
      attachments: req.body.attachments,
    };
    if (req.files && Array.isArray(req.files)) {
      dtoInput.attachments = req.files.map(file => ({ file }));
    }
    const parsed = createPostDto.parse(dtoInput);
    const post = await this.postService.schedulePost({
      ...parsed,
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

  async updatePost(req: Request, res: Response) {
    let dtoInput = {
      postInfo: req.body.postInfo,
      attachments: req.body.attachments,
    };
    if (req.files && Array.isArray(req.files)) {
      if (!dtoInput.attachments) dtoInput.attachments = {};
      dtoInput.attachments.newFiles = req.files;
    }
    const parsed = updatePostDto.parse(dtoInput);
    const post = await this.postService.updatePost({
      ...parsed,
      postId: req.params.postId,
      userId: req.user!.id,
    });
    this.ok(res, post);
  }
} 