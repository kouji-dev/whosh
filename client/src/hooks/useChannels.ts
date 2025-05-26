import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { channelsService, type ChannelsResponse, type Channel } from "@/services/channels"
import { useToast } from "@/components/ui/use-toast"
import { useCallback } from "react"
import { openPopupFlow } from '@/utils/popup';
import { useAuth } from "@/contexts/AuthContext";
import { useSse } from "@/hooks/useSse";

export function useChannels() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery<ChannelsResponse>({
    queryKey: ["channels"],
    queryFn: () => channelsService.getChannels(),
  })

  // Flatten channels object into an array
  const channels = data?.channels
    ? Object.values(data.channels).flat()
    : []

  const handlePlatformConnected = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["channels"] });
    toast({
      title: "Success",
      description: "Channel connected successfully",
    });
  }, []);

  // Listen for platform-connected events
  useSse('platform-connected', handlePlatformConnected);

  const connectChannel = useCallback(async (platformCode: string) => {
    try {
      const url = await channelsService.connectChannel(platformCode);
      await openPopupFlow(url);
      // No need to manually refresh, SSE will handle it
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to connect channel or popup was closed",
        variant: "destructive",
      })
    }
  }, [toast, queryClient])

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