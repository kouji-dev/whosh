import { SettingsTabsNav } from '@/components/settings/settings-tabs-nav';

export default function SettingsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <SettingsTabsNav />
    </div>
  );
} 