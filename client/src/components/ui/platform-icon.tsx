import { PlatformIcons } from './platform-icons';
import type { PlatformIcon as PlatformIconType } from './platform-icons';
import { cn } from '@/lib/utils';

interface PlatformIconProps {
  platform: PlatformIconType;
  className?: string;
  size?: number;
}

export function PlatformIcon({ platform, className, size = 24 }: PlatformIconProps) {
  const Icon = PlatformIcons[platform];
  return <Icon className={cn('text-current', className)} size={size} />;
} 