'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChannelSelector } from '@/components/calendar/ChannelSelector';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useSchedulePost } from '@/hooks/usePosts';

interface PostFormData {
  title: string;
  scheduledFor: Date;
  channels: string[];
}

interface PostFormProps {
  post: PostFormData;
  onPostChange: (post: PostFormData) => void;
  onSubmit: () => void;
  isEditing?: boolean;
}

export function PostForm({ post, onPostChange, onSubmit, isEditing = false }: PostFormProps) {
  const schedulePost = useSchedulePost();

  const handleSubmit = async () => {
    try {
      // Schedule post for each selected channel
      await Promise.all(
        post.channels.map((socialAccountId) =>
          schedulePost.mutateAsync({
            content: post.title,
            mediaUrls: [], // TODO: Add media upload support
            scheduledFor: post.scheduledFor.toISOString(),
            socialAccountId,
          })
        )
      );

      onSubmit();
      return true;
    } catch (error) {
      // Error handling is done in the mutation
      console.error('Failed to schedule posts:', error);
      return false;
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Post' : 'Schedule Post'}</DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="compose" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <textarea
                className="w-full rounded-md border p-2 text-sm"
                rows={4}
                value={post.title}
                onChange={(e) =>
                  onPostChange({
                    ...post,
                    title: e.target.value,
                  })
                }
                placeholder="What's on your mind?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Channels</label>
              <ChannelSelector
                selectedChannels={post.channels}
                onChannelsChange={(channels) =>
                  onPostChange({
                    ...post,
                    channels,
                  })
                }
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="schedule" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule</label>
              <div className="flex items-center space-x-2">
                <input
                  type="datetime-local"
                  className="rounded-md border px-2 py-1 text-sm"
                  value={format(post.scheduledFor, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    onPostChange({
                      ...post,
                      scheduledFor: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!post.title || post.channels.length === 0 || schedulePost.isPending}
            >
              {schedulePost.isPending ? 'Scheduling...' : isEditing ? 'Update Post' : 'Schedule Post'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
} 