'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6">
        <div className="flex items-center space-x-2">
          <Link href="/" className="text-xl font-bold">
            Tikk
          </Link>
        </div>
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
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="mb-6">
              This Privacy Policy is prepared by Tikk and whose registered address is Tikk ("We") are committed to protecting and preserving the privacy of our visitors when visiting our site or communicating electronically with us.
            </p>

            <p className="mb-6">
              This policy sets out how we process any personal data we collect from you or that you provide to us through our website and social media sites. We confirm that we will keep your information secure and comply fully with all applicable France Data Protection legislation and regulations. Please read the following carefully to understand what happens to personal data that you choose to provide to us, or that we collect from you when you visit our sites. By submitting information you are accepting and consenting to the practices described in this policy.
            </p>

            <h2 className="mb-4 text-2xl font-semibold">Types of information we may collect from you</h2>
            <p className="mb-6">
              We may collect, store and use the following kinds of personal information about individuals who visit and use our website and social media sites:
            </p>
            <p className="mb-6">
              Information you supply to us. You may supply us with information about you by filling in forms on our website or social media. This includes information you provide when you submit a contact/inquiry form. The information you give us may include but is not limited to, your name, address, e-mail address, and phone number.
            </p>

            <h2 className="mb-4 text-2xl font-semibold">How we may use the information we collect</h2>
            <p className="mb-6">We use the information in the following ways:</p>
            <p className="mb-6">
              Information you supply to us. We will use this information:
            </p>
            <ul className="mb-6 list-disc pl-6">
              <li>to provide you with information and/or services that you request from us;</li>
              <li>To contact you to provide the information requested.</li>
            </ul>

            <h2 className="mb-4 text-2xl font-semibold">Disclosure of your information</h2>
            <p className="mb-6">
              Any information you provide to us will either be emailed directly to us or may be stored on a secure server.
            </p>
            <p className="mb-6">
              We do not rent, sell or share personal information about you with other people or non-affiliated companies.
            </p>
            <p className="mb-6">
              We will use all reasonable efforts to ensure that your personal data is not disclosed to regional/national institutions and authorities unless required by law or other regulations.
            </p>
            <p className="mb-6">
              Unfortunately, the transmission of information via the internet is not completely secure. Although we will do our best to protect your personal data, we cannot guarantee the security of your data transmitted to our site; any transmission is at your own risk. Once we have received your information, we will use strict procedures and security features to try to prevent unauthorized access.
            </p>

            <h2 className="mb-4 text-2xl font-semibold">Your rights – access to your personal data</h2>
            <p className="mb-6">
              You have the right to ensure that your personal data is being processed lawfully ("Subject Access Right"). Your subject access right can be exercised in accordance with data protection laws and regulations. Any subject access request must be made in writing to najih.driss73@gmail.com . We will provide your personal data to you within the statutory time frames. To enable us to trace any of your personal data that we may be holding, we may need to request further information from you. If you complain about how we have used your information, you have the right to complain to the Information Commissioner's Office (ICO).
            </p>

            <h2 className="mb-4 text-2xl font-semibold">Changes to our privacy policy</h2>
            <p className="mb-6">
              Any changes we may make to our privacy policy in the future will be posted on this page and, where appropriate, notified to you by e-mail. Please check back frequently to see any updates or changes to our privacy policy.
            </p>

            <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
            <p className="mb-6">
              Questions, comments, and requests regarding this privacy policy are welcomed and should be addressed to najih.driss73@gmail.com.
            </p>
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