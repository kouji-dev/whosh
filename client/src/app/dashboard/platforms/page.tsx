import { PlatformConnections } from '@/components/platforms/PlatformConnections';

export default function PlatformsPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Connected Platforms</h1>
        <p className="text-muted-foreground">
          Connect your social media accounts to start managing your content
        </p>
      </div>
      <PlatformConnections />
    </div>
  );
} 