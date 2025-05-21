import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Channel } from "@/services/channels"

interface ChannelCardProps {
  channel: Channel
  onSync?: (channelId: string) => void
  onDisconnect?: (channelId: string) => void
}

export function ChannelCard({ channel, onSync, onDisconnect }: ChannelCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: channel.platform.color }}
          >
            <i className={`fab fa-${channel.platform.icon} text-white text-xl`}></i>
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