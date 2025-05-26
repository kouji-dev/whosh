import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Profile', href: '/settings/profile' },
  { label: 'Channels', href: '/settings/channels' },
  { label: 'Notifications', href: '/settings/notifications' },
];

export function SettingsTabsNav() {
  const pathname = usePathname();
  return (
    <div className="flex gap-4 border-b mb-4">
      {tabs.map(tab => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`pb-2 px-4 border-b-2 transition-colors duration-150 ${pathname === tab.href ? 'border-primary text-primary font-semibold' : 'border-transparent text-muted-foreground'}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
} 