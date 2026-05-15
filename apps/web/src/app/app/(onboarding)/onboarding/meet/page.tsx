import * as React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { getAgent } from '@/lib/agents/registry';
import { pickFirstAgent } from '@/features/onboarding/lib/recommend';
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
 *   plan         → Sarah (PM)
 *   design       → Alex
 *   development  → Lena (UI-first default for combined dev)
 *   frontend     → Lena
 *   backend      → Marcus
 *   qa           → Nina
 *   security     → Ryan
 *   marketing    → Mia
 *
 * If multiple are selected, Sarah is usually the right first hire (she
 * scopes the project for everyone else). The fallback is also Sarah.
 * See features/onboarding/lib/recommend.ts for the full priority order.
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
          href={`/app/onboarding/needs?${buildBackQuery(params.type, params.name, params.desc, needs)}`}
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

/**
 * Build the back-to-Step-3 URL preserving every selected need.
 * Using `Object.fromEntries(...)` for repeated keys silently drops all but
 * the last value — caused multi-select state to collapse to a single need
 * when the user clicked Back. URLSearchParams.append handles repeats.
 */
function buildBackQuery(
  type: string | undefined,
  name: string | undefined,
  desc: string | undefined,
  needs: readonly string[],
): string {
  const sp = new URLSearchParams();
  if (type) sp.set('type', type);
  if (name) sp.set('name', name);
  if (desc) sp.set('desc', desc);
  for (const n of needs) sp.append('need', n);
  return sp.toString();
}
