'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  type: 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'tiktok' | 'pinterest';
  icon: string;
}

const channels: Channel[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    type: 'twitter',
    icon: '𝕏',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    type: 'facebook',
    icon: 'f',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    type: 'instagram',
    icon: '📸',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    type: 'linkedin',
    icon: 'in',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    type: 'tiktok',
    icon: '♪',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    type: 'pinterest',
    icon: '📌',
  },
];

interface ChannelSelectorProps {
  selectedChannels: string[];
  onChannelSelect: (channelId: string) => void;
}

export function ChannelSelector({
  selectedChannels,
  onChannelSelect,
}: ChannelSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {channels.map((channel) => (
        <Button
          key={channel.id}
          variant="outline"
          size="sm"
          className={cn(
            'relative h-8 w-8 p-0',
            selectedChannels.includes(channel.id) && 'border-primary'
          )}
          onClick={() => onChannelSelect(channel.id)}
        >
          <span className="text-lg">{channel.icon}</span>
          {selectedChannels.includes(channel.id) && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              <Check className="h-3 w-3" />
            </span>
          )}
        </Button>
      ))}
    </div>
  );
} 