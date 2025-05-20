'use client';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-beige font-sans flex flex-col">
      {/* Navigation Header */}
      <nav className="w-full flex justify-between items-center px-6 py-4 bg-brown text-beige shadow">
        <div className="font-bold text-xl tracking-wide">Magnet</div>
        <div className="flex gap-6">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/login">Login</Link>
          <Link href="/register">Register</Link>
        </div>
      </nav>
      <header className="w-full text-center py-16 bg-primary px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-brown mb-4">Pricing</h1>
          <p className="text-lg text-brown">Simple, transparent pricing for every team.</p>
        </div>
      </header>
      <section className="w-full flex-1 flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          <PlanCard
            name="Free"
            price="$0"
            features={['1 Social Profile', 'Basic Scheduling', 'Basic Analytics']}
            cta="Get Started"
            href="/register"
          />
          <PlanCard
            name="Pro"
            price="$19/mo"
            features={['10 Social Profiles', 'Bulk Scheduling', 'Advanced Analytics', 'Content Calendar']}
            cta="Start Free Trial"
            href="/register"
          />
          <PlanCard
            name="Team"
            price="$49/mo"
            features={['Unlimited Profiles', 'Team Collaboration', 'Approval Workflows', 'Priority Support']}
            cta="Start Free Trial"
            href="/register"
          />
        </div>
      </section>
    </div>
  );
}

function PlanCard({
  name,
  price,
  features,
  cta,
  href,
}: {
  name: string;
  price: string;
  features: string[];
  cta: string;
  href: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full">
      <div className="text-2xl font-bold text-brown mb-2">{name}</div>
      <div className="text-3xl font-bold text-accent mb-4">{price}</div>
      <ul className="mb-6 text-brown">
        {features.map((f) => (
          <li key={f} className="mb-1">• {f}</li>
        ))}
      </ul>
      <Link href={href}>
        <button className="btn btn-primary w-full">{cta}</button>
      </Link>
    </div>
  );
} 