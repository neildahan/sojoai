import * as React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { WizardStepIndicator } from '@/features/onboarding/components/WizardStepIndicator';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { getAgent, type AgentId } from '@/lib/agents/registry';
import { mapNeedsToTeam } from '@/features/onboarding/lib/recommend';
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
 * Shows the full team derived from the user's picks, with the recommended
 * first hire as the spotlight card and the remaining team as small
 * follow-up badges. This answers two questions users had:
 *   1. Why only one agent? → Hiring is sequential. One leader scopes the
 *      project so the rest have context.
 *   2. Why this specific one? → Priority order in lib/onboarding/recommend.
 *      See FIRST_HIRE_RATIONALE below for the agent-specific reason
 *      shown to the user.
 */
export default async function OnboardingMeetPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const needs = toArray(params.need);
  const team = mapNeedsToTeam(needs);
  const recommended = team[0] ?? 'sarah';
  const rest = team.slice(1);
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
        first hire. {FIRST_HIRE_RATIONALE[recommended]}
      </p>

      {/* Spotlight — recommended first hire */}
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
            <li>Deliver a first draft — then hand off context to whoever you hire next.</li>
            <li>Stay on the project. The brain they build is the same one the rest of the team reads.</li>
          </ul>
        </div>
      </section>

      {/* Team chips — rest of the picked team plus Jamie (auto-included). */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-widest text-warm-500 uppercase">
            Then your team will include
          </span>
          <ArrowRight className="h-3 w-3 text-warm-400" aria-hidden="true" />
        </div>
        <ul className="flex flex-wrap gap-3">
          {rest.map((id) => (
            <li key={id}>
              <TeamMemberBadge agentId={id} />
            </li>
          ))}
          {/* Jamie always-included at the end, with a small Always pill */}
          <li>
            <TeamMemberBadge agentId="jamie" alwaysIncluded />
          </li>
        </ul>
        <p className="mt-3 text-xs text-warm-500">
          {rest.length > 0
            ? `You'll hire each of them from the Hiring Room once ${agent.name}'s first delivery is ready. Jamie joins every team — he runs your daily standup and unblocks work.`
            : `Jamie joins every team automatically — he runs your daily standup and unblocks work. You can hire more specialists from the Hiring Room any time.`}
        </p>
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

function TeamMemberBadge({
  agentId,
  alwaysIncluded = false,
}: {
  agentId: AgentId;
  alwaysIncluded?: boolean;
}): React.ReactElement {
  const a = getAgent(agentId);
  return (
    <span
      title={alwaysIncluded ? 'Joins every team automatically' : undefined}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-desk ${
        alwaysIncluded
          ? 'border-indigo-200 bg-indigo-50/40'
          : 'border-warm-200 bg-surface-card'
      }`}
    >
      <AgentIconWrap agentId={agentId} size="sm" />
      <span className="flex flex-col leading-tight">
        <span className="flex items-center gap-1.5">
          <span className="font-display text-sm italic text-warm-900">{a.name}</span>
          {alwaysIncluded ? (
            <Badge intent="info" size="sm" className="h-4 px-1.5 text-[9px]">
              Always
            </Badge>
          ) : null}
        </span>
        <span className="text-[10px] text-warm-500">{a.role}</span>
      </span>
    </span>
  );
}

/**
 * Per-agent rationale shown under the page title so the user understands
 * WHY this specific agent goes first. Keep it short — one sentence.
 */
const FIRST_HIRE_RATIONALE: Record<AgentId, string> = {
  sarah: "She turns your idea into a plan the rest of the team builds on.",
  alex: "Design comes before code — Lena and Marcus build what Alex draws.",
  lena: "The UI is the most tangible starting point — easy to react to and easy to iterate.",
  marcus: "Backend-first makes sense when your product is built around data, integrations, or APIs.",
  nina: "Testing leads when you're hardening something that already exists.",
  ryan: "Security audit first when the risk surface is the unknown.",
  david: "DevOps leads when shipping reliably is the bottleneck.",
  mia: "Marketing first when distribution is the harder problem than the build.",
  kai: "Social first when the product is the audience itself.",
  jamie: "Coordination first when the team is already in motion.",
};

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * Build the back-to-Step-3 URL preserving every selected need.
 * URLSearchParams.append handles repeated keys (Object.fromEntries does not).
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
