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
import { useForm } from 'react-hook-form';
import type { Attachment } from '@/services/posts';

interface PostFormData {
  content: string;
  scheduledFor: Date;
  channels: string[];
  attachments: (File | Attachment)[];
}

interface PostFormProps {
  post: PostFormData;
  onPostChange: (post: PostFormData) => void;
  onSubmit: () => void;
  isEditing?: boolean;
}

export function PostForm({ post, onPostChange, onSubmit, isEditing = false }: PostFormProps) {
  console.log('PostForm', post);
  const { mutateAsync: validatePost, isPending: isValidating } = useValidatePost();
  const { mutateAsync: schedulePost, isPending: isScheduling } = useSchedulePost();
  const now = new Date();
  const { data: channels, isLoading: isLoadingChannels } = useChannels();
  const { capabilities, isLoadingCapabilities } = usePlatformCapabilities();

  const { register, handleSubmit, setError, control, formState: { errors, isSubmitting }, setValue, watch, getValues } = useForm<PostFormData>({
    defaultValues: {
      content: post.content,
      channels: post.channels,
      scheduledFor: post.scheduledFor,
      attachments: post.attachments || [],
    },
    values: post
  });

  const currentPost = watch();

  console.log('currentPost', currentPost);

  // Map selected channel IDs to their platform codes
  const selectedPlatforms = (channels || [])
    .filter((c: Channel) => currentPost.channels.includes(c.id))
    .map((c: Channel) => c.platformId);
    
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
    const prev = currentPost.scheduledFor;
    date.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
    setValue('scheduledFor', date, { shouldValidate: true });
    onPostChange({ ...getValues(), scheduledFor: date });
  }

  // New: update only hour
  function onHourChange(hour: number) {
    const updated = setHours(currentPost.scheduledFor, hour);
    setValue('scheduledFor', updated, { shouldValidate: true });
    onPostChange({ ...getValues(), scheduledFor: updated });
  }

  // New: update only minutes
  function onMinutesChange(minute: number) {
    const updated = setMinutes(currentPost.scheduledFor, minute);
    setValue('scheduledFor', updated, { shouldValidate: true });
    onPostChange({ ...getValues(), scheduledFor: updated });
  }

  // Generate options for hours (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  // Generate options for minutes (0, 5, 10, ..., 55)
  const minutes = Array.from({ length: 60 }, (_, i) => i * 1);

  // Extract current values
  const selectedHour = currentPost.scheduledFor.getHours();
  const selectedMinute = currentPost.scheduledFor.getMinutes();

  // Disable logic for hours/minutes
  function isHourDisabled(hour: number) {
    if (isToday(currentPost.scheduledFor)) return hour < now.getHours();
    return false;
  }
  function isMinuteDisabled(minute: number) {
    if (isToday(currentPost.scheduledFor) && selectedHour === now.getHours()) return minute < now.getMinutes();
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
  function isAttachmentMissingWhenRequired(attachments: (File | Attachment)[]) {
    if (!isAttachmentRequired()) return false;
    // For TikTok, require at least one video file
    if (selectedPlatforms.includes('tiktok')) {
      return !attachments.some((f) => isFile(f) ? f.type.startsWith('video') : f.mimetype.startsWith('video'));
    }
    // Add more platform-specific checks if needed
    return false;
  }

  // Helper type guard
  function isFile(obj: File | Attachment): obj is File {
    return obj instanceof File;
  }
  function isAttachment(obj: File | Attachment): obj is Attachment {
    return !isFile(obj);
  }

  // Helper: get preview URL for File or Attachment
  function getAttachmentUrl(att: File | Attachment): string {
    if (att instanceof File) return URL.createObjectURL(att);
    // For server attachments, you may need to adjust the base URL
    return `/api/attachments/${att.id}`;
  }

  // Helper: render preview for File or Attachment
  function renderAttachmentPreview(att: File | Attachment) {
    if (isFile(att)) {
      if (att.type.startsWith('image')) {
        return <img src={getAttachmentUrl(att)} alt={att.name} className="w-16 h-16 object-cover rounded border" />;
      }
      if (att.type.startsWith('video')) {
        return <video src={getAttachmentUrl(att)} className="w-16 h-16 object-cover rounded border" controls />;
      }
      return <span className="block w-16 h-16 flex items-center justify-center text-xs">{att.name}</span>;
    } else {
      if (att.mimetype.startsWith('image')) {
        return <img src={getAttachmentUrl(att)} alt={att.filename} className="w-16 h-16 object-cover rounded border" />;
      }
      return <span className="block w-auto px-1 py-2 flex items-center justify-center text-xs">{att.filename}</span>;
    }
  }

  const onFormSubmit = async (data: PostFormData) => {
    const res = await validatePost({
      content: data.content,
      media: data.attachments.filter(isFile).map((f) => ({ type: f.type.startsWith('image') ? 'image' : f.type.startsWith('video') ? 'video' : 'other' })),
      channels: data.channels
        .map((cid: string) => {
          const channel = (channels || []).find((c: Channel) => c.id === cid);
          return channel?.platformId;
        })
        .filter((id: string | undefined): id is string => Boolean(id)),
    });
    if (res.errors && Object.keys(res.errors).length > 0) {
      Object.entries(res.errors).forEach(([platform, errs]) => {
        (errs as string[]).forEach((err) => setError('content', { type: 'manual', message: `[${platform}] ${err}` }));
      });
      return;
    }
    await handleSubmitPost(data.attachments);
  };

  async function handleSubmitPost(attachments: (File | Attachment)[]) {
    try {
      const data = getValues();
      await Promise.all(
        data.channels.map((channelId: string) => {
          const channel = (channels || []).find((c: Channel) => c.id === channelId);
          return schedulePost({
            content: data.content,
            mediaUrls: [], // TODO: Add media upload support
            scheduledFor: data.scheduledFor.toISOString(),
            channelId: channel?.id, // Ensure this is a UUID
            attachments, // send all attachments (new and existing)
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
            value={currentPost.content}
            maxLength={maxTextLength}
            {...register('content', { required: true })}
            onChange={(e) => {
              setValue('content', e.target.value, { shouldValidate: true });
              onPostChange({ ...getValues(), content: e.target.value });
            }}
            placeholder="What's on your mind?"
          />
          <div className="text-xs text-muted-foreground">
            {(currentPost.content?.length ?? 0)}/{maxTextLength} characters
          </div>
          {errors.content && (
            <div className="text-xs text-red-500 mt-1">
              {Array.isArray(errors.content)
                ? errors.content.map((err, idx) => <div key={idx}>{err.message}</div>)
                : errors.content.message}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Channels <span className="text-red-500">*</span></label>
          <ChannelSelector
            selectedChannels={currentPost.channels}
            onChannelSelect={(channelId) => {
              const newChannels = currentPost.channels.includes(channelId)
                ? currentPost.channels.filter((id: string) => id !== channelId)
                : [...currentPost.channels, channelId];
              setValue('channels', newChannels, { shouldValidate: true });
              onPostChange({ ...getValues(), channels: newChannels });
            }}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Schedule Date <span className="text-red-500">*</span></label>
          <DatePicker
            date={currentPost.scheduledFor}
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
          <>
            {allowedMedia.includes('image') && (
              <FileUploadPicker
                label="Attach Images"
                icon={<Image className="h-5 w-5" />}
                accept="image/*"
                multiple
                disabled={!allowedMedia.includes('image')}
                value={currentPost.attachments?.filter(isFile) || []}
                onChange={(files) => setValue('attachments', [...(currentPost.attachments?.filter(isAttachment) || []), ...files], { shouldValidate: true })}
              />
            )}
            {allowedMedia.includes('video') && (
              <FileUploadPicker
                label="Attach Video"
                icon={<Video className="h-5 w-5" />}
                accept="video/*"
                multiple={false}
                disabled={!allowedMedia.includes('video')}
                value={currentPost.attachments?.filter(isFile) || []}
                onChange={(files) => setValue('attachments', [...(currentPost.attachments?.filter(isAttachment) || []), ...files], { shouldValidate: true })}
              />
            )}
            {/* Show error if required and missing */}
            {isAttachmentMissingWhenRequired(currentPost.attachments || []) && (
              <div className="text-xs text-red-500 mt-1">Attachment required for selected platform(s).</div>
            )}
          </>
        )}
        {/* Preview section for attachments */}
        {currentPost.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {currentPost.attachments.map((att, idx) => (
              <div key={('id' in att ? att.id : (isFile(att) ? att.name : '')) + idx} className="flex relative group bg-muted rounded border">
                {renderAttachmentPreview(att)}
                <button
                  type="button"
                  className="text-black rounded-full text-xs opacity-80 group-hover:opacity-100"
                  onClick={() => setValue('attachments', currentPost.attachments.filter((a: any) => (('id' in att ? a.id !== att.id : isFile(att) ? a.name !== att.name : true))), { shouldValidate: true })}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
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