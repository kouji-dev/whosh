'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  BarChart,
  Settings,
  Users,
  Share2,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart,
  },
  {
    name: 'Platforms',
    href: '/dashboard/platforms',
    icon: Share2,
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="hidden lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <Link href="/dashboard" className="text-2xl font-bold text-brown">
              Magnet
            </Link>
          </div>
          <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    'transition-all duration-200 ease-in-out',
                    isActive
                      ? 'bg-gray-100 text-brown'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-6 w-6 flex-shrink-0 transition-transform duration-200 ease-in-out',
                      isActive 
                        ? 'text-brown' 
                        : 'text-gray-400 group-hover:text-gray-500 group-hover:scale-110'
                    )}
                    aria-hidden="true"
                  />
                  <span className="transition-transform duration-200 ease-in-out group-hover:translate-x-1">
                    {item.name}
                  </span>
                  {!isActive && (
                    <span className="absolute inset-0 rounded-md bg-gray-100 opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-10" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div>
              <img
                className="inline-block h-10 w-10 rounded-full"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}`}
                alt=""
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user?.name}</p>
              <p className="text-xs font-medium text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 