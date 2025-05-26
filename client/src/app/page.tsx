'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart, Calendar, Share2, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    name: 'Content Management',
    description: 'Create, edit, and manage all your social media content in one place.',
    icon: Share2,
  },
  {
    name: 'Smart Scheduling',
    description: 'Schedule posts at optimal times and manage your content calendar.',
    icon: Calendar,
  },
  {
    name: 'Analytics & Insights',
    description: 'Track performance and get detailed insights across all platforms.',
    icon: BarChart,
  },
  {
    name: 'Team Collaboration',
    description: 'Work together with your team and manage permissions effectively.',
    icon: Users,
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">Tikk</span>
        </div>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </Button>
          ) : user ? (
            <Button asChild>
              <Link href="/dashboard">
                Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/pricing">Pricing</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/privacy-policy">Privacy Policy</Link>
              </Button>
              <Button asChild>
                <Link href="/login">
                  Connect
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Manage all your social media in one place
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Streamline your social media workflow, schedule posts, and analyze performance across all your platforms.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {isLoading ? (
                  <Button disabled size="lg">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </Button>
                ) : user ? (
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link href="/login">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Powerful features for social media management
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Take control of your social media presence with our comprehensive suite of tools.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                      <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built by{' '}
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Your Name
            </a>
            . The source code is available on{' '}
            <a
              href="https://github.com/yourusername/tikk"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
} 