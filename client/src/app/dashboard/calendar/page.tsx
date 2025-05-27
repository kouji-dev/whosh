"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PostForm } from "@/components/calendar/PostForm";
import { BigCalendar, CalendarEvent } from "@/components/ui/calendar";
import { Views, View } from "react-big-calendar";
import { setSeconds } from "date-fns";
import { usePosts } from "@/hooks/usePosts";

export default function CalendarPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: setSeconds(new Date(), 0),
    end: setSeconds(new Date(), 0),
    resource: { channels: [] as string[] },
  });
  const [view, setView] = useState<View>(Views.WEEK);

  // Fetch posts from backend
  const { data: posts = [], isLoading } = usePosts();

  console.log(posts);
  // Map posts to CalendarEvent
  const events: CalendarEvent[] = posts.map(post => ({
    id: post.id,
    title: post.content,
    start: new Date(post.scheduledFor),
    end: new Date(post.scheduledFor), // Adjust if you have duration
    resource: { status: post.status, channelId: post.channelId },
  }));

  function handleScheduleEvent() {
    if (!newEvent.title || newEvent.resource.channels.length === 0) return;
    setNewEvent({ title: "", start: new Date(), end: new Date(), resource: { channels: [] } });
    setEditingEvent(null);
    setIsDialogOpen(false);
  }

  function handleSelectEvent(event: CalendarEvent) {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      start: event.start,
      end: event.end,
      resource: { channels: event.resource?.channels || [] },
    });
    setIsDialogOpen(true);
  }

  function handleSelectSlot(slotInfo: any) {
    setEditingEvent(null);
    setNewEvent({
      title: "",
      start: slotInfo.start,
      end: slotInfo.end,
      resource: { channels: [] },
    });
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
            post={{
              title: newEvent.title,
              scheduledFor: newEvent.start,
              channels: newEvent.resource.channels,
            }}
            onPostChange={(post) =>
              setNewEvent((prev) => ({
                ...prev,
                title: post.title,
                start: post.scheduledFor,
                end: post.scheduledFor,
                resource: { channels: post.channels },
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