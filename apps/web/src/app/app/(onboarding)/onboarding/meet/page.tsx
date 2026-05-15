import * as React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { hireFirstAgentAction } from '../actions';

export const metadata = { title: 'Meet your first agent' };

interface PageProps {
  searchParams: Promise<{
    type?: string;
    name?: string;
    desc?: string;
    need?: string | string[];
  }>;
}

/**
 * Step 4 — Meet your first agent.
 *
 * Picks a recommendation from the selected needs:
 *   plan      → Sarah (PM)
 *   design    → Alex
 *   frontend  → Lena
 *   backend   → Marcus
 *   security  → Ryan
 *   marketing → Mia
 *
 * If multiple are selected, Sarah is usually the right first hire (she
 * scopes the project for everyone else). The fallback is also Sarah.
 */
export default async function OnboardingMeetPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const needs = toArray(params.need);
  const recommended = pickFirstAgent(needs);
  const agent = getAgent(recommended);
  const projectLabel = params.name?.trim() || 'your project';

  return (
    <div className="w-full max-w-2xl">
      <WizardStepIndicator current={4} total={4} className="mb-8" />
      <h1 className="font-display text-4xl leading-tight font-medium text-warm-900">
        Meet <em className="text-indigo-600">{agent.name}</em>.
      </h1>
      <p className="mt-3 text-warm-500">
        Based on what you picked, <span className="font-medium">{agent.name}</span> is the right
        first hire — they&rsquo;ll lay the foundation the rest of the team builds on.
      </p>

      <section className="mt-10 flex flex-col gap-5 rounded-lg border border-warm-200 bg-surface-card p-7 shadow-card">
        <div className="flex items-start gap-4">
          <AgentIconWrap agentId={agent.id} size="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl italic text-warm-900">{agent.name}</h2>
              <Badge intent="accent" size="sm">
                {agent.role}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-warm-600">{agent.pitch}</p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {agent.personality.map((trait) => (
                <Badge key={trait} intent="neutral" size="sm">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-md bg-indigo-50/60 p-4 text-sm text-indigo-900">
          <p className="font-medium">What {agent.name} will do for {projectLabel}:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-indigo-900/80">
            <li>Read your description and ask the questions that matter.</li>
            <li>Draft a PRD with goals, users, scope, and milestones.</li>
            <li>Hand off context to the next agent you hire automatically.</li>
          </ul>
        </div>
      </section>

      <form action={hireFirstAgentAction} className="mt-8 flex items-center justify-between gap-3">
        <Link
          href={`/app/onboarding/needs?${new URLSearchParams({
            ...(params.type ? { type: params.type } : {}),
            ...(params.name ? { name: params.name } : {}),
            ...(params.desc ? { desc: params.desc } : {}),
            ...Object.fromEntries(needs.map((n) => ['need', n])),
          }).toString()}`}
          className={buttonVariants({ intent: 'ghost', size: 'md' })}
        >
          Back
        </Link>
        <input type="hidden" name="agentId" value={agent.id} />
        <input type="hidden" name="type" value={params.type ?? 'fresh'} />
        {params.name ? <input type="hidden" name="name" value={params.name} /> : null}
        {params.desc ? <input type="hidden" name="desc" value={params.desc} /> : null}
        {needs.map((n) => (
          <input key={n} type="hidden" name="need" value={n} />
        ))}
        <Button type="submit" intent="primary" size="lg">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Hire {agent.name} &mdash; let&rsquo;s start
        </Button>
      </form>
    </div>
  );
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

const NEED_TO_AGENT: Record<string, AgentId> = {
  plan: 'sarah',
  design: 'alex',
  frontend: 'lena',
  backend: 'marcus',
  security: 'ryan',
  marketing: 'mia',
};

/**
 * If the user picked planning, recommend Sarah — she scopes the project
 * for everyone else. Otherwise pick the first matching agent from the
 * canonical need order, falling back to Sarah.
 */
function pickFirstAgent(needs: string[]): AgentId {
  if (needs.includes('plan') || needs.length === 0) return 'sarah';
  const order = ['design', 'frontend', 'backend', 'security', 'marketing'];
  for (const n of order) {
    if (needs.includes(n) && NEED_TO_AGENT[n]) return NEED_TO_AGENT[n] as AgentId;
  }
  return 'sarah';
}
