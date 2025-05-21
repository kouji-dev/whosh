'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    price: { monthly: '$0' },
    description: 'Perfect for individuals just getting started.',
    features: [
      '1 Social Profile',
      'Basic Post Scheduling',
      'Basic Analytics',
      'Community Support',
      '1 Team Member',
    ],
    cta: 'Get Started',
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    price: { monthly: '$19' },
    description: 'Everything you need for growing your social presence.',
    features: [
      '10 Social Profiles',
      'Advanced Post Scheduling',
      'Detailed Analytics',
      'Priority Support',
      '5 Team Members',
      'Content Calendar',
      'Bulk Scheduling',
      'Best Time to Post',
    ],
    cta: 'Start Free Trial',
    mostPopular: true,
  },
  {
    name: 'Team',
    id: 'tier-team',
    price: { monthly: '$49' },
    description: 'Advanced features for teams and agencies.',
    features: [
      'Unlimited Social Profiles',
      'Enterprise Analytics',
      '24/7 Priority Support',
      'Unlimited Team Members',
      'Advanced Workflows',
      'Custom Reports',
      'API Access',
      'White Label Reports',
    ],
    cta: 'Start Free Trial',
    mostPopular: false,
  },
];

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-xl font-bold">
            Magnet
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <Button asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/pricing">Pricing</Link>
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
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Choose the perfect plan for your needs. All plans include a 14-day free trial.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`flex flex-col justify-between rounded-3xl bg-card p-8 ring-1 ring-gray-200 xl:p-10 ${
                  tier.mostPopular ? 'relative' : ''
                }`}
              >
                {tier.mostPopular && (
                  <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-sm font-semibold text-primary-foreground">
                    Most popular
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between gap-x-4">
                    <h2 className="text-lg font-semibold leading-8">{tier.name}</h2>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-4xl font-bold tracking-tight">{tier.price.monthly}</span>
                    <span className="text-sm font-semibold leading-6">/month</span>
                  </p>
                  <ul role="list" className="mt-8 space-y-3 text-sm leading-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3">
                        <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  asChild
                  className={`mt-8 ${tier.mostPopular ? '' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                >
                  <Link href={user ? '/dashboard' : '/register'}>
                    {tier.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-32 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl rounded-3xl bg-muted/50 p-8 text-center ring-1 ring-gray-200 sm:p-10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Need a custom plan?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Contact us for a custom solution tailored to your specific needs.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg">
                <Link href="/contact">
                  Contact Sales
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
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
              href="https://github.com/yourusername/whosh"
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