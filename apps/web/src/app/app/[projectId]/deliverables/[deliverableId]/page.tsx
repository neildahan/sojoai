import * as React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { AgentIconWrap } from '@/features/agents/components/AgentIconWrap';
import { getAgent, type AgentId } from '@/lib/agents/registry';

export const metadata = { title: 'Deliverable' };

interface PageProps {
  params: Promise<{ projectId: string; deliverableId: string }>;
}

/**
 * /app/[projectId]/deliverables/[deliverableId]
 *
 * Renders one deliverable. Currently looks up the demo set; real reads
 * come from the Deliverable collection once Mongo is wired. We render the
 * Markdown as plain pre-formatted text for now — a proper sanitiser +
 * react-markdown wire-up lands when actual agent outputs flow in.
 */
export default async function DeliverableViewerPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { projectId, deliverableId } = await params;
  const deliverable = DEMO_DELIVERABLES.find((d) => d.id === deliverableId);
  if (!deliverable) {
    notFound();
  }

  const agent = getAgent(deliverable.agentId);

  return (
    <PageWrapper
      eyebrow={`From ${agent.name} · ${deliverable.type}`}
      title={deliverable.title}
      description={deliverable.summary}
      actions={
        <>
          <Link
            href={`/app/${projectId}/deliverables`}
            className={buttonVariants({ intent: 'ghost', size: 'sm' })}
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            All deliverables
          </Link>
          <button
            type="button"
            disabled
            title="Export — coming soon"
            className={buttonVariants({ intent: 'secondary', size: 'sm' })}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Export
          </button>
        </>
      }
      size="narrow"
    >
      <section className="mb-6 flex items-center gap-3 rounded-md border border-warm-200 bg-surface-card/50 p-4">
        <AgentIconWrap agentId={deliverable.agentId} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-warm-700">
            <span className="font-display italic">{agent.name}</span>{' '}
            <span className="text-warm-500">delivered this on</span>{' '}
            <span className="font-mono text-xs">
              {new Date(deliverable.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </p>
        </div>
        <Badge intent="success" size="sm">
          delivered
        </Badge>
      </section>

      <article className="prose-deliverable rounded-lg border border-warm-200 bg-surface-card p-8 shadow-card">
        <pre className="font-sans whitespace-pre-wrap break-words text-sm leading-relaxed text-warm-800">
          {deliverable.body}
        </pre>
      </article>
    </PageWrapper>
  );
}

interface DemoDeliverable {
  id: string;
  title: string;
  type: string;
  agentId: AgentId;
  summary: string;
  body: string;
  createdAt: string;
}

const DEMO_DELIVERABLES: DemoDeliverable[] = [
  {
    id: 'd1',
    title: 'Mango Health — v1 PRD',
    type: 'PRD',
    agentId: 'sarah',
    summary: 'Problem, goals, non-goals, user stories, milestones.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    body: `# Mango Health — v1 PRD

## Problem
Endurance athletes track workouts and nutrition in different apps. Reconciling
how a long run actually affects daily calorie targets is manual, brittle, and
mostly happens in spreadsheets.

## Goals
- Single source of truth for workout output + daily intake.
- Personalised macro targets that update after each session.
- "What can I eat tonight?" — answer in <2 seconds from the home screen.

## Non-goals
- Replacing the user's training plan app.
- Tracking weight loss.

## Users
- Amateur marathoners (primary)
- Cyclists training for events (secondary)

## User stories
- As an athlete, I log a workout in <10 seconds.
- As an athlete, I see my updated macro target on the home screen immediately.
- As an athlete, I get a 6 PM nudge if I'm under-fuelled for tomorrow's session.

## Scope (v1)
- Manual workout entry; Strava import comes in v1.1.
- Three macros (carbs / protein / fat). Sodium tracking is v1.1.
- iOS first; Android in v1.2.

## Milestones
- Week 2 — onboarding + log entry flow shipped.
- Week 4 — daily target engine + home screen.
- Week 6 — push notifications + closed beta.

## Open questions
- Do we surface calorie totals, or only macros? Aesthetics vs. utility tradeoff.
- Where does hydration land — v1 or v1.1?`,
  },
  {
    id: 'd2',
    title: 'Auth + onboarding wireframes',
    type: 'Wireframes',
    agentId: 'alex',
    summary: 'Four screens covering sign-up → first workout log.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    body: `# Onboarding wireframes — annotated

## Screen 1 — Welcome
Single-screen value prop. Two CTAs: "I'm logging today" / "Just trying it out".

## Screen 2 — Sport
Five large tap targets (Running, Cycling, Triathlon, Other, Skip). No keyboard.

## Screen 3 — Weekly volume
Slider 0–20+ hours/week. Used to seed the macro engine and pacing rules.

## Screen 4 — First log
Reaches the home screen with one workout pre-populated as a tutorial.

## Notes
- Skip is always visible. Onboarding is a checklist, not a wall.
- Macros surface only after the first log — postpones the "math" feeling.
- All forms use system fonts at large sizes; Fraunces only for headers.`,
  },
  {
    id: 'd3',
    title: 'Workout ingestion API — draft schema',
    type: 'Backend code',
    agentId: 'marcus',
    summary: 'Idempotent endpoint accepting manual + provider-imported sessions.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    body: `# POST /v1/workouts

Idempotent insert keyed by client-provided idempotencyKey. Reruns from a
flaky network are cheap (same key → existing record).

\`\`\`ts
type WorkoutBody = {
  idempotencyKey: string;          // uuid v4 from the client
  startedAt: string;               // ISO
  durationSeconds: number;         // > 0
  sport: 'run' | 'cycle' | 'tri' | 'other';
  perceivedEffort?: 1 | 2 | 3 | 4 | 5;
  distanceMeters?: number;
  source: 'manual' | 'strava' | 'garmin';
};
\`\`\`

## Returns
\`201 Created\` with the persisted record. Reruns with the same idempotencyKey
return \`200 OK\` and the existing record.

## Errors
- 400 — payload validation (Zod)
- 401 — missing/invalid Clerk session
- 409 — idempotencyKey collision with different payload

## Next
- Strava webhook ingest path (\`/v1/workouts/import\`)
- Rate limit (200/hour/user)`,
  },
];
