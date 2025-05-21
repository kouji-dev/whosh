'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlatformIcon } from '@/components/ui/platform-icon';

interface Channel {
  id: string;
  name: string;
  type: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube';
  icon: string;
}

interface ChannelSelectorProps {
  selectedChannels: string[];
  onChannelSelect: (channelId: string) => void;
}

export function ChannelSelector({ selectedChannels, onChannelSelect }: ChannelSelectorProps) {
  const channels: Channel[] = [
    { id: 'twitter', name: 'Twitter', type: 'twitter', icon: 'twitter' },
    { id: 'facebook', name: 'Facebook', type: 'facebook', icon: 'facebook' },
    { id: 'instagram', name: 'Instagram', type: 'instagram', icon: 'instagram' },
    { id: 'linkedin', name: 'LinkedIn', type: 'linkedin', icon: 'linkedin' },
    { id: 'tiktok', name: 'TikTok', type: 'tiktok', icon: 'tiktok' },
    { id: 'youtube', name: 'YouTube', type: 'youtube', icon: 'youtube' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {channels.map((channel) => (
        <Button
          key={channel.id}
          variant={selectedChannels.includes(channel.id) ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChannelSelect(channel.id)}
          className={cn(
            'flex items-center gap-2',
            selectedChannels.includes(channel.id) && 'bg-primary text-primary-foreground'
          )}
        >
          <PlatformIcon platform={channel.type} size={16} />
          {channel.name}
          {selectedChannels.includes(channel.id) && (
            <Check className="h-4 w-4" />
          )}
        </Button>
      ))}
    </div>
  );
} 