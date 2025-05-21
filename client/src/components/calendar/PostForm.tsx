'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChannelSelector } from '@/components/calendar/ChannelSelector';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Post' : 'Schedule New Post'}</DialogTitle>
      </DialogHeader>
      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="compose" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="What would you like to share?"
                value={post.title}
                onChange={(e) =>
                  onPostChange({ ...post, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Channels</label>
              <ChannelSelector
                selectedChannels={post.channels}
                onChannelSelect={(channelId) =>
                  onPostChange({
                    ...post,
                    channels: post.channels.includes(channelId)
                      ? post.channels.filter((id) => id !== channelId)
                      : [...post.channels, channelId],
                  })
                }
              />
            </div>
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
              onClick={onSubmit}
              disabled={!post.title || post.channels.length === 0}
            >
              {isEditing ? 'Update Post' : 'Schedule Post'}
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="whitespace-pre-wrap font-semibold">{post.title}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {format(post.scheduledFor, 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {post.channels.map((channelId) => (
                    <span
                      key={channelId}
                      className="rounded-full bg-primary/10 px-2 py-1 text-xs"
                    >
                      {channelId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
} 