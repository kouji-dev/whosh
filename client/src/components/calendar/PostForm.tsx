'use client';

import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChannelSelector } from '@/components/calendar/ChannelSelector';
import { format, isBefore, startOfDay, isToday, setHours, setMinutes } from 'date-fns';
import { useState } from 'react';
import { useSchedulePost, useValidatePost } from '@/hooks/usePosts';
import { DatePicker } from '@/components/ui/date-picker';
import { useChannels } from '@/hooks/useChannels';
import { usePlatformCapabilities } from '@/hooks/usePlatforms';
import { Channel } from '@/services/channels';
import { Image, Video } from 'lucide-react';
import { FileUploadPicker } from '@/components/ui/FileUploadPicker';
import { useForm, Controller } from 'react-hook-form';

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
  const { mutateAsync: validatePost, isPending: isValidating } = useValidatePost();
  const { mutateAsync: schedulePost, isPending: isScheduling } = useSchedulePost();
  const now = new Date();
  const { data: channels, isLoading: isLoadingChannels } = useChannels();
  const { capabilities, isLoadingCapabilities } = usePlatformCapabilities();

  const { register, handleSubmit, setError, control, formState: { errors, isSubmitting }, setValue, watch } = useForm({
    defaultValues: {
      title: post.title,
      channels: post.channels,
      attachments: [],
      scheduledFor: post.scheduledFor,
    },
  });

  // Use scheduledFor from useForm state
  const scheduledFor = watch('scheduledFor');

  if (isLoadingChannels || isLoadingCapabilities) {
    return (
      <DialogContent>
        <div className="flex items-center justify-center h-40 text-muted-foreground">Loading...</div>
      </DialogContent>
    );
  }

  // Map selected channel IDs to their platform codes
  const selectedPlatforms = (channels || [])
    .filter((c: Channel) => post.channels.includes(c.id))
    .map((c: Channel) => c.platformId);

  console.log(post.channels, channels, capabilities);

  // Get allowed media and min text length for selected platforms
  function getPostConstraints() {
    if (!capabilities || selectedPlatforms.length === 0) {
      return { allowedMedia: ['text'], maxTextLength: 10000 };
    }
    const selectedCaps = capabilities.filter((cap: any) => selectedPlatforms.includes(cap.code));
    const allowedMedia = Array.from(new Set(selectedCaps.flatMap((c: any) => c.allowedMedia)));
    const maxTextLength = Math.min(...selectedCaps.map((c: any) => c.maxTextLength));
    return { allowedMedia, maxTextLength };
  }

  const { allowedMedia, maxTextLength } = getPostConstraints();

  // Helper to update scheduledFor
  function updateSchedule(date: Date | undefined) {
    if (!date) return;
    // Keep the time from the previous scheduledFor
    const prev = scheduledFor;
    date.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
    setValue('scheduledFor', date, { shouldValidate: true });
    onPostChange({ ...post, scheduledFor: date });
  }

  // New: update only hour
  function onHourChange(hour: number) {
    const updated = setHours(scheduledFor, hour);
    setValue('scheduledFor', updated, { shouldValidate: true });
    onPostChange({ ...post, scheduledFor: updated });
  }

  // New: update only minutes
  function onMinutesChange(minute: number) {
    const updated = setMinutes(scheduledFor, minute);
    setValue('scheduledFor', updated, { shouldValidate: true });
    onPostChange({ ...post, scheduledFor: updated });
  }

  // Generate options for hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate options for minutes (0, 5, 10, ..., 55)
  const minutes = Array.from({ length: 60 }, (_, i) => i * 1);

  // Extract current values
  const selectedHour = scheduledFor.getHours();
  const selectedMinute = scheduledFor.getMinutes();

  // Disable logic for hours/minutes
  function isHourDisabled(hour: number) {
    if (isToday(scheduledFor)) return hour < now.getHours();
    return false;
  }
  function isMinuteDisabled(minute: number) {
    if (isToday(scheduledFor) && selectedHour === now.getHours()) return minute < now.getMinutes();
    return false;
  }

  // Helper: does any selected platform require an attachment?
  function isAttachmentRequired() {
    // Example: TikTok requires a video
    if (!capabilities || selectedPlatforms.length === 0) return false;
    return selectedPlatforms.some((platform) => {
      const cap = capabilities.find((c: any) => c.code === platform);
      // TikTok: requires a video
      if (platform === 'tiktok') return true;
      // Add more platform-specific rules here if needed
      return false;
    });
  }

  // Helper: is attachment missing when required?
  function isAttachmentMissingWhenRequired(attachments: File[]) {
    if (!isAttachmentRequired()) return false;
    // For TikTok, require at least one video file
    if (selectedPlatforms.includes('tiktok')) {
      return !attachments.some((f) => f.type.startsWith('video'));
    }
    // Add more platform-specific checks if needed
    return false;
  }

  const onFormSubmit = async (data: any) => {
    const res = await validatePost({
      content: data.title,
      media: (data.attachments || []).map((f: File) => ({ type: f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'other' })),
      channels: post.channels
        .map(cid => {
          const channel = (channels || []).find((c: Channel) => c.id === cid);
          return channel?.platformId;
        })
        .filter((id): id is string => Boolean(id)),
    });
    if (res.errors && Object.keys(res.errors).length > 0) {
      Object.entries(res.errors).forEach(([platform, errs]) => {
        (errs as string[]).forEach((err) => setError('title', { type: 'manual', message: `[${platform}] ${err}` }));
      });
      return;
    }
    await handleSubmitPost(data.attachments);
  };

  async function handleSubmitPost(attachments: File[]) {
    try {
      await Promise.all(
        post.channels.map((channelId) => {
          const channel = (channels || []).find((c: Channel) => c.id === channelId);
          return schedulePost({
            content: post.title,
            mediaUrls: [], // TODO: Add media upload support
            scheduledFor: post.scheduledFor.toISOString(),
            channelId: channel?.id, // Ensure this is a UUID
            attachments, // send all attachment data
          });
        })
      );
      onSubmit();
      return true;
    } catch (error) {
      console.error('Failed to schedule posts:', error);
      return false;
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Post' : 'Schedule Post'}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Content <span className="text-red-500">*</span></label>
          <textarea
            className="w-full rounded-md border p-2 text-sm"
            rows={4}
            value={post.title}
            maxLength={maxTextLength}
            {...register('title', { required: true })}
            onChange={(e) =>
              onPostChange({
                ...post,
                title: e.target.value,
              })
            }
            placeholder="What's on your mind?"
          />
          <div className="text-xs text-muted-foreground">
            {post.title.length}/{maxTextLength} characters
          </div>
          {errors.title && (
            <div className="text-xs text-red-500 mt-1">
              {Array.isArray(errors.title)
                ? errors.title.map((err, idx) => <div key={idx}>{err.message}</div>)
                : errors.title.message}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Channels <span className="text-red-500">*</span></label>
          <ChannelSelector
            selectedChannels={post.channels}
            onChannelSelect={(channelId) => {
              const channels = post.channels.includes(channelId)
                ? post.channels.filter((id) => id !== channelId)
                : [...post.channels, channelId];
              onPostChange({
                ...post,
                channels,
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Schedule Date <span className="text-red-500">*</span></label>
          <DatePicker
            date={scheduledFor}
            onChange={updateSchedule}
            disabled={date => isBefore(startOfDay(date), startOfDay(now))}
          />
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="text-sm font-medium">Hour <span className="text-red-500">*</span></label>
            <select
              className="w-full rounded-md border px-2 py-1 text-sm"
              value={selectedHour}
              onChange={e => onHourChange(Number(e.target.value))}
            >
              {hours.map(hour => (
                <option key={hour} value={hour} disabled={isHourDisabled(hour)}>
                  {hour.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Minute <span className="text-red-500">*</span></label>
            <select
              className="w-full rounded-md border px-2 py-1 text-sm"
              value={selectedMinute}
              onChange={e => onMinutesChange(Number(e.target.value))}
            >
              {minutes.map(min => (
                <option key={min} value={min} disabled={isMinuteDisabled(min)}>
                  {min.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Media upload section */}
        {(allowedMedia.includes('image') || allowedMedia.includes('video')) && (
          <Controller
            name="attachments"
            control={control}
            render={({ field }) => (
              <>
                {allowedMedia.includes('image') && (
                  <FileUploadPicker
                    label="Attach Images"
                    icon={<Image className="h-5 w-5" />}
                    accept="image/*" 
                    multiple
                    disabled={!allowedMedia.includes('image')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
                {allowedMedia.includes('video') && (
                  <FileUploadPicker
                    label="Attach Video"
                    icon={<Video className="h-5 w-5" />}
                    accept="video/*"
                    multiple={false}
                    disabled={!allowedMedia.includes('video')}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
                {/* Show error if required and missing */}
                {isAttachmentMissingWhenRequired(field.value) && (
                  <div className="text-xs text-red-500 mt-1">Attachment required for selected platform(s).</div>
                )}
              </>
            )}
          />
        )}
        <Button
          className="w-full"
          type="submit"
        >
          {isValidating || isScheduling ? 'Validating...' : isEditing ? 'Update Post' : 'Schedule Post'}
        </Button>
      </form>
    </DialogContent>
  );
} 