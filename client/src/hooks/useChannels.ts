import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { channelsService, type ChannelsResponse, type Channel } from "@/services/channels"
import { useToast } from "@/components/ui/use-toast"
import { useCallback } from "react"

export function useChannels() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<ChannelsResponse>({
    queryKey: ["channels"],
    queryFn: () => channelsService.getChannels(),
  })

  // Flatten channels object into an array
  const channels = data?.channels
    ? Object.values(data.channels).flat()
    : []

  const connectChannel = useCallback(async (platformCode: string) => {
    try {
      const authUrl = await channelsService.getAuthUrl(platformCode)
      window.location.href = authUrl
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get authentication URL",
        variant: "destructive",
      })
    }
  }, [toast])

  const { mutate: syncChannel } = useMutation({
    mutationFn: (channelId: string) => channelsService.syncChannelData(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] })
      toast({
        title: "Success",
        description: "Channel data synced successfully",
      })
    },
  })

  const { mutate: disconnectChannel } = useMutation({
    mutationFn: (channelId: string) => channelsService.disconnectChannel(channelId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] })
      toast({
        title: "Success",
        description: "Channel disconnected successfully",
      })
    },
  })

  return {
    data: channels,
    isLoading,
    error,
    connectChannel,
    syncChannel,
    disconnectChannel,
  }
} 