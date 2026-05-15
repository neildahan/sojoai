import * as React from 'react';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { DescribeForm } from '@/features/onboarding/components/DescribeForm';

export const metadata = { title: 'Describe your project' };

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

/**
 * Step 2 (fresh path) — Describe.
 * Server shell only — the form lives in `DescribeForm` (client) so it can
 * own the description+name state and call /api/projects/suggest-name.
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
        Describe it the way you&rsquo;d explain it to a friend. Once you&rsquo;ve described it,
        you can name it yourself — or let us suggest a few.
      </p>

      <DescribeForm {...(error ? { error } : {})} />
    </div>
  );
}
