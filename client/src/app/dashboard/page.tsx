'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Users, Share2, Calendar, LucideIcon } from 'lucide-react';

interface Stat {
  name: string;
  value: string;
  icon: LucideIcon;
}

const stats: Stat[] = [
  {
    name: 'Total Posts',
    value: '0',
    icon: Share2,
  },
  {
    name: 'Connected Accounts',
    value: '0',
    icon: Users,
  },
  {
    name: 'Scheduled Posts',
    value: '0',
    icon: Calendar,
  },
  {
    name: 'Total Engagement',
    value: '0',
    icon: BarChart,
  },
];

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your social media dashboard
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 