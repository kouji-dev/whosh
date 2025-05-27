"use client"

import {
  Calendar as RBCalendar,
  dateFnsLocalizer,
  Views,
  type Event,
  View,
} from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format as formatDate, Locale } from "date-fns"
import React from "react";
import { platforms } from '@/config/platforms';
import { useChannels } from '@/hooks/useChannels';
import { PlatformIcon } from '@/components/ui/platform-icon';

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export interface CalendarEvent extends Event {
  id: string
  title: string
  start: Date
  end: Date
  resource?: any
}

interface BigCalendarProps {
  events: CalendarEvent[]
  defaultView?: string
  onSelectEvent?: (event: CalendarEvent) => void
  onSelectSlot?: (slotInfo: any) => void
  view?: View
  onViewChange?: (view: View) => void
}

function CustomToolbar({ onNavigate, view, onViewChange }: any) {
  return (
    <div className="flex items-center justify-end px-4 py-2 border-b bg-background gap-2">
      <Tabs value={view} onValueChange={onViewChange}>
        <TabsList className="bg-muted">
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="agenda">List</TabsTrigger>
        </TabsList>
      </Tabs>
      <Button size="sm" variant="outline" onClick={() => onNavigate('TODAY')}>
        Today
      </Button>
      <Button size="icon" variant="ghost" onClick={() => onNavigate('PREV')}>
        <span className="sr-only">Back</span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </Button>
      <Button size="icon" variant="ghost" onClick={() => onNavigate('NEXT')}>
        <span className="sr-only">Next</span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </Button>
    </div>
  )
}

function CustomWeekHeader({ date }: { date: Date }) {
  return (
    <div className="flex flex-col items-center py-2 bg-background">
      <span className="text-sm font-semibold text-foreground">{formatDate(date, 'EEEE')}</span>
      <span className="text-xs text-muted-foreground mt-1">{date.getDate()}</span>
    </div>
  );
}

// Custom wrapper for month view cells
function DisabledDateCellWrapper(props: { children?: React.ReactNode; value?: Date }) {
  const { children, value } = props;
  const now = new Date();
  const isPast = value && value < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return (
    <div style={isPast ? { opacity: 0.4, pointerEvents: 'none', background: '#f3f4f6' } : {}}>
      {children}
    </div>
  );
}

// Custom wrapper for week/day time slots
function DisabledTimeSlotWrapper(props: { children?: React.ReactNode; value?: Date }) {
  const { children, value } = props;
  const now = new Date();
  const isPast = value && value < now;
  return (
    <div style={isPast ? { opacity: 0.4, pointerEvents: 'none', background: '#f3f4f6' } : {}}>
      {children}
    </div>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  // event.resource.channelId is the channelId
  // useChannels provides all channels, which have platformId
  const { data: channels } = useChannels();
  const channel = channels?.find((c: any) => c.id === event.resource?.channelId);
  const platformId = channel?.platformId;
  const platform = platformId ? platforms[platformId as keyof typeof platforms] : undefined;

  return (
    <div className="w-full h-full rounded-lg bg-white border border-muted px-2 py-2 flex flex-col justify-between gap-1 shadow-sm">
      <div className="font-semibold text-base truncate text-foreground">{event.title}</div>
      <div className="flex items-center gap-2 mt-1">
        {platform && platformId && (
          <span
            className="inline-flex items-center gap-1 text-xs font-medium bg-muted text-foreground rounded p-1 h-5 w-5"
          >
            <PlatformIcon platform={platformId as any} size={18} />
          </span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {event.start &&
            event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

export function BigCalendar({
  events,
  defaultView = Views.WEEK,
  onSelectEvent,
  onSelectSlot,
  view,
  onViewChange,
}: BigCalendarProps) {
  // Helper to prevent selecting past slots
  function handleSelecting(slotInfo: any) {
    const now = new Date();
    // slotInfo.start and slotInfo.end are Date objects
    // Only allow selection if the slot is not in the past
    return slotInfo.start >= now;
  }

  return (
    <div className="w-full h-[70vh] bg-background rounded-lg border">
      {view === Views.WEEK && (
        <style>{`
          .rbc-timeslot-group {
            min-height: 84px !important;
          }
          .rbc-header {
            border: none !important;
            background: transparent !important;
          }
          .rbc-time-view .rbc-row {
            min-height: 50px !important;
          }
          .rbc-event, .rbc-event-content {
            padding: 0 !important;
            background: none !important;
            border: none !important;
            min-width: 0 !important;
            width: 100% !important;
            overflow: visible !important;
          }
          .rbc-event-label {
            display: none !important;
          }
        `}</style>
      )}
      <RBCalendar
        localizer={localizer}
        events={events}
        defaultView={defaultView as any}
        view={view}
        onView={onViewChange}
        views={{ month: true, week: true, day: true, agenda: true }}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        onSelecting={handleSelecting}
        style={{ height: "100%", width: "100%" }}
        className={cn(
          "!bg-background !text-foreground [&_.rbc-event]:!bg-primary/10 [&_.rbc-event]:!text-primary [&_.rbc-event]:rounded-md [&_.rbc-event]:border [&_.rbc-event]:border-primary/20 [&_.rbc-event]:rounded-md [&_.rbc-toolbar]:!p-0 [&_.rbc-toolbar]:!bg-background"
        )}
        popup
        components={{
          event: ({ event }: { event: CalendarEvent }) => (
            <EventCard event={event} />
          ),
          toolbar: (props: any) => (
            <CustomToolbar
              {...props}
              view={view}
              onViewChange={onViewChange}
            />
          ),
          header: (props: any) =>
            view === Views.WEEK ? (
              <CustomWeekHeader date={props.date} />
            ) : (
              <span className="text-sm font-semibold text-foreground">{props.label}</span>
            ),
          dateCellWrapper: DisabledDateCellWrapper,
          timeSlotWrapper: DisabledTimeSlotWrapper,
        }}
        toolbar
      />
    </div>
  )
} 