'use client';
import { useState } from 'react';
import { usePlatforms } from '@/hooks/usePlatforms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Platform {
  code: string;
  name: string;
  icon: string;
  isConnected: boolean;
}

interface ConnectedAccount {
  id: string;
  platformId: string;
  platformUsername: string;
  platform: {
    name: string;
    icon: string;
  };
}

export function PlatformConnections() {
  const {
    platforms,
    connectedAccounts,
    isLoadingPlatforms,
    isLoadingAccounts,
    getAuthUrl,
    disconnectAccount,
  } = usePlatforms();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  const handleConnect = async (platformCode: string) => {
    try {
      setConnectingPlatform(platformCode);
      const authUrl = await getAuthUrl(platformCode);
      window.location.href = authUrl;
    } catch (error) {
      toast.error('Failed to initiate platform connection');
      setConnectingPlatform(null);
    }
  };

  const handleDisconnect = async (channelId: string) => {
    try {
      await disconnectAccount(channelId);
      toast.success('Platform disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect platform');
    }
  };

  if (isLoadingPlatforms || isLoadingAccounts) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {platforms?.map((platform: Platform) => {
        const isConnected = connectedAccounts?.some(
          (account: ConnectedAccount) => account.platformId === platform.code
        );
        const connectedAccount = connectedAccounts?.find(
          (account: ConnectedAccount) => account.platformId === platform.code
        );

        return (
          <Card key={platform.code}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{platform.name}</span>
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant={isConnected ? 'outline' : 'default'}
                className="w-full"
                onClick={() => {
                  if (isConnected && connectedAccount) {
                    handleDisconnect(connectedAccount.id);
                  } else {
                    handleConnect(platform.code);
                  }
                }}
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 