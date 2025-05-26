'use client';

import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useChannels } from "@/hooks/useChannels"
import { usePlatforms } from "@/hooks/usePlatforms"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChannelCard } from "@/components/channels/channel-card"
import { Channel } from "@/services/channels"

export default function ChannelsPage() {
  const router = useRouter()
  const { data: channels, isLoading, error, syncChannel, disconnectChannel, connectChannel } = useChannels()
  const { platforms, isLoadingPlatforms } = usePlatforms();

  if (isLoading || isLoadingPlatforms) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error loading channels</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Channels</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Channel
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {platforms?.map((platform) => (
              <DropdownMenuItem key={platform.code} onClick={() => connectChannel(platform.code)}>
                {platform.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {channels?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No channels connected</h2>
          <p className="text-muted-foreground mb-4">
            Connect your social media channels to get started
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Channel
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {platforms?.map((platform) => (
                <DropdownMenuItem key={platform.code} onClick={() => connectChannel(platform.code)}>
                  {platform.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {channels?.map((channel: Channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onSync={syncChannel}
              onDisconnect={disconnectChannel}
            />
          ))}
        </div>
      )}
    </div>
  )
} 