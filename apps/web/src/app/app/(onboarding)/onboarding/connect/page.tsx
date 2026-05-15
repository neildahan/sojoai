import * as React from 'react';
import Link from 'next/link';
import { Github, Figma, BookOpen, Briefcase } from 'lucide-react';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';

export const metadata = { title: 'Connect your stack' };

/**
 * Step 2 (existing path) — Connect.
 * OAuth integrations land in Phase 5. For now: list the integrations,
 * each disabled with "Coming soon", and let the user proceed without
 * connecting. They can wire integrations later from /app/[projectId]/integrations.
 */
export default function OnboardingConnectPage(): React.ReactElement {
  const integrations = [
    { icon: <Github />, label: 'GitHub', desc: 'Sync repo structure and key files.' },
    { icon: <Figma />, label: 'Figma', desc: 'Read components and color tokens.' },
    { icon: <BookOpen />, label: 'Notion', desc: 'Read your existing docs.' },
    { icon: <Briefcase />, label: 'Jira / Linear', desc: 'See open issues.' },
  ];

  return (
    <div className="w-full max-w-2xl">
      <WizardStepIndicator current={2} total={4} className="mb-8" />
      <h1 className="font-display text-4xl leading-tight font-medium text-warm-900">
        Bring your team up to speed.
      </h1>
      <p className="mt-3 text-warm-500">
        Connect what you have. Your agents will read the relevant context before they start. You
        can skip this and wire integrations later.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {integrations.map((it) => (
          <div
            key={it.label}
            className="flex items-start gap-4 rounded-lg border border-warm-200 bg-surface-card p-5 shadow-desk opacity-70"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warm-100 text-warm-700 [&_svg]:h-5 [&_svg]:w-5"
            >
              {it.icon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base italic text-warm-900">{it.label}</h3>
                <Badge intent="warning" size="sm">
                  Soon
                </Badge>
              </div>
              <p className="mt-1 text-xs text-warm-500">{it.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <Link
          href="/app/onboarding/start"
          className={buttonVariants({ intent: 'ghost', size: 'md' })}
        >
          Back
        </Link>
        <Link
          href="/app/onboarding/needs?type=existing"
          className={buttonVariants({ intent: 'primary', size: 'md' })}
        >
          Skip for now
        </Link>
      </div>
    </div>
  );
}
