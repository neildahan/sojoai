import * as React from 'react';
import { Sparkles, GitBranch } from 'lucide-react';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { ChoiceCard } from '@/features/onboarding/components/ChoiceCard';

export const metadata = { title: 'Start a project' };

/**
 * Step 1 — Start. Fresh idea vs existing project.
 * The two paths diverge on Step 2 (describe vs connect) and rejoin on Step 3.
 */
export default function OnboardingStartPage(): React.ReactElement {
  return (
    <div className="w-full max-w-3xl">
      <WizardStepIndicator current={1} total={4} className="mb-8" />
      <h1 className="font-display text-4xl leading-tight font-medium text-warm-900">
        What are we working on?
      </h1>
      <p className="mt-3 max-w-prose text-warm-500">
        Pick the option that fits. You can always add another project later from home.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <ChoiceCard
          href="/app/onboarding/describe"
          title="Start fresh"
          description="I have an idea but no code yet. Walk me through it from scratch."
          icon={<Sparkles />}
          iconBg="bg-indigo-50"
        />
        <ChoiceCard
          href="/app/onboarding/connect"
          title="Existing project"
          description="I already have code or designs. Bring my team up to speed."
          icon={<GitBranch />}
          iconBg="bg-warm-100"
        />
      </div>
    </div>
  );
}
