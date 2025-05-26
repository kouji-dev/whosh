import { SettingsTabsNav } from '@/components/settings/settings-tabs-nav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsTabsNav />
      <div className="mt-6">{children}</div>
    </div>
  );
} 