import * as React from 'react';
import Link from 'next/link';
import {
  ClipboardList,
  PenTool,
  Monitor,
  Server,
  Shield,
  Megaphone,
} from 'lucide-react';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { NeedToggleCard } from '@/features/onboarding/components/NeedToggleCard';
import { Button, buttonVariants } from '@/components/ui/button';
import { submitNeedsAction } from '../actions';

export const metadata = { title: 'What do you need' };

interface PageProps {
  searchParams: Promise<{ type?: string; name?: string; desc?: string; need?: string | string[] }>;
}

const NEEDS = [
  {
    value: 'plan',
    title: 'A plan',
    description: 'PRD, user stories, milestones.',
    icon: <ClipboardList />,
    iconBg: 'bg-indigo-50',
  },
  {
    value: 'design',
    title: 'Design',
    description: 'Wireframes, components, tokens.',
    icon: <PenTool />,
    iconBg: 'bg-amber-50',
  },
  {
    value: 'frontend',
    title: 'Frontend',
    description: 'Clean, accessible UI code.',
    icon: <Monitor />,
    iconBg: 'bg-emerald-50',
  },
  {
    value: 'backend',
    title: 'Backend',
    description: 'APIs, schemas, scale-aware logic.',
    icon: <Server />,
    iconBg: 'bg-green-50',
  },
  {
    value: 'security',
    title: 'Security',
    description: 'Audit, hardening, threat model.',
    icon: <Shield />,
    iconBg: 'bg-rose-50',
  },
  {
    value: 'marketing',
    title: 'Marketing',
    description: 'Positioning, launch, copy.',
    icon: <Megaphone />,
    iconBg: 'bg-fuchsia-50',
  },
] as const;

/**
 * Step 3 — What do you need?
 * Multi-select. Defaults to "plan" (Sarah is almost always the right first hire).
 */
export default async function OnboardingNeedsPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const carriedNeeds = toArray(params.need);
  const preselected = carriedNeeds.length > 0 ? new Set(carriedNeeds) : new Set(['plan']);

  const backHref =
    params.type === 'existing' ? '/app/onboarding/connect' : '/app/onboarding/describe';

  return (
    <div className="w-full max-w-3xl">
      <WizardStepIndicator current={3} total={4} className="mb-8" />
      <h1 className="font-display text-4xl leading-tight font-medium text-warm-900">
        What do you need help with?
      </h1>
      <p className="mt-3 text-warm-500">
        Pick anything that fits — you can hire more agents later. We&rsquo;ll recommend the
        first one to start with.
      </p>

      <form action={submitNeedsAction} className="mt-10 flex flex-col gap-5">
        {/* Carry prior-step state */}
        <input type="hidden" name="type" value={params.type ?? 'fresh'} />
        {params.name ? <input type="hidden" name="name" value={params.name} /> : null}
        {params.desc ? <input type="hidden" name="desc" value={params.desc} /> : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {NEEDS.map((n) => (
            <NeedToggleCard
              key={n.value}
              value={n.value}
              title={n.title}
              description={n.description}
              icon={n.icon}
              iconBg={n.iconBg}
              defaultChecked={preselected.has(n.value)}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Link href={backHref} className={buttonVariants({ intent: 'ghost', size: 'md' })}>
            Back
          </Link>
          <Button type="submit" intent="primary" size="md">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}
