import * as React from 'react';
import Link from 'next/link';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { submitDescribeAction } from '../actions';

export const metadata = { title: 'Describe your project' };

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

/**
 * Step 2 (fresh path) — Describe.
 * Server form → submitDescribeAction → /app/onboarding/needs with params.
 */
export default async function OnboardingDescribePage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-2xl">
      <WizardStepIndicator current={2} total={4} className="mb-8" />
      <h1 className="font-display text-4xl leading-tight font-medium text-warm-900">
        Tell us about your project.
      </h1>
      <p className="mt-3 text-warm-500">
        Don&rsquo;t worry about being technical. Describe it the way you&rsquo;d explain it to a
        friend.
      </p>

      <form action={submitDescribeAction} className="mt-10 flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-warm-700">Project name</span>
          <Input
            name="name"
            placeholder="Mango Health"
            required
            maxLength={80}
            autoComplete="off"
            invalid={error === 'missing'}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-warm-700">What does it do?</span>
          <Textarea
            name="description"
            placeholder="A diet-tracking app for endurance athletes that learns from each workout…"
            required
            rows={5}
            maxLength={500}
            invalid={error === 'missing'}
          />
          <span className="font-mono text-[10px] text-warm-400">Up to 500 characters.</span>
        </label>

        {error === 'missing' ? (
          <p role="alert" className="text-sm text-status-blocked">
            Both name and description are required.
          </p>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-3">
          <Link
            href="/app/onboarding/start"
            className={buttonVariants({ intent: 'ghost', size: 'md' })}
          >
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
