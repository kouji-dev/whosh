import { LucideIcon } from 'lucide-react';

export interface Platform {
  platform: string;
  accountId: string;
  accountName: string;
  profileImage?: string;
  lastSync?: string;
  isValid: boolean;
}

export interface PlatformConfig {
  name: string;
  code: string;
  icon: LucideIcon;
} 