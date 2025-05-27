"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PostForm } from "@/components/calendar/PostForm";
import { BigCalendar, CalendarEvent } from "@/components/ui/calendar";
import { Views, View } from "react-big-calendar";
import { addHours, setSeconds } from "date-fns";
import { usePosts } from "@/hooks/usePosts";
import type { Post } from '@/services/posts';

// CalendarPost: like Post, but with channels: string[] and scheduledFor: Date
interface CalendarPost extends Omit<Post, 'channelId' | 'scheduledFor'> {
  channels: string[];
  scheduledFor: Date;
}

export default function CalendarPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [currentPost, setCurrentPost] = useState<Partial<CalendarPost>>({
    content: '',
    scheduledFor: new Date(),
    channels: [],
  });
  const [view, setView] = useState<View>(Views.WEEK);

  // Fetch posts from backend
  const { data: posts = [], isLoading } = usePosts();
  // Map posts to CalendarEvent
  const events: CalendarEvent[] = posts.map(post => ({
    id: post.id,
    title: post.content,
    start: new Date(post.scheduledFor),
    end: addHours(new Date(post.scheduledFor), 1),
    resource: { ...post, channels: [post.channelId], scheduledFor: new Date(post.scheduledFor) },
  }));

  function handleScheduleEvent() {
    if (!currentPost.content || !currentPost.channels || currentPost.channels.length === 0) return;
    setCurrentPost({ content: '', scheduledFor: new Date(), channels: [] });
    setEditingEvent(null);
    setIsDialogOpen(false);
  }

  function handleSelectEvent(event: CalendarEvent) {
    console.log('Event clicked:', event);
    setEditingEvent(event);
    setCurrentPost({ ...event.resource });
    setIsDialogOpen(true);
  }

  function handleSelectSlot(slotInfo: any) {
    console.log('Event select:', slotInfo);
    setEditingEvent(null);
    setCurrentPost({ content: '', scheduledFor: slotInfo.start, channels: [] });
    setIsDialogOpen(true);
  }

  return (
    <div className="flex h-full flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Content Calendar</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Post
            </Button>
          </DialogTrigger>
          <PostForm
            post={currentPost as any}
            onPostChange={(post) =>
              setCurrentPost((prev) => ({
                ...prev,
                ...post,
                scheduledFor: post.scheduledFor instanceof Date ? post.scheduledFor : new Date(post.scheduledFor),
              }))
            }
            onSubmit={handleScheduleEvent}
            isEditing={!!editingEvent}
          />
        </Dialog>
      </div>
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
        ) : (
          <BigCalendar
            events={events}
            defaultView={Views.WEEK}
            view={view}
            onViewChange={setView}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
          />
        )}
      </div>
    </div>
  );
} 