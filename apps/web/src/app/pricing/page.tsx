import * as React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const metadata = {
  title: 'Pricing',
  description: 'Free to start. Pay only when your team gets big.',
};

interface Tier {
  name: string;
  price: string;
  period?: string;
  description: string;
  highlight?: boolean;
  cta: string;
  ctaHref: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'For tinkering. One project, two agents, a few messages.',
    cta: 'Start free',
    ctaHref: '/sign-up',
    features: ['1 project', '2 agents', '100 messages / month', 'Standard models', 'Markdown export'],
  },
  {
    name: 'Starter',
    price: '$19',
    period: '/mo',
    description: 'A small team for a small project.',
    cta: 'Start Starter',
    ctaHref: '/sign-up?plan=starter',
    features: [
      '3 projects',
      '5 agents',
      '1,000 messages / month',
      'Smart model routing',
      'GitHub + Figma',
    ],
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    description: 'The whole team. For founders shipping seriously.',
    highlight: true,
    cta: 'Start Pro',
    ctaHref: '/sign-up?plan=pro',
    features: [
      '10 projects',
      'All 10 agents',
      '5,000 messages / month',
      'Opus on heavy tasks',
      'Notion / GDrive export',
      'Daily standup digest',
    ],
  },
  {
    name: 'Team',
    price: '$99',
    period: '/mo',
    description: 'For studios and operators running many bets.',
    cta: 'Start Team',
    ctaHref: '/sign-up?plan=team',
    features: [
      'Unlimited projects',
      'All 10 agents',
      'Unlimited messages',
      'Priority models',
      'All integrations',
      'Slack digest',
    ],
  },
];

export default function PricingPage(): React.ReactElement {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <header className="mx-auto max-w-2xl text-center">
        <Badge intent="accent" size="sm">
          Pricing
        </Badge>
        <h1 className="mt-4 font-display text-5xl leading-tight font-medium text-warm-900">
          Pay for the team, not the tool.
        </h1>
        <p className="mt-4 text-warm-500">
          Sojo AI routes each task to the right model so you don&rsquo;t burn Opus tokens on a
          standup summary. We pass the savings on as bigger message budgets.
        </p>
      </header>

      <section className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((t) => (
          <article
            key={t.name}
            className={cn(
              'flex flex-col gap-5 rounded-lg border bg-surface-card p-6 shadow-desk',
              t.highlight
                ? 'border-indigo-400 ring-1 ring-indigo-400/40 shadow-card'
                : 'border-warm-200',
            )}
          >
            <header>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl italic text-warm-900">{t.name}</h2>
                {t.highlight ? (
                  <Badge intent="accent" size="sm">
                    Most popular
                  </Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-warm-500">{t.description}</p>
            </header>
            <p className="font-display text-4xl text-warm-900">
              {t.price}
              {t.period ? <span className="text-base text-warm-500">{t.period}</span> : null}
            </p>
            <ul className="flex flex-col gap-2 text-sm text-warm-700">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-active"
                    aria-hidden="true"
                  />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={t.ctaHref}
              className={cn(
                'mt-auto w-full text-center',
                buttonVariants({
                  intent: t.highlight ? 'primary' : 'secondary',
                  size: 'md',
                }),
              )}
            >
              {t.cta}
            </Link>
          </article>
        ))}
      </section>

      <footer className="mt-16 text-center">
        <p className="text-sm text-warm-500">
          Need something custom?{' '}
          <a href="mailto:hello@sojoai.app" className="text-indigo-600 hover:underline">
            hello@sojoai.app
          </a>
        </p>
      </footer>
    </main>
  );
}
