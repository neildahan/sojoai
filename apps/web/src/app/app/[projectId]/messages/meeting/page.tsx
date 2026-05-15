import * as React from 'react';
import Link from 'next/link';
import { Play, ArrowLeft } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import {
  StandupCard,
  type StandupStatus,
} from '@/features/standups/components/StandupCard';
import { getAgent, type AgentId } from '@/lib/agents/registry';

export const metadata = { title: 'Standup' };

interface PageProps {
  params: Promise<{ projectId: string }>;
}

/**
 * /app/[projectId]/messages/meeting — manual standup.
 *
 * Two delivery modes (per the product plan):
 *   1. **Manual** — user clicks "Start meeting" on Team Room; each agent
 *      responds in sequence with their current status. This page renders
 *      the result.
 *   2. **Automated daily** — Jamie runs at the configured `standupTime`
 *      (Phase 5 cron) and emails the digest via Resend.
 *
 * Until Mongo + Anthropic are wired, the demo project shows a hardcoded
 * standup so the layout is browsable. Real standups read Task state for
 * each agent and ask them for a 1–3 line update via the Claude router.
 */
export default async function StandupPage({ params }: PageProps): Promise<React.ReactElement> {
  const { projectId } = await params;

  // TODO(phase-3.2): fetch latest StandupSummary for this project. If absent,
  // queue a fresh run via lib/ai/router (Jamie compiles) and render once ready.
  const date = new Date();
  const reports: Array<{
    agentId: AgentId;
    update: string;
    status: StandupStatus;
    blocker?: string;
  }> = [
    {
      agentId: 'sarah',
      update:
        'Wrapped the v1 PRD draft last night. Alex has it; will iterate on user stories after our next sync.',
      status: 'on-track',
    },
    {
      agentId: 'alex',
      update:
        'Reading the PRD now. Plan to ship onboarding wireframes by end of day; keeping the dashboard layout flexible so Lena doesn\'t fight responsive.',
      status: 'on-track',
    },
    {
      agentId: 'lena',
      update:
        'Scaffolded the dashboard route; pairing with Marcus on the API contract so I don\'t guess at the data shape.',
      status: 'in-discussion',
    },
    {
      agentId: 'marcus',
      update:
        'Drafting the workout-ingestion endpoint. Keeping it idempotent so reruns are cheap. Sharing schema with Lena today.',
      status: 'on-track',
    },
    {
      agentId: 'ryan',
      update:
        'OAuth scopes in the existing repo look broader than needed — flagging for the user. Audit doc coming after I have an answer.',
      status: 'blocked',
      blocker: 'Needs your input — see the comment on the OAuth audit task.',
    },
  ];

  const blockers = reports.filter((r) => r.status === 'blocked');

  return (
    <PageWrapper
      eyebrow={`Standup · ${formatDate(date)}`}
      title="Standup"
      description="Each agent's current status, compiled by Jamie. Triggered manually now — automated daily once standup time + Resend are wired."
      actions={
        <>
          <Link
            href={`/app/${projectId}/team-room`}
            className={buttonVariants({ intent: 'ghost', size: 'sm' })}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to team
          </Link>
          <button
            type="button"
            disabled
            title="Re-runs the standup. Wires up with the Claude API."
            className={buttonVariants({ intent: 'secondary', size: 'sm' })}
          >
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Run again
          </button>
        </>
      }
    >
      {/* Jamie's compiled summary */}
      <section className="mb-8 flex items-start gap-4 rounded-lg border border-indigo-200 bg-indigo-50/40 p-5">
        <AgentIconWrap agentId="jamie" size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-base italic text-warm-900">{getAgent('jamie').name}</h2>
            <Badge intent="info" size="sm">
              compiled
            </Badge>
          </div>
          <p className="mt-2 text-sm text-warm-700">
            Five updates today. PRD is in Alex&rsquo;s hands and design starts today; Lena and Marcus
            are aligning on the API contract before either ships. One blocker on the security side
            that needs your input — see Ryan&rsquo;s note. Everyone else is on track.
          </p>
          {blockers.length > 0 ? (
            <p className="mt-2 text-xs font-medium text-status-blocked">
              {blockers.length} blocker{blockers.length === 1 ? '' : 's'} waiting on you.
            </p>
          ) : null}
        </div>
      </section>

      {/* Per-agent reports */}
      <ol className="flex flex-col gap-3">
        {reports.map((r) => (
          <li key={r.agentId}>
            <StandupCard
              agentId={r.agentId}
              update={r.update}
              status={r.status}
              {...(r.blocker ? { blocker: r.blocker } : {})}
            />
          </li>
        ))}
      </ol>
    </PageWrapper>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
