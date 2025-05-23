import { PostRepository, IPostRepository } from './post.repository';
import { Post } from './post.types';
import { PostScheduleService, IPostScheduleService } from './post-schedule.service';

export interface IPostService {
  schedulePost(data: {
    content: string;
    mediaUrls: string[];
    scheduledFor: Date;
    socialAccountId: string;
    userId: string;
  }): Promise<Post>;
  cancelPost(postId: string): Promise<void>;
  getScheduledPosts(userId: string, status?: string): Promise<Post[]>;
}

export class PostService implements IPostService {
  private static instance: PostService;
  private repository: IPostRepository;
  private scheduleService: IPostScheduleService;

  private constructor() {
    this.repository = PostRepository.getInstance();
    this.scheduleService = PostScheduleService.getInstance();
  }

  public static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  async schedulePost(data: {
    content: string;
    mediaUrls: string[];
    scheduledFor: Date;
    socialAccountId: string;
    userId: string;
  }): Promise<Post> {
    return this.scheduleService.schedulePost(data);
  }

  async cancelPost(postId: string): Promise<void> {
    await this.scheduleService.cancelPost(postId);
  }

  async getScheduledPosts(userId: string, status?: string): Promise<Post[]> {
    return this.scheduleService.getScheduledPosts(userId, status);
  }
} 