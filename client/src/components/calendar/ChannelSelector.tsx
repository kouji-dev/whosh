'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PlatformIcon } from '@/components/ui/platform-icon';
import { useRouter } from 'next/navigation';
import { useChannels } from '@/hooks/useChannels';

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
  const { data: channels, isLoading } = useChannels();
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      {isLoading ? (
        <span>Loading channels...</span>
      ) : channels.length === 0 ? (
        <span>No channels connected.</span>
      ) : (
        channels.map((channel) => (
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
            <PlatformIcon platform={channel.platformId as any} size={16} />
            {channel.displayName || channel.username}
            {selectedChannels.includes(channel.id) && (
              <Check className="h-4 w-4" />
            )}
          </Button>
        ))
      )}
      <Button
        variant="secondary"
        size="sm"
        className="flex items-center gap-2"
        onClick={() => router.push('/dashboard/channels')}
      >
        + Connect New Platform
      </Button>
    </div>
  );
} 