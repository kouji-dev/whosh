import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Channel } from "@/services/channels"
import { PlatformIcon } from "@/components/ui/platform-icon"
import type { PlatformIcon as PlatformIconType } from "@/components/ui/platform-icons"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface ChannelCardProps {
  channel: Channel & {
    platform: {
      icon: PlatformIconType;
      color: string;
    };
    avatarUrl?: string;
  };
  onSync?: (channelId: string) => void
  onDisconnect?: (channelId: string) => void
}

export function ChannelCard({ channel, onSync, onDisconnect }: ChannelCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={channel.avatarUrl} alt={channel.accountName} />
              <AvatarFallback>{channel.accountName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div 
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center border-2 border-background"
              style={{ backgroundColor: channel.platform.color }}
            >
              <PlatformIcon platform={channel.platform.icon} className="text-white" size={12} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold">{channel.accountName}</h3>
            <p className="text-sm text-muted-foreground">
              {channel.isParentConnection ? "Main Account" : "Connected Page"}
            </p>
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
              Disconnect
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