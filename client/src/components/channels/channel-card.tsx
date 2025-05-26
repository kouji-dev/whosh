import { RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Channel } from "@/services/channels"
import { PlatformIcon } from "@/components/ui/platform-icon"
import { platforms } from '@/config/platforms';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ChannelCardProps {
  channel: Channel;
  onSync?: (channelId: string) => void
  onDisconnect?: (channelId: string) => void
}

export function ChannelCard({ channel, onSync, onDisconnect }: ChannelCardProps) {
  const platform = platforms[channel.platformId as keyof typeof platforms];
  const displayName = channel.displayName || channel.username;
  const avatarUrl = channel.profileImage;
  const platformIcon = platform?.icon || 'twitter';
  const platformColor = platform?.color || '#ccc';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div 
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center border-2 border-background"
              style={{ backgroundColor: platformColor }}
            >
              <PlatformIcon platform={platformIcon} className="text-white" size={12} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold">{displayName}</h3>
          </div>
        </div>
        <div className="flex space-x-2">
          {onSync && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSync(channel.id)}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          {onDisconnect && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDisconnect(channel.id)}
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      </div>
      {channel.lastSync && (
        <p className="text-sm text-muted-foreground">
          Last synced: {new Date(channel.lastSync).toLocaleString()}
        </p>
      )}
    </Card>
  )
} 