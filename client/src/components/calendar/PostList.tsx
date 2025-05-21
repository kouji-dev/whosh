'use client';

import { Calendar as CalendarIcon, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduledPost {
  id: string;
  content: string;
  scheduledFor: Date;
  channels: string[];
  status: 'scheduled' | 'published' | 'failed';
}

interface PostListProps {
  date: Date;
  posts: ScheduledPost[];
  onPostClick: (post: ScheduledPost) => void;
}

export function PostList({ date, posts, onPostClick }: PostListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts for {format(date, 'MMMM d, yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {posts.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No posts scheduled
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-accent',
                    post.status === 'published' && 'opacity-50'
                  )}
                  onClick={() => onPostClick(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm">{post.content}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{format(post.scheduledFor, 'h:mm a')}</span>
                          {post.status !== 'scheduled' && (
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5',
                                post.status === 'published'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              )}
                            >
                              {post.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {post.channels.map((channel) => (
                          <span
                            key={channel}
                            className="rounded-full bg-primary/10 px-2 py-1 text-xs"
                          >
                            {channel}
                          </span>
                        ))}
                        {post.status === 'scheduled' && (
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 