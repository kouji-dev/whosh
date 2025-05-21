"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { PostForm } from "@/components/calendar/PostForm";
import { BigCalendar, CalendarEvent } from "@/components/ui/calendar";
import { Views, View } from "react-big-calendar";

export default function CalendarPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    resource: { channels: [] as string[] },
  });
  const [view, setView] = useState<View>(Views.WEEK);

  function handleScheduleEvent() {
    if (!newEvent.title || newEvent.resource.channels.length === 0) return;
    if (editingEvent) {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id
            ? {
                ...event,
                title: newEvent.title,
                start: newEvent.start,
                end: newEvent.end,
                resource: { channels: newEvent.resource.channels },
              }
            : event
        )
      );
    } else {
      setEvents((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          title: newEvent.title,
          start: newEvent.start,
          end: newEvent.end,
          resource: { channels: newEvent.resource.channels },
        },
      ]);
    }
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
        <BigCalendar
          events={events}
          defaultView={Views.WEEK}
          view={view}
          onViewChange={setView}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
        />
      </div>
    </div>
  );
} 